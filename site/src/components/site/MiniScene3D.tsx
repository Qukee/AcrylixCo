'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import Scene from '@/designer/scene/Scene';
import { TEST_PIECES } from '@/designer/geometry/pieces';
import { buildPieceGeometry } from '@/designer/geometry/buildPieceGeometry';
import { MATERIAL_CATALOG } from '@/designer/materials/catalog';
import type { DesignerState, PieceGeometry } from '@/designer/types';

// "Alex" — single-line bold sans plaque. Universal template for the mini
// preview, regardless of which product page mounts the editor; the user
// gets a fast-rebuild plaque that exercises both base + foreground layers.
const TEMPLATE = TEST_PIECES[0]!;

interface MiniScene3DProps {
  text: string;
  primaryHex: string;
  secondaryHex: string;
}

export function MiniScene3D({ text, primaryHex, secondaryHex }: MiniScene3DProps) {
  // Defer geometry rebuilds while the user types so the canvas doesn't
  // re-thrash on every keystroke. React 19 schedules these as non-urgent.
  const deferredText = useDeferredValue(text);

  const [geometry, setGeometry] = useState<PieceGeometry | null>(null);

  const customText = useMemo(
    () => ({ foreground: deferredText || 'Your name' }),
    [deferredText],
  );

  useEffect(() => {
    let cancelled = false;
    buildPieceGeometry(TEMPLATE, TEMPLATE.defaults.borderThicknessMm, customText)
      .then((g) => {
        if (!cancelled) setGeometry(g);
      })
      .catch(() => {
        // Silently ignore — the canvas just stays empty until a future
        // rebuild succeeds.
      });
    return () => {
      cancelled = true;
    };
  }, [customText]);

  const state: DesignerState = useMemo(
    () => ({
      viewMode: '3d',
      borderThicknessMm: TEMPLATE.defaults.borderThicknessMm,
      layerMaterials: {
        base: nearestMaterialId(secondaryHex),
        foreground: nearestMaterialId(primaryHex),
      },
      customText,
      glowMode: 'day',
      autoRotate: true,
      showStats: false,
    }),
    [primaryHex, secondaryHex, customText],
  );

  return (
    <div className="absolute inset-0">
      <Scene piece={TEMPLATE} geometry={geometry} state={state} />
    </div>
  );
}

// Pick the catalog material whose colour is closest to the user's chosen
// hex in plain RGB-Euclidean space. Cheaper and good enough for a preview;
// the full /customize designer is where exact materials get chosen.
function nearestMaterialId(hex: string): string {
  const target = hexToRgb(hex);
  if (!target) return MATERIAL_CATALOG[0]!.id;
  let bestId = MATERIAL_CATALOG[0]!.id;
  let bestDist = Infinity;
  for (const m of MATERIAL_CATALOG) {
    const c = hexToRgb(m.color);
    if (!c) continue;
    const d =
      (target.r - c.r) * (target.r - c.r) +
      (target.g - c.g) * (target.g - c.g) +
      (target.b - c.b) * (target.b - c.b);
    if (d < bestDist) {
      bestDist = d;
      bestId = m.id;
    }
  }
  return bestId;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return {
    r: parseInt(m[1]!, 16),
    g: parseInt(m[2]!, 16),
    b: parseInt(m[3]!, 16),
  };
}
