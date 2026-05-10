import { Shape, Path } from 'three';
import type { Font, PathCommand } from 'opentype.js';

/**
 * Convert text in a given font to a flat list of Three.js Shapes.
 * Each glyph contour becomes either a Shape or a hole within a Shape.
 *
 * Coordinates are returned in font units * scale, with Y flipped so that
 * "up" is +Y (matching Three.js's right-handed convention). Text is
 * left-aligned at x=0 and the baseline sits at y=0.
 *
 * Implementation note: rather than calling `font.getPath(text, ...)`, which
 * routes through opentype.js's bidi/feature pipeline, we resolve each
 * character to a glyph and concatenate per-glyph paths with kerning. This
 * avoids ccmp/GSUB substitutions that opentype.js 2.x cannot fully apply
 * for some fonts (e.g. Great Vibes' chaining contextual format 2 lookups,
 * which throw "substitutionType : 62 lookupType: 6 - substFormat: 2 is
 * not yet supported"). Per-glyph rendering routes through Glyph.getPath
 * directly and bypasses the bidi shaper.
 */
export function textToShapes(
  font: Font,
  text: string,
  fontSize: number,
): { shapes: Shape[]; bounds: { minX: number; maxX: number; minY: number; maxY: number } } {
  const allCommands: PathCommand[] = [];
  const fontScale = (1 / font.unitsPerEm) * fontSize;
  let x = 0;
  let prevGlyph: ReturnType<Font['charToGlyph']> | null = null;
  for (const ch of text) {
    const glyph = font.charToGlyph(ch);
    if (prevGlyph) {
      const kerning = font.getKerningValue(prevGlyph, glyph);
      x += kerning * fontScale;
    }
    const glyphPath = glyph.getPath(x, 0, fontSize, undefined, font);
    for (const cmd of glyphPath.commands) allCommands.push(cmd);
    x += (glyph.advanceWidth ?? 0) * fontScale;
    prevGlyph = glyph;
  }
  return commandsToShapes(allCommands);
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
        if (first && last && first.x === last.x && first.y === last.y) current.pop();
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
    const innerAnchor = inner.points[0];
    if (!innerAnchor) continue;
    let bestIdx = -1;
    let bestAbsArea = Infinity;
    for (let i = 0; i < outers.length; i++) {
      const outer = outers[i];
      if (!outer) continue;
      if (pointInPolygon(innerAnchor, outer.points) && Math.abs(outer.area) < bestAbsArea) {
        bestAbsArea = Math.abs(outer.area);
        bestIdx = i;
      }
    }
    if (bestIdx >= 0) {
      const owner = shapes[bestIdx];
      if (!owner) continue;
      const hole = new Path();
      // Inner points are CCW (positive area); reverse to CW for Three.js holes.
      pointsToCurve(hole, [...inner.points].reverse());
      owner.holes.push(hole);
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

function signedArea(points: { x: number; y: number }[]): number {
  let a = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    if (!p1 || !p2) continue;
    a += p1.x * p2.y - p2.x * p1.y;
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
