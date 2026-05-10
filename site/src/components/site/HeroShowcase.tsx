'use client';

import { useEffect, useState } from 'react';
import Scene from '@/designer/scene/Scene';
import { TEST_PIECES } from '@/designer/geometry/pieces';
import { buildPieceGeometry } from '@/designer/geometry/buildPieceGeometry';
import type { DesignerState, PieceGeometry } from '@/designer/types';

const SHOWCASE_PIECE = TEST_PIECES.find((p) => p.id === 'alex')!;

const SHOWCASE_STATE: DesignerState = {
  viewMode: '3d',
  borderThicknessMm: SHOWCASE_PIECE.defaults.borderThicknessMm,
  layerMaterials: { ...SHOWCASE_PIECE.defaults.layerMaterials },
  customText: { foreground: 'Alex' },
  glowMode: 'day',
  autoRotate: true,
  showStats: false,
};

export function HeroShowcase() {
  const [geometry, setGeometry] = useState<PieceGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    buildPieceGeometry(
      SHOWCASE_PIECE,
      SHOWCASE_STATE.borderThicknessMm,
      SHOWCASE_STATE.customText,
    )
      .then((g) => {
        if (!cancelled) setGeometry(g);
      })
      .catch(() => {
        // Silently fall back — the cream surface still reads as the brand.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-cream-100 ring-1 ring-cream-300/60 md:aspect-[5/6]">
      <Scene piece={SHOWCASE_PIECE} geometry={geometry} state={SHOWCASE_STATE} />
      {!geometry && (
        <div
          className="absolute inset-0 grid place-items-center"
          aria-hidden
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Loading the studio…
          </span>
        </div>
      )}
    </div>
  );
}
