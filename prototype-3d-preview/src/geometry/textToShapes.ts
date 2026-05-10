import { Shape, Path } from 'three';
import type { Font, PathCommand } from 'opentype.js';

/**
 * Convert text in a given font to a flat list of Three.js Shapes.
 * Each glyph contour becomes either a Shape or a hole within a Shape.
 *
 * Coordinates are returned in font units * scale, with Y flipped so that
 * "up" is +Y (matching Three.js's right-handed convention). Text is
 * left-aligned at x=0 and the baseline sits at y=0.
 */
export function textToShapes(
  font: Font,
  text: string,
  fontSize: number,
): { shapes: Shape[]; bounds: { minX: number; maxX: number; minY: number; maxY: number } } {
  const otPath = font.getPath(text, 0, 0, fontSize);
  return commandsToShapes(otPath.commands);
}

interface SubPath {
  points: { x: number; y: number }[];
  area: number; // signed area; >0 = ccw outer, <0 = cw hole (assuming flipped Y)
}

function commandsToShapes(commands: PathCommand[]): {
  shapes: Shape[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
} {
  const subPaths: SubPath[] = [];
  let current: { x: number; y: number }[] | null = null;
  let cx = 0;
  let cy = 0;

  // We sample bezier curves into polylines so we can compute area/containment.
  const flatten = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    c?: { x: number; y: number },
    d?: { x: number; y: number },
  ): { x: number; y: number }[] => {
    const steps = 16;
    const out: { x: number; y: number }[] = [];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      let px: number;
      let py: number;
      if (c && d) {
        const mt = 1 - t;
        px = mt * mt * mt * a.x + 3 * mt * mt * t * b.x + 3 * mt * t * t * c.x + t * t * t * d.x;
        py = mt * mt * mt * a.y + 3 * mt * mt * t * b.y + 3 * mt * t * t * c.y + t * t * t * d.y;
      } else if (c) {
        const mt = 1 - t;
        px = mt * mt * a.x + 2 * mt * t * b.x + t * t * c.x;
        py = mt * mt * a.y + 2 * mt * t * b.y + t * t * c.y;
      } else {
        px = a.x + (b.x - a.x) * t;
        py = a.y + (b.y - a.y) * t;
      }
      out.push({ x: px, y: py });
    }
    return out;
  };

  for (const cmd of commands) {
    if (cmd.type === 'M') {
      if (current && current.length > 0) {
        subPaths.push({ points: current, area: signedArea(current) });
      }
      // opentype.js returns Y flipped (font coords have Y down); flip to Y up.
      current = [{ x: cmd.x, y: -cmd.y }];
      cx = cmd.x;
      cy = cmd.y;
    } else if (cmd.type === 'L' && current) {
      current.push({ x: cmd.x, y: -cmd.y });
      cx = cmd.x;
      cy = cmd.y;
    } else if (cmd.type === 'Q' && current) {
      const a = { x: cx, y: cy };
      const b = { x: cmd.x1, y: cmd.y1 };
      const c = { x: cmd.x, y: cmd.y };
      const sampled = flatten(a, b, c);
      for (const p of sampled) current.push({ x: p.x, y: -p.y });
      cx = cmd.x;
      cy = cmd.y;
    } else if (cmd.type === 'C' && current) {
      const a = { x: cx, y: cy };
      const b = { x: cmd.x1, y: cmd.y1 };
      const c = { x: cmd.x2, y: cmd.y2 };
      const d = { x: cmd.x, y: cmd.y };
      const sampled = flatten(a, b, c, d);
      for (const p of sampled) current.push({ x: p.x, y: -p.y });
      cx = cmd.x;
      cy = cmd.y;
    } else if (cmd.type === 'Z' && current) {
      // close: drop trailing duplicate of first if present
      if (current.length > 1) {
        const first = current[0];
        const last = current[current.length - 1];
        if (first.x === last.x && first.y === last.y) current.pop();
      }
      subPaths.push({ points: current, area: signedArea(current) });
      current = null;
    }
  }
  if (current && current.length > 0) {
    subPaths.push({ points: current, area: signedArea(current) });
  }

  // After flipping opentype's Y-down coords to Y-up, the winding convention
  // inverts: TrueType outer contours (CW in Y-down → positive area in
  // Y-down) become negative-area in Y-up; holes (CCW in Y-down) become
  // positive-area in Y-up.
  const outers = subPaths.filter((s) => s.area < 0);
  const inners = subPaths.filter((s) => s.area > 0);

  // Three.js Shape expects outer rings to be CCW (positive signed area in
  // Y-up) and holes to be CW (negative). Our outers come in CW; reverse them
  // so Shape triangulates with the right face normals.
  const shapes: Shape[] = outers.map((outer) => {
    const shape = new Shape();
    pointsToCurve(shape, [...outer.points].reverse());
    return shape;
  });

  for (const inner of inners) {
    let bestIdx = -1;
    let bestAbsArea = Infinity;
    for (let i = 0; i < outers.length; i++) {
      const outer = outers[i];
      if (pointInPolygon(inner.points[0], outer.points) && Math.abs(outer.area) < bestAbsArea) {
        bestAbsArea = Math.abs(outer.area);
        bestIdx = i;
      }
    }
    if (bestIdx >= 0) {
      const hole = new Path();
      // Inner points are CCW (positive area); reverse to CW for Three.js holes.
      pointsToCurve(hole, [...inner.points].reverse());
      shapes[bestIdx].holes.push(hole);
    }
  }

  // Compute bounds.
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const s of subPaths) {
    for (const p of s.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }

  return { shapes, bounds: { minX, maxX, minY, maxY } };
}

function pointsToCurve(target: Shape | Path, points: { x: number; y: number }[]): void {
  if (points.length === 0) return;
  target.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    target.lineTo(points[i].x, points[i].y);
  }
  target.closePath();
}

function signedArea(points: { x: number; y: number }[]): number {
  let a = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    a += p1.x * p2.y - p2.x * p1.y;
  }
  return a / 2;
}

function pointInPolygon(p: { x: number; y: number }, poly: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const intersect = yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
