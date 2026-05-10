import { describe, it, expect } from 'vitest';
import { MATERIAL_CATALOG, findMaterial } from '../catalog';

describe('material catalog', () => {
  it('contains all expected finish kinds', () => {
    const finishes = new Set(MATERIAL_CATALOG.map((m) => m.finish));
    expect(finishes).toEqual(
      new Set(['mirror', 'matte', 'frosted', 'gloss', 'glitter', 'neon', 'clear', 'glow']),
    );
  });

  it('every material has a unique id', () => {
    const ids = MATERIAL_CATALOG.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('findMaterial returns the matching swatch', () => {
    const gold = findMaterial('gold-mirror');
    expect(gold.finish).toBe('mirror');
    expect(gold.color).toBe('#d6b769');
  });

  it('findMaterial throws on unknown id', () => {
    expect(() => findMaterial('does-not-exist')).toThrow(/not found/i);
  });
});
