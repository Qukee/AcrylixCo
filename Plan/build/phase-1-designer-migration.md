# Phase 1 — Designer Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lift the working `prototype-3d-preview/` (geometry, materials, 3D scene, UI) into the production `site/` Next.js app and expose it at `/customize`. Lock down the offset-outline geometry with golden-file tests, and define the cart-line-item metadata Zod schema so Phase 3 (commerce) can plug in cleanly.

**Architecture:** Three.js + react-three-fiber + drei rendering on the client only. Designer code lives under `site/src/designer/` with strict client/server boundaries: `'use client'` on every Three.js-touching file, `next/dynamic({ ssr: false })` on the route. Geometry pipeline (opentype.js → text shapes → Clipper offset → Three.js Shape) is pure — no DOM dependency — and gets unit tests with golden-file assertions for "Alex" (sans plaque) and "Nora" (script — the offset-outline stress case from `Plan/07-offset-outline-generation.md`). Materials, UI components, and the test pieces port as-is from the prototype. The cart line-item schema is defined in code now (per `Plan/13-design-persistence-and-handoff.md`) without yet wiring up a cart UI.

**Tech Stack:** existing Next 16 + React 19 + Tailwind v4 + TypeScript + Vitest + Playwright; adds Three.js, @react-three/fiber, @react-three/drei, opentype.js, clipper-lib, zod (already installed for Auth.js).

**Out of scope:** Cart UI, admin template editor, font/material upload UI, multi-text-layer support beyond what the prototype already does, real auth-gated saved designs, design proof emails — all Phase 3+.

**Source of truth for migrated code:** `/Users/mohamadhassan/Desktop/AcrylixCo/prototype-3d-preview/` (validated, working, screenshots in repo root). Subagents should copy from there rather than rewrite.

---

## Task 1: Add 3D dependencies to `site/`

**Files:**
- Modify: `site/package.json`

- [ ] **Step 1: Install runtime deps**

```bash
cd site
npm install three @react-three/fiber @react-three/drei opentype.js clipper-lib
```

- [ ] **Step 2: Install dev type packages**

```bash
npm install --save-dev @types/three @types/opentype.js
```

