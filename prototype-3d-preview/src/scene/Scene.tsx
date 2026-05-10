import { Suspense, useMemo, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera, Stats } from '@react-three/drei';
import { ACESFilmicToneMapping, type Group, MathUtils } from 'three';
import { Studio } from './Studio';
import { Piece } from './Piece';
import type { DesignerState, PieceGeometry, PieceSpec } from '../types';

interface SceneProps {
  piece: PieceSpec;
  geometry: PieceGeometry | null;
  state: DesignerState;
}

export default function Scene({ piece, geometry, state }: SceneProps) {
  // Camera distance is sized to the piece bounds so different pieces frame
  // similarly regardless of scale.
  const camDistance = useMemo(() => {
    if (!geometry) return 320;
    const w = geometry.bounds.width;
    const h = geometry.bounds.height;
    // Square / portrait pieces (heart, monogram) need more pull-back than
    // wide name plaques because the camera FOV is tight.
    const aspect = w / Math.max(h, 1);
    const padFactor = aspect > 2 ? 2.0 : 2.4;
    return Math.max(w, h) * padFactor + 100;
  }, [geometry]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1,
        alpha: false,
      }}
    >
      {/* Bright cream backdrop — neutral daylight studio. Pieces read true
          to colour against it without the dramatic dark-room reflections. */}
      <color attach="background" args={['#f3ede0']} />
      <fog attach="fog" args={['#f3ede0', 600, 1800]} />
      {state.viewMode === '3d' ? (
        <PerspectiveCamera
          makeDefault
          position={[
            camDistance * 0.22,
            (geometry ? geometry.bounds.height / 2 : 0) + camDistance * 0.1,
            camDistance,
          ]}
          fov={26}
          near={1}
          far={camDistance * 4}
        />
      ) : (
        <OrthographicCamera
          makeDefault
          position={[0, geometry ? geometry.bounds.height / 2 : 0, camDistance * 1.2]}
          near={1}
          far={camDistance * 4}
          zoom={geometry ? Math.min(window.innerWidth, window.innerHeight) / geometry.bounds.width / 1.2 : 2}
        />
      )}

      <Suspense fallback={null}>
        <Studio />
        {geometry && geometry.pieceId === piece.id && (
          <Piece piece={piece} geometry={geometry} state={state} />
        )}
        <SceneRig autoRotate={state.autoRotate} viewMode={state.viewMode} />
      </Suspense>

      {state.viewMode === '3d' ? (
        <OrbitControls
          enablePan
          enableRotate
          enableZoom
          autoRotate={state.autoRotate}
          autoRotateSpeed={0.6}
          minDistance={50}
          maxDistance={camDistance * 3}
          target={[0, geometry ? geometry.bounds.height / 2 : 0, 0]}
          maxPolarAngle={MathUtils.degToRad(110)}
          minPolarAngle={MathUtils.degToRad(20)}
        />
      ) : (
        <OrbitControls enablePan enableZoom enableRotate={false} target={[0, geometry ? geometry.bounds.height / 2 : 0, 0]} />
      )}

      {state.showStats && <Stats />}
    </Canvas>
  );
}

function SceneRig({ autoRotate: _autoRotate, viewMode }: { autoRotate: boolean; viewMode: '2d' | '3d' }) {
  const { camera } = useThree();
  const groupRef = useRef<Group>(null);

  // Reset camera when view mode changes.
  useEffect(() => {
    if (viewMode === '2d') {
      camera.position.set(0, 0, 400);
      camera.lookAt(0, 0, 0);
    }
  }, [viewMode, camera]);

  return <group ref={groupRef} />;
}
