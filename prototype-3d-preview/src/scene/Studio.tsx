import { Environment, Lightformer } from '@react-three/drei';

/**
 * Bright daylight studio. The piece is the subject; lighting is even and
 * generous so the user sees the actual material colour from any camera
 * angle, not just the one that catches a reflection.
 *
 * No visible floor — only a contact shadow grounds the piece. The HDR
 * environment is used for PBR reflections only (`background={false}`); the
 * scene background is a separate flat cream colour set on the Canvas.
 */
export function Studio() {
  return (
    <>
      {/* HDR environment for PBR reflections (mirror, gloss, frosted). It is
          NOT visible — the scene's flat cream background is shown instead. */}
      <Environment preset="city" environmentIntensity={1.05} background={false}>
        {/* A large soft front light source baked into the env so mirrors and
            glossy surfaces pick up a clean, bright reflection rather than a
            dark room. */}
        <Lightformer
          intensity={4}
          color="#fffaf0"
          form="rect"
          scale={[14, 9, 1]}
          position={[0, 6, 8]}
          rotation={[0, 0, 0]}
        />
        <Lightformer
          intensity={2}
          color="#ffffff"
          form="rect"
          scale={[10, 8, 1]}
          position={[-7, 4, 4]}
          rotation={[0, Math.PI / 4, 0]}
        />
        <Lightformer
          intensity={2}
          color="#ffffff"
          form="rect"
          scale={[10, 8, 1]}
          position={[7, 4, 4]}
          rotation={[0, -Math.PI / 4, 0]}
        />
      </Environment>

      {/* Strong even ambient — the foundation of true-colour rendering. */}
      <ambientLight intensity={0.85} color="#fff7ea" />

      {/* Key — slightly above and front-right, casts the drop shadow. */}
      <directionalLight
        position={[80, 280, 320]}
        intensity={1.3}
        color="#fff5e8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={10}
        shadow-camera-far={1000}
        shadow-camera-left={-300}
        shadow-camera-right={300}
        shadow-camera-top={400}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0002}
      />

      {/* Soft side fill from upper-left — fills shadow side without
          flattening the form. */}
      <directionalLight position={[-260, 180, 120]} intensity={0.55} color="#ffffff" />

      {/* Cool rim from behind — separates the piece from the cream backdrop. */}
      <directionalLight position={[60, 140, -260]} intensity={0.35} color="#dde6f0" />

      {/* Small bottom bounce — mimics light reflecting up off the imagined
          surface, prevents the underside reading as a black void. */}
      <directionalLight position={[0, -120, 220]} intensity={0.4} color="#fff0d8" />

      {/* Invisible shadow-catcher plane just below the piece. shadowMaterial
          renders only where shadows fall — anywhere else the canvas's cream
          backdrop shows through, so there is no visible "plate" edge. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.6, 0]}
        receiveShadow
      >
        <planeGeometry args={[2000, 2000]} />
        <shadowMaterial transparent opacity={0.18} color="#2a261d" />
      </mesh>
    </>
  );
}
