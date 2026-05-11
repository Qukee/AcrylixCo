import type { PieceSpec } from '../types';

/**
 * Test pieces shipped with the prototype. Each maps to a real-world
 * composition pattern from `Plan/05-composition-templates.md`:
 *
 *   - "Alex"  — single-line name plaque, bold sans-serif
 *   - "Nora"  — flowing script (the offset-outline stress case)
 *   - "Mia"   — name inside a heart shape (companion shape pattern)
 */
export const TEST_PIECES: PieceSpec[] = [
  {
    id: 'alex',
    displayName: '"Alex" — bold sans plaque',
    baseDerivedFromLayerId: 'foreground',
    baseThicknessMm: 5,
    layers: [
      {
        id: 'foreground',
        kind: 'foreground',
        content: {
          type: 'text',
          text: 'Alex',
          fontUrl: '/fonts/Anton-Regular.ttf',
          fontSize: 80,
        },
        thicknessMm: 5,
        zStackOrder: 1,
      },
    ],
    unifyBase: true,
    defaults: {
      borderThicknessMm: 6,
      layerMaterials: {
        base: 'gold-mirror',
        foreground: 'black-matte',
      },
      showStand: true,
    },
    approxWidthCm: 32,
  },
  {
    id: 'nora',
    displayName: '"Nora" — flowing script',
    baseDerivedFromLayerId: 'foreground',
    baseThicknessMm: 5,
    layers: [
      {
        id: 'foreground',
        kind: 'foreground',
        content: {
          type: 'text',
          text: 'Nora',
          fontUrl: '/fonts/GreatVibes-Regular.ttf',
          fontSize: 130,
        },
        thicknessMm: 4,
        zStackOrder: 1,
      },
    ],
    unifyBase: true,
    defaults: {
      // Bumped from 5 → 8 to compensate for opentype.js 2.x ccmp regression:
      // Great Vibes' connector glyphs aren't substituted, so a 5mm offset
      // doesn't always merge "N", "o", "r", "a" into a unified base.
      borderThicknessMm: 8,
      layerMaterials: {
        base: 'rose-gold-mirror',
        foreground: 'cream-matte',
      },
      showStand: true,
    },
    approxWidthCm: 38,
  },
  {
    id: 'big-letter',
    displayName: 'Big Letter — name inside the initial',
    baseDerivedFromLayerId: 'initial',
    baseThicknessMm: 5,
    layers: [
      {
        id: 'initial',
        kind: 'foreground',
        content: {
          type: 'text',
          text: 'O',
          fontUrl: '/fonts/DMSerifDisplay-Regular.ttf',
          fontSize: 220,
        },
        thicknessMm: 5,
        zStackOrder: 1,
      },
      {
        id: 'name',
        kind: 'accent',
        content: {
          type: 'text',
          text: 'Olivia',
          fontUrl: '/fonts/DMSerifDisplay-Regular.ttf',
          fontSize: 60,
        },
        thicknessMm: 4,
        zStackOrder: 2,
        // Vertically nudge the name into the visual centre of the initial's
        // counter — both texts share an opentype baseline at y=0, but the
        // initial extends much further up so we offset upward by ~half its
        // cap height minus the name's cap height.
        offsetMm: { x: 0, y: 60 },
      },
    ],
    unifyBase: false,
    defaults: {
      borderThicknessMm: 7,
      layerMaterials: {
        base: 'cream-matte',
        initial: 'cream-matte',
        name: 'dusty-pink-matte',
      },
      showStand: true,
    },
    approxWidthCm: 38,
  },
  {
    id: 'mia',
    displayName: '"Mia" in heart',
    baseDerivedFromLayerId: 'heart',
    baseThicknessMm: 5,
    layers: [
      {
        id: 'heart',
        kind: 'foreground',
        content: { type: 'shape', shape: 'heart', size: 180 },
        thicknessMm: 5,
        zStackOrder: 1,
      },
      {
        id: 'name',
        kind: 'accent',
        content: {
          type: 'text',
          text: 'Mia',
          fontUrl: '/fonts/DMSerifDisplay-Regular.ttf',
          fontSize: 52,
        },
        thicknessMm: 4,
        zStackOrder: 2,
        offsetMm: { x: -25, y: 25 },
      },
    ],
    unifyBase: false,
    defaults: {
      borderThicknessMm: 7,
      layerMaterials: {
        base: 'silver-mirror',
        heart: 'dusty-pink-matte',
        name: 'white-gloss',
      },
      showStand: true,
    },
    approxWidthCm: 28,
  },
];
