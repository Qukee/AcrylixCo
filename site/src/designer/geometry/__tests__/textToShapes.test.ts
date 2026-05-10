import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import opentype from 'opentype.js';
import { textToShapes } from '../textToShapes';

const FONTS_DIR = path.resolve(fileURLToPath(import.meta.url), '../../../../../public/fonts');

function loadFontSync(filename: string): opentype.Font {
  const buf = readFileSync(path.join(FONTS_DIR, filename));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

describe('textToShapes', () => {
  it('produces 4 outer shapes + 2 holes for "Alex" in Anton at fontSize 80', () => {
    const font = loadFontSync('Anton-Regular.ttf');
    const { shapes, bounds } = textToShapes(font, 'Alex', 80);

    // 4 letters: A, l, e, x. Two of them have holes (A's triangle, e's eye).
    expect(shapes.length).toBe(4);
    const totalHoles = shapes.reduce((acc, s) => acc + s.holes.length, 0);
    expect(totalHoles).toBe(2);

    // Bounds should span the full width of the rendered text (~133mm at fontSize 80).
    expect(bounds.minX).toBeGreaterThan(0);
    expect(bounds.minX).toBeLessThan(5);
    expect(bounds.maxX).toBeGreaterThan(120);
    expect(bounds.maxX).toBeLessThan(140);
    expect(bounds.maxY - bounds.minY).toBeGreaterThan(60); // cap height ~70
  });

  it('produces 4 outer shapes for "Nora" in Great Vibes with the o counter as a hole', () => {
    const font = loadFontSync('GreatVibes-Regular.ttf');
    const { shapes } = textToShapes(font, 'Nora', 130);

    // 4 letters: N, o, r, a. Only 'o' carries an inner counter hole;
    // N, r, and a are connecting-script strokes with no enclosed counters.
    expect(shapes.length).toBe(4);
    const totalHoles = shapes.reduce((acc, s) => acc + s.holes.length, 0);
    expect(totalHoles).toBe(1);
    const shapesWithHoles = shapes.filter((s) => s.holes.length > 0);
    expect(shapesWithHoles.length).toBe(1);
  });
});
