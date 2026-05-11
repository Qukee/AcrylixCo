import type { Shape } from 'three';

/** A finish category determines how a material renders in 3D. */
export type FinishKind =
  | 'mirror'
  | 'matte'
  | 'frosted'
  | 'gloss'
  | 'glitter'
  | 'neon'
  | 'clear'
  | 'glow';

/** A swatch in the material catalog: a (color, finish) pairing. */
export interface MaterialDef {
  id: string;
  name: string;
  finish: FinishKind;
  /** Hex color, used for diffuse/transmission base color. */
  color: string;
  /** Subgroup label for the swatch picker. */
  group: string;
}

/** Logical role of a layer within a piece. */
export type LayerKind = 'base' | 'foreground' | 'accent';

/**
 * A foreground/accent layer is described by a content spec — text or shape —
 * which we resolve to a Three.js Shape at build time.
 */
export type LayerContent =
  | { type: 'text'; text: string; fontUrl: string; fontSize: number }
  | { type: 'shape'; shape: 'heart' | 'circle'; size: number };

export interface LayerSpec {
  id: string;
  kind: LayerKind;
  content: LayerContent;
  /** Manufacturing thickness in millimetres. Maps to extrusion depth. */
  thicknessMm: number;
  /**
   * Z translation in millimetres relative to the base. Foreground sits above
   * base by base.thickness; accent sits above foreground.
   */
  zStackOrder: number;
  /** 2D translation within the composition (mm). Defaults to (0, 0). */
  offsetMm?: { x: number; y: number };
}

/**
 * A test piece — a complete composition with one base layer and one or more
 * foreground/accent layers. The base geometry is generated from the foreground
 * via the offset-outline engine.
 */
export interface PieceSpec {
  id: string;
  displayName: string;
  /** Reference to the layer whose outline drives the base layer geometry. */
  baseDerivedFromLayerId: string;
  /** Manufacturing thickness of the base in mm. */
  baseThicknessMm: number;
  /** Foreground/accent layers in z-order (lowest first). */
  layers: LayerSpec[];
  /**
   * If true, the base outline is the union of every foreground layer.
   * If false, only baseDerivedFromLayerId drives the base.
   */
  unifyBase: boolean;
  /** Default UI state for this piece. */
  defaults: {
    borderThicknessMm: number;
    layerMaterials: Record<string, string>; // layerId or 'base' → materialId
    showStand: boolean;
  };
  /** Approximate width hint in cm — used for camera framing. */
  approxWidthCm: number;
}

/** Resolved geometry ready for rendering. Coordinates are in millimetres. */
export interface ResolvedLayerGeometry {
  layerId: string;
  kind: LayerKind;
  shapes: Shape[];
  thicknessMm: number;
  zStackOrder: number;
  offsetMm: { x: number; y: number };
}

export interface PieceGeometry {
  pieceId: string;
  layers: ResolvedLayerGeometry[];
  /** Bounding box in millimetres (centred at origin). */
  bounds: { width: number; height: number; depth: number };
}

/** UI state. */
export interface DesignerState {
  viewMode: '2d' | '3d';
  borderThicknessMm: number;
  layerMaterials: Record<string, string>;
  /** Per-text-layer override of the template's default text (keyed by layer id). */
  customText: Record<string, string>;
  glowMode: 'day' | 'night';
  autoRotate: boolean;
  showStats: boolean;
}
