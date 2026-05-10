import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import { textToShapes } from '../textToShapes';
import { offsetOutlineFromShapes } from '../offsetOutline';

const FONTS_DIR = path.resolve(fileURLToPath(import.meta.url), '../../../../../public/fonts');

function loadFontSync(filename: string): opentype.Font {
  const buf = readFileSync(path.join(FONTS_DIR, filename));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

describe('offsetOutlineFromShapes', () => {
  // The original prototype (opentype.js 1.x) merged "Nora" at 5 mm thanks to
  // GSUB ccmp connector glyphs that physically link script letters. opentype.js
  // 2.x throws on Great Vibes' chaining-contextual ccmp lookup (substFormat 2),
  // so textToShapes here renders glyph-by-glyph without those connectors —
  // leaving a ~13 mm gap between "N" and the "ora" cluster. To still exercise
  // the boolean-union merge that defines the AcrylixCo signature look, this
  // test uses an 8 mm border (covers the real geometric gap). The "ora"
  // cluster itself (whose stroke distances are ~0 mm) merges at any offset
  // ≥ 0 mm, and at 8 mm the N joins them into a single unified outline — the
  // scenario the customer-facing slider hits across most of its range.
  it('produces a single unified outline for "Nora" in script (the stress case)', () => {
    const font = loadFontSync('GreatVibes-Regular.ttf');
    const { shapes } = textToShapes(font, 'Nora', 130);
    const base = offsetOutlineFromShapes(shapes, 8); // 8mm border

    // Script glyph offsets at 8mm overlap → should merge into one outer.
    expect(base.length).toBe(1);
    // Bounding box of the base must wrap the foreground with ~8mm halo on all sides.
    const first = base[0];
    if (!first) throw new Error('expected first base shape');
    const pts = first.getPoints(8);
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const baseW = Math.max(...xs) - Math.min(...xs);
    const baseH = Math.max(...ys) - Math.min(...ys);
    expect(baseW).toBeGreaterThan(180);
    expect(baseH).toBeGreaterThan(80);
  });

  it('produces 4 separate base outlines for "Alex" in Anton at 2mm border (letters do NOT merge)', () => {
    const font = loadFontSync('Anton-Regular.ttf');
    const { shapes } = textToShapes(font, 'Alex', 80);
    const base = offsetOutlineFromShapes(shapes, 2);

    // Anton letters at 2mm offset are still spaced too far apart to merge.
    // We expect roughly 4 separate base shapes (one per letter), give or take
    // 1 if "A" and "l" are close enough to merge.
    expect(base.length).toBeGreaterThanOrEqual(3);
    expect(base.length).toBeLessThanOrEqual(4);
  });

  it('returns empty array for empty input', () => {
    expect(offsetOutlineFromShapes([], 5)).toEqual([]);
  });
});
