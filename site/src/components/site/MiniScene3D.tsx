'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import Scene from '@/designer/scene/Scene';
import { TEST_PIECES } from '@/designer/geometry/pieces';
import { buildPieceGeometry } from '@/designer/geometry/buildPieceGeometry';
import { MATERIAL_CATALOG } from '@/designer/materials/catalog';
import type {
  DesignerState,
  PieceGeometry,
  PieceSpec,
} from '@/designer/types';

export type MiniScene3DTemplate = 'plaque' | 'big-letter';

interface MiniScene3DProps {
  text: string;
  primaryHex: string;
  secondaryHex: string;
  fontUrl: string;
  borderWidthMm: number;
  template: MiniScene3DTemplate;
}

const PLAQUE_TEMPLATE = TEST_PIECES.find((p) => p.id === 'alex')!;
const BIG_LETTER_TEMPLATE = TEST_PIECES.find((p) => p.id === 'big-letter')!;

export function MiniScene3D({
  text,
  primaryHex,
  secondaryHex,
  fontUrl,
  borderWidthMm,
  template,
}: MiniScene3DProps) {
  const deferredText = useDeferredValue(text);

  const [geometry, setGeometry] = useState<PieceGeometry | null>(null);

  const effectiveText = deferredText || 'Your name';
  const firstLetter = effectiveText.trim().charAt(0).toUpperCase() || 'A';

  const customText = useMemo<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    if (template === 'big-letter') {
      // Initial is the big background letter; name is the full text laid
      // into the counter of the initial.
      out.initial = firstLetter;
      out.name = effectiveText;
    } else {
      out.foreground = effectiveText;
    }
    return out;
  }, [template, firstLetter, effectiveText]);

  // For the big-letter template the initial layer's font is fixed (DM
  // Serif Display has the open counter the design relies on). For the
  // plaque template the user's chosen font drives both 2D and 3D, so
  // pipe it onto the text layer of the cloned piece.
  const piece: PieceSpec = useMemo(() => {
    const base = template === 'big-letter' ? BIG_LETTER_TEMPLATE : PLAQUE_TEMPLATE;
    if (template === 'big-letter') {
      // Override the name layer's font to whatever the user picked so the
      // letterform inside the initial respects the dropdown.
      return {
        ...base,
        layers: base.layers.map((l) =>
          l.id === 'name' && l.content.type === 'text'
            ? { ...l, content: { ...l.content, fontUrl } }
            : l,
        ),
      };
    }
    return {
      ...base,
      layers: base.layers.map((l) =>
        l.content.type === 'text'
          ? { ...l, content: { ...l.content, fontUrl } }
          : l,
      ),
    };
  }, [template, fontUrl]);

  useEffect(() => {
    let cancelled = false;
    buildPieceGeometry(piece, borderWidthMm, customText)
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
  }, [piece, borderWidthMm, customText]);

  const state: DesignerState = useMemo(() => {
    const layerMaterials: Record<string, string> =
      template === 'big-letter'
        ? {
            base: nearestMaterialId(secondaryHex),
            initial: nearestMaterialId(secondaryHex),
            name: nearestMaterialId(primaryHex),
          }
        : {
            base: nearestMaterialId(secondaryHex),
            foreground: nearestMaterialId(primaryHex),
          };
    return {
      viewMode: '3d',
      borderThicknessMm: borderWidthMm,
      layerMaterials,
      customText,
      glowMode: 'day',
      autoRotate: false,
      showStats: false,
    };
  }, [template, primaryHex, secondaryHex, customText, borderWidthMm]);

  return (
    <div className="absolute inset-0">
      <Scene piece={piece} geometry={geometry} state={state} />
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
