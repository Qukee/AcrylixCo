import type { MaterialDef } from '../types';

/**
 * The full material library — color × finish swatches. Mirrors the catalog
 * from `Plan/08-material-finish-library.md`. Every finish kind is represented
 * by at least two swatches so we can validate the rendering rules.
 */
export const MATERIAL_CATALOG: MaterialDef[] = [
  // Mirror
  { id: 'gold-mirror', name: 'Gold Mirror', finish: 'mirror', color: '#d6b769', group: 'Mirror' },
  {
    id: 'silver-mirror',
    name: 'Silver Mirror',
    finish: 'mirror',
    color: '#d8dadd',
    group: 'Mirror',
  },
  {
    id: 'rose-gold-mirror',
    name: 'Rose Gold Mirror',
    finish: 'mirror',
    color: '#d4a191',
    group: 'Mirror',
  },
  {
    id: 'black-mirror',
    name: 'Black Mirror',
    finish: 'mirror',
    color: '#15161a',
    group: 'Mirror',
  },

  // Matte / Pastel
  { id: 'sage-matte', name: 'Sage Matte', finish: 'matte', color: '#a3b89d', group: 'Matte' },
  {
    id: 'dusty-pink-matte',
    name: 'Dusty Pink Matte',
    finish: 'matte',
    color: '#d3a4a4',
    group: 'Matte',
  },
  {
    id: 'baby-blue-matte',
    name: 'Baby Blue Matte',
    finish: 'matte',
    color: '#b6c8d6',
    group: 'Matte',
  },
  { id: 'cream-matte', name: 'Cream Matte', finish: 'matte', color: '#ece4d3', group: 'Matte' },
  {
    id: 'lavender-matte',
    name: 'Lavender Matte',
    finish: 'matte',
    color: '#bcb0cf',
    group: 'Matte',
  },
  { id: 'black-matte', name: 'Black Matte', finish: 'matte', color: '#1a1b1f', group: 'Matte' },
  { id: 'white-matte', name: 'White Matte', finish: 'matte', color: '#f1ede5', group: 'Matte' },

  // Frosted
  { id: 'frosted-sage', name: 'Frosted Sage', finish: 'frosted', color: '#b9cdb1', group: 'Frosted' },
  {
    id: 'frosted-white',
    name: 'Frosted White',
    finish: 'frosted',
    color: '#e8eae5',
    group: 'Frosted',
  },
  {
    id: 'frosted-clear',
    name: 'Frosted Clear',
    finish: 'frosted',
    color: '#dde1e3',
    group: 'Frosted',
  },

  // Gloss
  { id: 'pink-gloss', name: 'Pink Gloss', finish: 'gloss', color: '#e89cb1', group: 'Gloss' },
  { id: 'white-gloss', name: 'White Gloss', finish: 'gloss', color: '#f4f0e7', group: 'Gloss' },
  { id: 'black-gloss', name: 'Black Gloss', finish: 'gloss', color: '#0e0f12', group: 'Gloss' },
  { id: 'red-gloss', name: 'Red Gloss', finish: 'gloss', color: '#b8332b', group: 'Gloss' },

  // Glitter
  { id: 'gold-glitter', name: 'Gold Glitter', finish: 'glitter', color: '#d6b35a', group: 'Glitter' },
  {
    id: 'silver-glitter',
    name: 'Silver Glitter',
    finish: 'glitter',
    color: '#c4c8cd',
    group: 'Glitter',
  },
  { id: 'rose-glitter', name: 'Rose Glitter', finish: 'glitter', color: '#cf8a8c', group: 'Glitter' },

  // Neon
  { id: 'neon-pink', name: 'Neon Pink', finish: 'neon', color: '#ff3df0', group: 'Neon' },
  { id: 'neon-green', name: 'Neon Green', finish: 'neon', color: '#3dff8f', group: 'Neon' },
  { id: 'neon-orange', name: 'Neon Orange', finish: 'neon', color: '#ff7a1f', group: 'Neon' },

  // Clear
  { id: 'clear', name: 'Clear', finish: 'clear', color: '#e9ebef', group: 'Clear' },

  // Glow
  { id: 'glow-aqua', name: 'Glow Aqua', finish: 'glow', color: '#8df0d8', group: 'Glow' },
  { id: 'glow-green', name: 'Glow Green', finish: 'glow', color: '#a8f08d', group: 'Glow' },
];

export function findMaterial(id: string): MaterialDef {
  const m = MATERIAL_CATALOG.find((m) => m.id === id);
  if (!m) {
    throw new Error(`Material not found: ${id}`);
  }
  return m;
}
