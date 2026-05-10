import { Shape, Path } from 'three';
import {
  ClipperOffset,
  Clipper,
  ClipType,
  PolyType,
  PolyFillType,
  JoinType,
  EndType,
  type Paths,
} from 'clipper-lib';

const SCALE = 1000; // sub-millimetre precision

interface PolySet {
  outers: { x: number; y: number }[][];
  holes: { x: number; y: number }[][];
}

/**
 * Compute the offset-outline base layer geometry for a set of foreground
 * shapes. Steps:
 *   1. Sample each Shape (and its holes) into polygon outlines.
 *   2. Use Clipper's polygon offset (Minkowski sum with disk) on each outline.
 *   3. Use Clipper's boolean union to merge overlapping offset shapes into a
 *      single, manufacturable contour set.
 *   4. Convert the resulting polygon set back into Three.js Shapes.
 *
 * `offsetMm` is the outward offset in millimetres. Coordinates of the input
 * Shapes are also assumed to be in millimetres.
 */
export function offsetOutlineFromShapes(shapes: Shape[], offsetMm: number): Shape[] {
  if (shapes.length === 0) return [];

  // 1. Sample shapes into polygons. Each Shape contributes one outer ring
  //    and zero or more holes. We treat holes as cw and outers as ccw.
  const polys: PolySet = { outers: [], holes: [] };
  for (const shape of shapes) {
    const outerPts = sampleCurve(shape, 4);
    if (outerPts.length >= 3) polys.outers.push(outerPts);
    for (const hole of shape.holes) {
      const holePts = sampleCurve(hole, 4);
      if (holePts.length >= 3) polys.holes.push(holePts);
    }
  }

  // 2. Combined Clipper input: outers as ccw subjects, holes as cw subjects.
  const subject: Paths = [];
  for (const ring of polys.outers) {
    subject.push(ring.map((p) => ({ X: Math.round(p.x * SCALE), Y: Math.round(p.y * SCALE) })));
  }
  for (const ring of polys.holes) {
    // Outer rings come in CCW; holes come in CW. Clipper's NonZero fill rule
    // recognises this and treats CW rings as subtractive — no manual flip.
    subject.push(ring.map((p) => ({ X: Math.round(p.x * SCALE), Y: Math.round(p.y * SCALE) })));
  }

  // First, union the foreground polygons themselves so overlapping glyphs
  // become a single shape before we offset. This avoids double-thickness.
  const unioned: Paths = [];
  const c1 = new Clipper();
  c1.AddPaths(subject, PolyType.ptSubject, true);
  c1.Execute(ClipType.ctUnion, unioned, PolyFillType.pftNonZero, PolyFillType.pftNonZero);

  // 3. Offset outward.
  const offset = new ClipperOffset(2, 0.25 * SCALE);
  offset.AddPaths(unioned, JoinType.jtRound, EndType.etClosedPolygon);
  const offsetSolution: Paths = [];
  offset.Execute(offsetSolution, offsetMm * SCALE);

  // 4. Convert back to Three.js Shapes. Outer rings become Shapes; nested
  //    inner rings become holes. Clipper sorts solutions so outers come first
  //    in even-odd convention; instead of relying on order we use point-in-
  //    polygon containment.
  return clipperToShapes(offsetSolution);
}

/** Sample a Three.js curve into a polygon (in CCW for outer / CW for hole). */
function sampleCurve(curve: Shape | Path, divisions: number): { x: number; y: number }[] {
  const pts = curve.getPoints(divisions);
  const out = pts.map((p) => ({ x: p.x, y: p.y }));
  // Drop trailing duplicate of first.
  if (out.length > 1) {
    const f = out[0];
    const l = out[out.length - 1];
    if (f && l && Math.abs(f.x - l.x) < 1e-6 && Math.abs(f.y - l.y) < 1e-6) out.pop();
  }
  return out;
}

function clipperToShapes(paths: Paths): Shape[] {
  const rings = paths.map((p) => ({
    pts: p.map((pt) => ({ x: pt.X / SCALE, y: pt.Y / SCALE })),
    area: signedArea(p),
  }));

  // Outer = CCW (positive area in Y-down clipper space → flipped here).
  // After scaling back without flip, positive area means CCW in standard math.
  const outers = rings.filter((r) => r.area > 0);
  const holes = rings.filter((r) => r.area < 0);

  const shapes = outers.map((o) => {
    const s = new Shape();
    polygonToShape(s, o.pts);
    return s;
  });

  for (const hole of holes) {
    const holeAnchor = hole.pts[0];
    if (!holeAnchor) continue;
    let bestIdx = -1;
    let bestArea = Infinity;
    for (let i = 0; i < outers.length; i++) {
      const o = outers[i];
      if (!o) continue;
      if (pointInPolygon(holeAnchor, o.pts) && o.area < bestArea) {
        bestArea = o.area;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0) {
      const owner = shapes[bestIdx];
      if (!owner) continue;
      const h = new Path();
      polygonToShape(h, hole.pts);
      owner.holes.push(h);
    }
  }
  return shapes;
}

function polygonToShape(target: Shape | Path, points: { x: number; y: number }[]): void {
  const first = points[0];
  if (!first) return;
  target.moveTo(first.x, first.y);
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    if (!p) continue;
    target.lineTo(p.x, p.y);
  }
  target.closePath();
}

function signedArea(points: { X: number; Y: number }[]): number {
  let a = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    if (!p1 || !p2) continue;
    a += p1.X * p2.Y - p2.X * p1.Y;
  }
  return a / 2;
}

function pointInPolygon(p: { x: number; y: number }, poly: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const pi = poly[i];
    const pj = poly[j];
    if (!pi || !pj) continue;
    const xi = pi.x;
    const yi = pi.y;
    const xj = pj.x;
    const yj = pj.y;
    const intersect = yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
