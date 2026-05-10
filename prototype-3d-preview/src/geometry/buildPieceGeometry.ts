import { Shape, Box2, Vector2, Path } from 'three';
import type {
  LayerContent,
  LayerSpec,
  PieceGeometry,
  PieceSpec,
  ResolvedLayerGeometry,
} from '../types';
import { loadFont } from './fontCache';
import { textToShapes } from './textToShapes';
import { offsetOutlineFromShapes } from './offsetOutline';
import { heartShape } from './heartShape';

/**
 * Build the resolved geometry for a piece, in millimetre coordinates.
 *
 * The piece is composed at world coordinates and then recentred so the bounding
 * box of the base layer is symmetric around the origin. Per-layer translation
 * (and the recentring offset) is carried as `offsetMm` on the resolved layer
 * and applied at render time via mesh.position — this keeps Shape geometry
 * untouched and preserves curve fidelity through ExtrudeGeometry.
 */
export async function buildPieceGeometry(
  piece: PieceSpec,
  borderThicknessMm: number,
  customText: Record<string, string> = {},
): Promise<PieceGeometry> {
  // 1. Resolve each layer's intrinsic shape geometry (positioned at origin).
  const layerShapes = new Map<string, Shape[]>();
  for (const layer of piece.layers) {
    layerShapes.set(layer.id, await resolveLayerContent(layer, customText[layer.id]));
  }

  // 2. Build the offset source = the union of foreground/accent shapes
  //    translated by their per-layer offsetMm. We translate by sampling and
  //    rebuilding — acceptable here because the offset engine resamples anyway.
  const offsetSourceLayers = piece.unifyBase
    ? piece.layers
    : piece.layers.filter((l) => l.id === piece.baseDerivedFromLayerId);
  const offsetSource: Shape[] = offsetSourceLayers.flatMap((l) => {
    const offset = l.offsetMm ?? { x: 0, y: 0 };
    return (layerShapes.get(l.id) ?? []).map((s) => translateShape(s, offset.x, offset.y));
  });

  // 3. Base shapes via the offset-outline engine.
  const baseShapes = offsetOutlineFromShapes(offsetSource, borderThicknessMm);

  // 4. Compute centring offset from the base bounds. We centre on X but
  //    sit the piece on Y=0 (the floor) so descenders/flourishes don't dip
  //    below the floor.
  const baseBounds = unionBoundingBox(baseShapes);
  const cx = (baseBounds.min.x + baseBounds.max.x) / 2;
  const cy = baseBounds.min.y; // shift so min.y sits at world y=0
  const width = baseBounds.max.x - baseBounds.min.x;
  const height = baseBounds.max.y - baseBounds.min.y;

  // 5. Build the resolved layer list — Shapes left untouched, recentring
  //    applied via per-layer offsetMm.
  const ordered = [...piece.layers].sort((a, b) => a.zStackOrder - b.zStackOrder);

  const layers: ResolvedLayerGeometry[] = [];

  layers.push({
    layerId: 'base',
    kind: 'base',
    shapes: baseShapes,
    thicknessMm: piece.baseThicknessMm,
    zStackOrder: 0,
    offsetMm: { x: -cx, y: -cy },
  });

  for (const layer of ordered) {
    const off = layer.offsetMm ?? { x: 0, y: 0 };
    layers.push({
      layerId: layer.id,
      kind: layer.kind,
      shapes: layerShapes.get(layer.id) ?? [],
      thicknessMm: layer.thicknessMm,
      zStackOrder: layer.zStackOrder,
      offsetMm: { x: off.x - cx, y: off.y - cy },
    });
  }

  const totalDepth = piece.baseThicknessMm + ordered.reduce((acc, l) => acc + l.thicknessMm, 0);

  return {
    pieceId: piece.id,
    layers,
    bounds: { width, height, depth: totalDepth },
  };
}

async function resolveLayerContent(layer: LayerSpec, textOverride?: string): Promise<Shape[]> {
  if (layer.content.type === 'text' && textOverride !== undefined && textOverride.length > 0) {
    return resolveContent({ ...layer.content, text: textOverride });
  }
  return resolveContent(layer.content);
}

async function resolveContent(content: LayerContent): Promise<Shape[]> {
  if (content.type === 'text') {
    const font = await loadFont(content.fontUrl);
    const { shapes } = textToShapes(font, content.text, content.fontSize);
    return shapes;
  }
  if (content.type === 'shape' && content.shape === 'heart') {
    return [heartShape(content.size)];
  }
  throw new Error(`Unsupported layer content: ${JSON.stringify(content)}`);
}

function translateShape(shape: Shape, dx: number, dy: number): Shape {
  const out = new Shape();
  const pts = shape.getPoints(32);
  if (pts.length === 0) return out;
  out.moveTo(pts[0].x + dx, pts[0].y + dy);
  for (let i = 1; i < pts.length; i++) {
    out.lineTo(pts[i].x + dx, pts[i].y + dy);
  }
  out.closePath();
  for (const hole of shape.holes) {
    const hp = hole.getPoints(32);
    if (hp.length === 0) continue;
    const h = new Path();
    h.moveTo(hp[0].x + dx, hp[0].y + dy);
    for (let i = 1; i < hp.length; i++) {
      h.lineTo(hp[i].x + dx, hp[i].y + dy);
    }
    h.closePath();
    out.holes.push(h);
  }
  return out;
}

function unionBoundingBox(shapes: Shape[]): Box2 {
  const box = new Box2();
  for (const s of shapes) {
    const pts = s.getPoints(16);
    for (const p of pts) box.expandByPoint(new Vector2(p.x, p.y));
  }
  if (!isFinite(box.min.x)) {
    box.min.set(0, 0);
    box.max.set(0, 0);
  }
  return box;
}
