import { useMemo } from 'react';
import { ExtrudeGeometry, type Shape } from 'three';
import { createMaterial } from '../materials/createMaterial';
import type { MaterialDef } from '../types';

interface AcrylicLayerProps {
  shapes: Shape[];
  thicknessMm: number;
  zMm: number;
  offsetMm: { x: number; y: number };
  material: MaterialDef;
  glowMode: 'day' | 'night';
}

/**
 * Render one acrylic layer as an extruded mesh. The Shape is in mm and the
 * extrusion depth is the layer's physical thickness in mm. We add a tiny
 * bevel so the cut edge catches light realistically rather than reading as
 * a CG-perfect 90° corner.
 */
export function AcrylicLayer({
  shapes,
  thicknessMm,
  zMm,
  offsetMm,
  material,
  glowMode,
}: AcrylicLayerProps) {
  const geometry = useMemo(() => {
    if (shapes.length === 0) return null;

    // Bevel parameters — tiny relative to thickness, gives the edge a subtle
    // chamfer that reads as a real laser-cut edge under light.
    const bevelThickness = Math.min(0.35, thicknessMm * 0.08);
    const bevelSize = bevelThickness * 0.9;

    const geom = new ExtrudeGeometry(shapes, {
      depth: thicknessMm,
      bevelEnabled: true,
      bevelThickness,
      bevelSize,
      bevelSegments: 2,
      curveSegments: 24,
    });
    geom.computeVertexNormals();
    return geom;
  }, [shapes, thicknessMm]);

  const threeMaterial = useMemo(() => createMaterial(material, glowMode), [material, glowMode]);

  if (!geometry) return null;

  return (
    <mesh
      geometry={geometry}
      material={threeMaterial}
      position={[offsetMm.x, offsetMm.y, zMm]}
      castShadow
      receiveShadow
    />
  );
}
