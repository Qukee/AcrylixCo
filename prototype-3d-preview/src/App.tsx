import { useEffect, useState, useDeferredValue } from 'react';
import Scene from './scene/Scene';
import ControlPanel from './ui/ControlPanel';
import LoadingOverlay from './ui/LoadingOverlay';
import { TEST_PIECES } from './geometry/pieces';
import { MATERIAL_CATALOG } from './materials/catalog';
import type { DesignerState, PieceSpec } from './types';
import { buildPieceGeometry } from './geometry/buildPieceGeometry';
import type { PieceGeometry } from './types';
import './App.css';

export default function App() {
  const [pieceId, setPieceId] = useState<string>(TEST_PIECES[0].id);
  const piece = TEST_PIECES.find((p) => p.id === pieceId)!;

  const [state, setState] = useState<DesignerState>(() => initialState(piece));

  // When piece changes, reset state to that piece's defaults.
  useEffect(() => {
    setState(initialState(piece));
  }, [piece]);

  const [geometry, setGeometry] = useState<PieceGeometry | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Defer custom-text changes so fast typing doesn't block the UI on
  // geometry rebuilds; the latest text wins once the user pauses.
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
    <div className="app">
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
      <header className="brand">
        <span className="brand__mark">A</span>
        <span className="brand__name">AcrylixCo</span>
        <span className="brand__divider" />
        <span className="brand__sub">3D Preview Lab</span>
      </header>
    </div>
  );
}

function initialState(piece: PieceSpec): DesignerState {
  const customText: Record<string, string> = {};
  for (const layer of piece.layers) {
    if (layer.content.type === 'text') {
      customText[layer.id] = layer.content.text;
    }
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

// Reference catalog so the import isn't dropped — the picker uses it.
void MATERIAL_CATALOG;
