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

const FIRST_PIECE = TEST_PIECES[0]!;

/**
 * Top-level designer: owns the selected pieceId. The actual scene is rendered
 * by `<DesignerForPiece />` which is keyed by pieceId — when the user picks a
 * different piece, React unmounts and remounts the child, which is the
 * canonical way to reset state when a prop changes (avoids
 * react-hooks/set-state-in-effect on a piece switch).
 *
 * See https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes
 */
export default function Designer() {
  const [pieceId, setPieceId] = useState<string>(FIRST_PIECE.id);
  const piece = TEST_PIECES.find((p) => p.id === pieceId) ?? FIRST_PIECE;

  return (
    <div className="designer-root">
      <DesignerForPiece
        key={piece.id}
        piece={piece}
        pieceId={pieceId}
        onPieceChange={setPieceId}
      />
    </div>
  );
}

interface DesignerForPieceProps {
  piece: PieceSpec;
  pieceId: string;
  onPieceChange: (id: string) => void;
}

function DesignerForPiece({ piece, pieceId, onPieceChange }: DesignerForPieceProps) {
  const [state, setState] = useState<DesignerState>(() => initialState(piece));
  const [geometry, setGeometry] = useState<PieceGeometry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deferredCustomText = useDeferredValue(state.customText);

  // Geometry rebuild — async effect with cancellation. The `error` and
  // `geometry` setters are called inside the promise callbacks (not the
  // synchronous effect body), which is the supported pattern.
  useEffect(() => {
    let cancelled = false;
    buildPieceGeometry(piece, state.borderThicknessMm, deferredCustomText)
      .then((g) => {
        if (cancelled) return;
        setGeometry(g);
        setError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [piece, state.borderThicknessMm, deferredCustomText]);

  return (
    <>
      <Scene piece={piece} geometry={geometry} state={state} />
      <ControlPanel
        piece={piece}
        state={state}
        onStateChange={setState}
        pieceId={pieceId}
        onPieceChange={onPieceChange}
      />
      {!geometry && !error && <LoadingOverlay />}
      {error && (
        <div className="error-overlay" role="alert">
          <h2>Geometry build failed</h2>
          <pre>{error}</pre>
        </div>
      )}
    </>
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