(`clipper-lib` has no `@types` package — Phase 0's prototype shipped a manual `clipper-lib.d.ts` that gets ported in Task 3.)

- [ ] **Step 3: Verify the existing checks still pass**

```bash
npm run typecheck && npm run lint && npm run test
```

Expected: all pass. The new packages aren't yet imported anywhere so this is a smoke test that the install didn't break the existing project.

- [ ] **Step 4: Commit**

```bash
cd ..
git add site/package.json site/package-lock.json
git commit -m "feat(site): add three, react-three-fiber, drei, opentype, clipper for designer"
```

---

## Task 2: Bundle designer fonts in `site/public/fonts/`

**Files:**
- Create: `site/public/fonts/Anton-Regular.ttf`
- Create: `site/public/fonts/GreatVibes-Regular.ttf`
- Create: `site/public/fonts/DMSerifDisplay-Regular.ttf`

The prototype already has these. Copy them — they're SIL Open Font License, free to redistribute.

- [ ] **Step 1: Copy fonts**

```bash
mkdir -p site/public/fonts
cp prototype-3d-preview/public/fonts/Anton-Regular.ttf site/public/fonts/
cp prototype-3d-preview/public/fonts/GreatVibes-Regular.ttf site/public/fonts/
cp prototype-3d-preview/public/fonts/DMSerifDisplay-Regular.ttf site/public/fonts/
```

- [ ] **Step 2: Verify**

```bash
ls -lh site/public/fonts/
```

Expected: three TTF files, ~75 KB to ~450 KB each.

- [ ] **Step 3: Commit**

```bash
git add site/public/fonts/
git commit -m "feat(designer): bundle Anton, Great Vibes, DM Serif Display fonts"
```

---

## Task 3: Port designer types and Clipper type declaration

**Files:**
- Create: `site/src/designer/types.ts`
- Create: `site/src/designer/clipper-lib.d.ts`

The prototype has these at `prototype-3d-preview/src/types.ts` and `prototype-3d-preview/src/clipper-lib.d.ts`. Copy verbatim into `site/src/designer/`. The `designer/` subdirectory groups all the migrated code in one place.

- [ ] **Step 1: Create the directory and copy the files**

```bash
mkdir -p site/src/designer
cp prototype-3d-preview/src/types.ts site/src/designer/types.ts
cp prototype-3d-preview/src/clipper-lib.d.ts site/src/designer/clipper-lib.d.ts
```

- [ ] **Step 2: Verify TypeScript still compiles**

```bash
cd site
npm run typecheck
```

Expected: no errors. The new files have no consumers yet, but the clipper-lib ambient declaration should resolve correctly.

- [ ] **Step 3: Commit**

```bash
cd ..
git add site/src/designer/
git commit -m "feat(designer): port types and clipper-lib declaration"
```

---

## Task 4: Port the material catalog and material factory

**Files:**
- Create: `site/src/designer/materials/catalog.ts`
- Create: `site/src/designer/materials/createMaterial.ts`
- Create: `site/src/designer/materials/__tests__/catalog.test.ts`

- [ ] **Step 1: Copy materials**

```bash
mkdir -p site/src/designer/materials
cp prototype-3d-preview/src/materials/catalog.ts site/src/designer/materials/catalog.ts
cp prototype-3d-preview/src/materials/createMaterial.ts site/src/designer/materials/createMaterial.ts
```

- [ ] **Step 2: Update import paths**

In `site/src/designer/materials/catalog.ts` and `site/src/designer/materials/createMaterial.ts`, change `from '../types'` to `from '../types'` (already correct — verify) and any other relative imports as needed.

- [ ] **Step 3: Add a unit test for the catalog**

Path: `site/src/designer/materials/__tests__/catalog.test.ts`

```ts
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
```

- [ ] **Step 4: Run the test**

```bash
cd site
npx vitest run src/designer/materials
```

Expected: 4 tests passing.

- [ ] **Step 5: Verify lint + typecheck**

```bash
npm run lint && npm run typecheck
```

- [ ] **Step 6: Commit**

```bash
cd ..
git add site/src/designer/materials/
git commit -m "feat(designer): port material catalog and material factory with tests"
```

---

## Task 5: Port geometry foundations (fontCache, textToShapes, heartShape)

**Files:**
- Create: `site/src/designer/geometry/fontCache.ts`
- Create: `site/src/designer/geometry/textToShapes.ts`
- Create: `site/src/designer/geometry/heartShape.ts`
- Create: `site/src/designer/geometry/__tests__/textToShapes.test.ts`

These are the building blocks for the offset-outline engine in Task 6. They're pure functions over Three.js Shapes — no DOM, no React.

- [ ] **Step 1: Copy files**

```bash
mkdir -p site/src/designer/geometry
cp prototype-3d-preview/src/geometry/fontCache.ts site/src/designer/geometry/
cp prototype-3d-preview/src/geometry/textToShapes.ts site/src/designer/geometry/
cp prototype-3d-preview/src/geometry/heartShape.ts site/src/designer/geometry/
```

- [ ] **Step 2: Add a golden-file test for textToShapes**

This test pins down the outer/inner classification fix that was the most painful bug of Phase 0 (see commits in `prototype-3d-preview/` history). If anyone regresses the winding logic, this test catches it.

Path: `site/src/designer/geometry/__tests__/textToShapes.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import opentype from 'opentype.js';
import { textToShapes } from '../textToShapes';

const FONTS_DIR = path.resolve(
  fileURLToPath(import.meta.url),
  '../../../../../../public/fonts',
);

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

  it('produces 4 outer shapes for "Nora" in Great Vibes (no script-letter counters)', () => {
    const font = loadFontSync('GreatVibes-Regular.ttf');
    const { shapes } = textToShapes(font, 'Nora', 130);

    // Each script letter is one closed contour with no inner counter holes.
    expect(shapes.length).toBe(4);
    expect(shapes.every((s) => s.holes.length === 0)).toBe(true);
  });
});
```

- [ ] **Step 3: Run the test**

```bash
cd site
npx vitest run src/designer/geometry
```

Expected: 2 tests passing. **If a test fails**, re-check Step 1 — the file you copied must be the post-fix version (outer = negative-area in Y-up). Don't re-derive the winding rule; just confirm the copy was correct.

- [ ] **Step 4: Verify**

```bash
npm run typecheck && npm run lint
```

- [ ] **Step 5: Commit**

```bash
cd ..
git add site/src/designer/geometry/
git commit -m "feat(designer): port geometry foundations + golden tests for textToShapes"
```

---

## Task 6: Port the offset-outline engine + golden test for the "Nora" stress case

**Files:**
- Create: `site/src/designer/geometry/offsetOutline.ts`
- Create: `site/src/designer/geometry/__tests__/offsetOutline.test.ts`

This is *the* most important geometric feature in the codebase per `Plan/07-offset-outline-generation.md`. The test specifically covers the script-font stress case: overlapping glyph offsets must merge into a single unified base contour.

- [ ] **Step 1: Copy the engine**

```bash
cp prototype-3d-preview/src/geometry/offsetOutline.ts site/src/designer/geometry/
```

- [ ] **Step 2: Add the offset-outline golden test**

Path: `site/src/designer/geometry/__tests__/offsetOutline.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import { textToShapes } from '../textToShapes';
import { offsetOutlineFromShapes } from '../offsetOutline';

const FONTS_DIR = path.resolve(
  fileURLToPath(import.meta.url),
  '../../../../../../public/fonts',
);

function loadFontSync(filename: string): opentype.Font {
  const buf = readFileSync(path.join(FONTS_DIR, filename));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

describe('offsetOutlineFromShapes', () => {
  it('produces a single unified outline for "Nora" in script (the stress case)', () => {
    const font = loadFontSync('GreatVibes-Regular.ttf');
    const { shapes } = textToShapes(font, 'Nora', 130);
    const base = offsetOutlineFromShapes(shapes, 5); // 5mm border

    // Script glyph offsets at 5mm overlap → should merge into one outer.
    expect(base.length).toBe(1);
    // Bounding box of the base must wrap the foreground with ~5mm halo on all sides.
    const pts = base[0].getPoints(8);
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
```

- [ ] **Step 3: Run the test**

```bash
cd site
npx vitest run src/designer/geometry/__tests__/offsetOutline
```

Expected: 3 tests passing. The first one is the AcrylixCo signature feature — if that breaks, the whole product breaks.

- [ ] **Step 4: Commit**

```bash
cd ..
git add site/src/designer/geometry/
git commit -m "feat(designer): port offset-outline engine + golden test for Nora stress case"
```

---

## Task 7: Port the piece geometry orchestrator

**Files:**
- Create: `site/src/designer/geometry/pieces.ts`
- Create: `site/src/designer/geometry/buildPieceGeometry.ts`

`buildPieceGeometry` is the entry point the React layer calls: it takes a `PieceSpec` + border thickness + optional custom text, returns a `PieceGeometry` ready for rendering.

- [ ] **Step 1: Copy files**

```bash
cp prototype-3d-preview/src/geometry/pieces.ts site/src/designer/geometry/
cp prototype-3d-preview/src/geometry/buildPieceGeometry.ts site/src/designer/geometry/
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd site
npm run typecheck
```

Expected: no errors. `pieces.ts` references font URLs at `/fonts/*.ttf` — these resolve to `site/public/fonts/` at runtime.

- [ ] **Step 3: Run all designer tests**

```bash
npx vitest run src/designer
```

Expected: all tests still pass (catalog + textToShapes + offsetOutline).

- [ ] **Step 4: Commit**

```bash
cd ..
git add site/src/designer/geometry/
git commit -m "feat(designer): port piece geometry orchestrator"
```

---

## Task 8: Port scene components with proper client boundaries

**Files:**
- Create: `site/src/designer/scene/Scene.tsx`
- Create: `site/src/designer/scene/Studio.tsx`
- Create: `site/src/designer/scene/AcrylicLayer.tsx`
- Create: `site/src/designer/scene/Piece.tsx`

Three.js needs `window` — these all must be `'use client'`. The route in Task 10 dynamic-imports the entry point with `ssr: false` so SSR never tries to render them.

- [ ] **Step 1: Copy the four scene files**

```bash
mkdir -p site/src/designer/scene
cp prototype-3d-preview/src/scene/Scene.tsx site/src/designer/scene/
cp prototype-3d-preview/src/scene/Studio.tsx site/src/designer/scene/
cp prototype-3d-preview/src/scene/AcrylicLayer.tsx site/src/designer/scene/
cp prototype-3d-preview/src/scene/Piece.tsx site/src/designer/scene/
```

- [ ] **Step 2: Add `'use client'` directives**

Each of the four files needs `'use client';` as the very first line. Run:

```bash
cd site
for f in src/designer/scene/{Scene,Studio,AcrylicLayer,Piece}.tsx; do
  if ! head -1 "$f" | grep -q "'use client'"; then
    printf "'use client';\n\n%s" "$(cat "$f")" > "$f"
  fi
done
```

- [ ] **Step 3: Update imports if needed**

The prototype's Scene.tsx imports types and materials. Adjust paths so they point at `site/src/designer/...`. Specifically:

- `from '../types'` becomes `from '../types'` (still correct — types is one level up)
- `from '../materials/...'` stays the same
- `from '../geometry/...'` stays the same

Run typecheck to confirm:

```bash
npm run typecheck
```

If it errors, fix the imports.

- [ ] **Step 4: Verify**

```bash
npm run lint
```

- [ ] **Step 5: Commit**

```bash
cd ..
git add site/src/designer/scene/
git commit -m "feat(designer): port scene components with 'use client' boundaries"
```

---

## Task 9: Port UI components (control panel, material picker, loading overlay)

**Files:**
- Create: `site/src/designer/ui/ControlPanel.tsx`
- Create: `site/src/designer/ui/ControlPanel.css`
- Create: `site/src/designer/ui/MaterialPicker.tsx`
- Create: `site/src/designer/ui/MaterialPicker.css`
- Create: `site/src/designer/ui/LoadingOverlay.tsx`
- Create: `site/src/designer/ui/LoadingOverlay.css`

We keep the prototype's CSS modules as-is. The designer's visual language (dark panel, cream canvas, accent gold) is intentional and self-contained; mixing it with the storefront's Tailwind is a Phase 2 problem when storefront UI lands.

- [ ] **Step 1: Copy UI files**

```bash
mkdir -p site/src/designer/ui
cp prototype-3d-preview/src/ui/ControlPanel.tsx site/src/designer/ui/
cp prototype-3d-preview/src/ui/ControlPanel.css site/src/designer/ui/
cp prototype-3d-preview/src/ui/MaterialPicker.tsx site/src/designer/ui/
cp prototype-3d-preview/src/ui/MaterialPicker.css site/src/designer/ui/
cp prototype-3d-preview/src/ui/LoadingOverlay.tsx site/src/designer/ui/
cp prototype-3d-preview/src/ui/LoadingOverlay.css site/src/designer/ui/
```

- [ ] **Step 2: Add `'use client'` to the .tsx files**

```bash
cd site
for f in src/designer/ui/{ControlPanel,MaterialPicker,LoadingOverlay}.tsx; do
  if ! head -1 "$f" | grep -q "'use client'"; then
    printf "'use client';\n\n%s" "$(cat "$f")" > "$f"
  fi
done
```

- [ ] **Step 3: Update CSS variable scope**

The prototype's CSS files reference variables like `--bg-elev`, `--border-strong`, `--font-serif` defined in the prototype's global `index.css`. Those don't exist in `site/src/app/globals.css` (which uses Tailwind v4 `@theme` tokens).

Create `site/src/designer/ui/designer.css` with the prototype's design tokens scoped to the designer:

```css
.designer-root {
  --bg: #0c0c0e;
  --bg-elev: #15161a;
  --bg-elev-2: #1c1d22;
  --border: #2a2c33;
  --border-strong: #3a3d46;
  --fg: #f5f3ee;
  --fg-muted: #a4a39d;
  --fg-dim: #6c6b66;
  --accent: #d6c294;
  --danger: #e07a5f;
}
```

- [ ] **Step 4: Wrap the CSS imports**

In each of the three `.tsx` files, the imports of their corresponding `.css` files stay as-is — Next.js handles CSS module imports in client components via Webpack/Turbopack.

- [ ] **Step 5: Verify**

```bash
npm run typecheck && npm run lint
```

- [ ] **Step 6: Commit**

```bash
cd ..
git add site/src/designer/ui/
git commit -m "feat(designer): port control panel, material picker, loading overlay"
```

---

## Task 10: Wire up the `/customize` route

**Files:**
- Create: `site/src/app/customize/page.tsx`
- Create: `site/src/app/customize/Designer.tsx`
- Create: `site/src/app/customize/Designer.css`

The route is a server component that renders the page shell + dynamic-imports the client-only `Designer` component (which is the prototype's `App.tsx` with header/footer adjustments).

- [ ] **Step 1: Create the Designer client component**

Copy the prototype's `App.tsx` and `App.css` content into the new files, scoped under `.designer-root`:

Path: `site/src/app/customize/Designer.tsx`

```tsx
'use client';

import { useEffect, useState, useDeferredValue } from 'react';
import Scene from '@/designer/scene/Scene';
import ControlPanel from '@/designer/ui/ControlPanel';
import LoadingOverlay from '@/designer/ui/LoadingOverlay';
import { TEST_PIECES } from '@/designer/geometry/pieces';
import { MATERIAL_CATALOG } from '@/designer/materials/catalog';
import type { DesignerState, PieceSpec, PieceGeometry } from '@/designer/types';
import { buildPieceGeometry } from '@/designer/geometry/buildPieceGeometry';
import './Designer.css';
import '@/designer/ui/designer.css';

export default function Designer() {
  const [pieceId, setPieceId] = useState<string>(TEST_PIECES[0].id);
  const piece = TEST_PIECES.find((p) => p.id === pieceId)!;
  const [state, setState] = useState<DesignerState>(() => initialState(piece));

  useEffect(() => {
    setState(initialState(piece));
  }, [piece]);

  const [geometry, setGeometry] = useState<PieceGeometry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deferredCustomText = useDeferredValue(state.customText);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    buildPieceGeometry(piece, state.borderThicknessMm, deferredCustomText)
      .then((g) => {
        if (!cancelled) setGeometry(g);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [piece, state.borderThicknessMm, deferredCustomText]);

  return (
    <div className="designer-root">
      <Scene piece={piece} geometry={geometry} state={state} />
      <ControlPanel
        piece={piece}
        state={state}
        onStateChange={setState}
        pieceId={pieceId}
        onPieceChange={setPieceId}
      />
      {!geometry && !error && <LoadingOverlay />}
      {error && (
        <div className="error-overlay" role="alert">
          <h2>Geometry build failed</h2>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
}

function initialState(piece: PieceSpec): DesignerState {
  const customText: Record<string, string> = {};
  for (const layer of piece.layers) {
    if (layer.content.type === 'text') customText[layer.id] = layer.content.text;
  }
  return {
    viewMode: '3d',
    borderThicknessMm: piece.defaults.borderThicknessMm,
    layerMaterials: { ...piece.defaults.layerMaterials },
    customText,
    glowMode: 'day',
    autoRotate: false,
    showStats: false,
  };
}

void MATERIAL_CATALOG;
```

- [ ] **Step 2: Create Designer.css**

Copy `prototype-3d-preview/src/App.css` to `site/src/app/customize/Designer.css`. Wrap every selector to scope under `.designer-root` so the styles don't leak. A simple sed pass:

```bash
cd site
sed 's/^\.\(app\|brand\|error-overlay\)/\.designer-root \.\1/g' \
  ../prototype-3d-preview/src/App.css > src/app/customize/Designer.css
```

- [ ] **Step 3: Create the route page**

Path: `site/src/app/customize/page.tsx`

```tsx
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customize — AcrylixCo',
  description: 'Design your own multi-layered acrylic piece.',
};

const Designer = dynamic(() => import('./Designer'), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-screen place-items-center text-ink-700">
      <p className="font-mono text-xs uppercase tracking-[0.18em]">Loading designer…</p>
    </div>
  ),
});

export default function CustomizePage() {
  return <Designer />;
}
```

- [ ] **Step 4: Build & start locally to verify**

```bash
cd site
npm run build
```

Expected: build succeeds (the `'use client'` boundaries should keep Three.js out of the server bundle).

```bash
npm run dev
```

Open http://localhost:3000/customize. Expected: the designer loads, shows "Alex" in 3D with gold-mirror base. Stop the server (Ctrl-C).

- [ ] **Step 5: Commit**

```bash
cd ..
git add site/src/app/customize/
git commit -m "feat(designer): /customize route with dynamic-imported designer"
```

---

## Task 11: Cart line-item Zod schema

**Files:**
- Create: `site/src/designer/cart/lineItemSchema.ts`
- Create: `site/src/designer/cart/__tests__/lineItemSchema.test.ts`

Per `Plan/13-design-persistence-and-handoff.md`, when a custom design is added to cart the line item carries:

- Fonts used (per text layer: family + weight)
- Materials used (per layer: name, finish, color)
- Dimensions (overall width × height in cm, per-layer thickness in mm)
- Border thickness (mm)
- Layer count
- A thumbnail of the rendered preview

Phase 1 defines the Zod schema for this metadata. Phase 3 wires it into a real cart.

- [ ] **Step 1: Write the schema**

Path: `site/src/designer/cart/lineItemSchema.ts`

```ts
import { z } from 'zod';

const layerMaterialSummary = z.object({
  layerId: z.string(),
  materialId: z.string(),
  materialName: z.string(),
  finish: z.enum(['mirror', 'matte', 'frosted', 'gloss', 'glitter', 'neon', 'clear', 'glow']),
  color: z.string(),
  thicknessMm: z.number().positive(),
});

const layerFontSummary = z.object({
  layerId: z.string(),
  fontFamily: z.string(),
  fontUrl: z.string(),
});

export const designLineItemMetadataSchema = z.object({
  // Which template the design started from.
  templateId: z.string(),
  // Customer text, per text layer (Unicode preserved).
  customText: z.record(z.string(), z.string()),
  // Per-layer materials.
  materials: z.array(layerMaterialSummary).min(1),
  // Per-text-layer fonts.
  fonts: z.array(layerFontSummary),
  // Overall piece dimensions.
  dimensions: z.object({
    widthCm: z.number().positive(),
    heightCm: z.number().positive(),
    totalDepthMm: z.number().positive(),
  }),
  // Border thickness (offset) in millimetres.
  borderThicknessMm: z.number().positive(),
  // Convenience field — number of layers including base.
  layerCount: z.number().int().positive(),
  // URL of the rendered preview snapshot (S3 / Railway storage). Optional
  // until Phase 3 wires up storage.
  previewImageUrl: z.string().url().optional(),
});

export type DesignLineItemMetadata = z.infer<typeof designLineItemMetadataSchema>;
```

- [ ] **Step 2: Write a test**

Path: `site/src/designer/cart/__tests__/lineItemSchema.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { designLineItemMetadataSchema } from '../lineItemSchema';

describe('designLineItemMetadataSchema', () => {
  it('accepts a complete metadata payload', () => {
    const payload = {
      templateId: 'alex',
      customText: { foreground: 'Sophia' },
      materials: [
        {
          layerId: 'base',
          materialId: 'gold-mirror',
          materialName: 'Gold Mirror',
          finish: 'mirror' as const,
          color: '#d6b769',
          thicknessMm: 5,
        },
        {
          layerId: 'foreground',
          materialId: 'black-matte',
          materialName: 'Black Matte',
          finish: 'matte' as const,
          color: '#1a1b1f',
          thicknessMm: 5,
        },
      ],
      fonts: [
        {
          layerId: 'foreground',
          fontFamily: 'Anton',
          fontUrl: '/fonts/Anton-Regular.ttf',
        },
      ],
      dimensions: { widthCm: 32, heightCm: 9, totalDepthMm: 10 },
      borderThicknessMm: 6,
      layerCount: 2,
    };
    expect(designLineItemMetadataSchema.parse(payload)).toEqual(payload);
  });

  it('rejects unknown finish values', () => {
    const result = designLineItemMetadataSchema.safeParse({
      templateId: 'x',
      customText: {},
      materials: [
        {
          layerId: 'base',
          materialId: 'x',
          materialName: 'x',
          finish: 'velvet',
          color: '#000',
          thicknessMm: 5,
        },
      ],
      fonts: [],
      dimensions: { widthCm: 10, heightCm: 10, totalDepthMm: 5 },
      borderThicknessMm: 5,
      layerCount: 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative dimensions', () => {
    const result = designLineItemMetadataSchema.safeParse({
      templateId: 'x',
      customText: {},
      materials: [
        {
          layerId: 'base',
          materialId: 'x',
          materialName: 'x',
          finish: 'matte',
          color: '#000',
          thicknessMm: -1,
        },
      ],
      fonts: [],
      dimensions: { widthCm: -10, heightCm: 10, totalDepthMm: 5 },
      borderThicknessMm: 5,
      layerCount: 1,
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd site
npx vitest run src/designer/cart
```

Expected: 3 tests passing.

- [ ] **Step 4: Commit**

```bash
cd ..
git add site/src/designer/cart/
git commit -m "feat(designer): cart line-item metadata Zod schema (per Plan/13)"
```

---

## Task 12: E2E test for the `/customize` route

**Files:**
- Create: `site/e2e/customize.spec.ts`

- [ ] **Step 1: Write the spec**

Path: `site/e2e/customize.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test('/customize loads the designer with the default Alex piece', async ({ page }) => {
  await page.goto('/customize');

  // Header from the route's loading state, then the designer mounts.
  // The control panel renders the piece title once geometry is built.
  await expect(page.getByRole('heading', { name: /Alex.*bold sans plaque/ })).toBeVisible({
    timeout: 30_000,
  });

  // The 3D canvas is mounted (R3F creates a <canvas>).
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();

  // The Your-text input pre-fills with the template's default text.
  const textInput = page.locator('input.text-input').first();
  await expect(textInput).toHaveValue('Alex');
});

test('/customize lets the customer change the foreground text', async ({ page }) => {
  await page.goto('/customize');
  await expect(page.getByRole('heading', { name: /Alex/ })).toBeVisible({ timeout: 30_000 });

  const textInput = page.locator('input.text-input').first();
  await textInput.fill('Sophia');
  // Geometry rebuild is debounced via useDeferredValue — wait briefly.
  await page.waitForTimeout(1500);

  // The chars counter in the panel header reflects the new text.
  await expect(page.getByText('6 chars')).toBeVisible();
});
```

- [ ] **Step 2: Run E2E locally**

```bash
cd site
npm run test:e2e
```

Expected: all 3 specs pass (1 sanity + 2 customize).

- [ ] **Step 3: Commit**

```bash
cd ..
git add site/e2e/
git commit -m "test(e2e): customize route loads designer and accepts custom text"
```

---

## Task 13: Push, watch CI, verify production `/customize`

- [ ] **Step 1: Push to main**

```bash
git push origin main
```

- [ ] **Step 2: Watch CI**

Open https://github.com/Qukee/AcrylixCo/actions. Wait for the green check on the latest commit. Expected: lint, format, typecheck, unit, e2e, build all pass.

- [ ] **Step 3: Watch Railway deploy**

Open the Railway project. Watch the build logs. Expected: docker build succeeds (the new deps add ~30s), migrate runs (no-op), `next start -p $PORT -H 0.0.0.0` brings the app up.

- [ ] **Step 4: Smoke-test production**

```bash
curl -s -o /tmp/customize.html -w "HTTP %{http_code}\n" https://acrylixco-production.up.railway.app/customize
grep -oE '(Loading designer|Alex|Designer|3D Preview)[^<]{0,40}' /tmp/customize.html | head -5
```

Expected: HTTP 200 and the loading state markup (the page is server-rendered with the loading fallback; the designer hydrates client-side).

- [ ] **Step 5: Visual verification**

Open https://acrylixco-production.up.railway.app/customize in a browser. Verify:

1. Designer loads within ~5 seconds.
2. "Alex" renders in 3D with the gold-mirror halo base.
3. The control panel works: switching to "Nora" rebuilds geometry into the script piece.
4. Typing in the Your-text input updates the rendered text after a brief debounce.

- [ ] **Step 6: Update plan README**

Update `Plan/build/README.md` Phase 1 row to "Done — `/customize` live" with a link to the production URL. Commit + push.

---

## Phase 1 Definition of Done

Phase 1 is complete when **every item below is true**:

- [ ] `cd site && npm run lint && format:check && typecheck && test && test:e2e && build` succeeds.
- [ ] Designer code lives at `site/src/designer/` with a clean directory layout (geometry, materials, scene, ui, cart).
- [ ] `/customize` route renders all three test pieces (Alex / Nora / Mia in heart) end-to-end, including custom text and material switching.
- [ ] Golden-file tests pin the `textToShapes` and `offsetOutline` behaviour — including the script-font unified-base stress case.
- [ ] `designLineItemMetadataSchema` exists at `site/src/designer/cart/lineItemSchema.ts` with passing tests.
- [ ] CI green on `main`.
- [ ] Production `/customize` works on the live Railway URL.
- [ ] `Plan/build/README.md` Phase 1 row updated to "Done".

When this is true, demo it (live URL on a phone + desktop) and write Phase 2.

## What Phase 2 will contain

Not part of this plan. Phase 2 builds the **Storefront** — the conventional e-commerce half. Catalog browsing, product detail pages, search, filtering, structured data for SEO, and the standard content pages (About, FAQ, Shipping, Care). It also commits the storefront's visual design language (which until now has only existed in `globals.css` token form). Plan to be written after Phase 1 ships.
