import { useMemo } from 'react';
import { AcrylicLayer } from './AcrylicLayer';
import { findMaterial } from '../materials/catalog';
import type { DesignerState, PieceGeometry, PieceSpec } from '../types';

interface PieceProps {
  piece: PieceSpec;
  geometry: PieceGeometry;
  state: DesignerState;
}

/**
 * Render an entire piece: stack each layer at the right Z depth, with the
 * physical thickness preserved. The base sits at z=0; the foreground/accent
 * layers sit on top of it in order.
 */
export function Piece({ piece, geometry, state }: PieceProps) {
  // Compute z positions cumulatively so each layer sits flush on top of the
  // one below.
  const zMap = useMemo(() => {
    const zs = new Map<string, number>();
    let z = 0;
    const ordered = [...geometry.layers].sort((a, b) => a.zStackOrder - b.zStackOrder);
    for (const l of ordered) {
      zs.set(l.layerId, z);
      z += l.thicknessMm;
    }
    return zs;
  }, [geometry.layers]);

  return (
    <group>
      {geometry.layers.map((layer) => {
        const matId =
          state.layerMaterials[layer.layerId] ??
          piece.defaults.layerMaterials[layer.layerId] ??
          piece.defaults.layerMaterials.base ??
          'silver-mirror';
        const material = findMaterial(matId);
        return (
          <AcrylicLayer
            key={layer.layerId}
            shapes={layer.shapes}
            thicknessMm={layer.thicknessMm}
            zMm={zMap.get(layer.layerId) ?? 0}
            offsetMm={layer.offsetMm}
            material={material}
            glowMode={state.glowMode}
          />
        );
      })}
    </group>
  );
}
