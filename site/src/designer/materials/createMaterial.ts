import {
  Color,
  CanvasTexture,
  RepeatWrapping,
  MeshPhysicalMaterial,
  type ColorRepresentation,
} from 'three';
import type { MaterialDef } from '../types';

/**
 * Convert a `MaterialDef` into a Three.js `MeshPhysicalMaterial` configured
 * for that finish kind. The whole point is that mirror/matte/frosted/gloss/
 * glitter/neon/clear/glow each render visibly differently — this function is
 * the rule book.
 *
 * IOR is fixed at 1.49 (the actual refractive index of acrylic / PMMA) for
 * any finish that involves transmission, so refraction reads correctly.
 */
export function createMaterial(def: MaterialDef, glowMode: 'day' | 'night'): MeshPhysicalMaterial {
  const color = new Color(def.color);

  switch (def.finish) {
    case 'mirror':
      // High metalness, low roughness, full environment reflection. The base
      // color tints the reflection (gold tints warm, silver stays neutral).
      // A touch of intrinsic colour bleed-through (slight roughness) keeps the
      // chosen colour readable even when reflections dominate.
      return new MeshPhysicalMaterial({
        color,
        metalness: 0.95,
        roughness: 0.12,
        envMapIntensity: 1.05,
        clearcoat: 0.5,
        clearcoatRoughness: 0.08,
      });

    case 'matte':
      // Pure diffuse. High roughness, no clearcoat, no metalness.
      return new MeshPhysicalMaterial({
        color,
        roughness: 0.85,
        metalness: 0,
        envMapIntensity: 0.45,
        sheen: 0.05,
        sheenColor: color,
      });

    case 'frosted':
      // Subsurface-soft acrylic — high transmission with significant roughness
      // for the frosted look. IOR set to acrylic's real value.
      return new MeshPhysicalMaterial({
        color,
        roughness: 0.5,
        transmission: 0.78,
        thickness: 4,
        ior: 1.49,
        attenuationDistance: 90,
        attenuationColor: color,
        envMapIntensity: 0.9,
      });

    case 'gloss': {
      // Smooth painted gloss — non-metal with strong clearcoat for that
      // sharp specular highlight.
      const m = new MeshPhysicalMaterial({
        color,
        roughness: 0.18,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        envMapIntensity: 0.95,
      });
      return m;
    }

    case 'glitter': {
      // Sparkle effect: noticeably metallic with iridescence + a denser
      // sparkly normal map that breaks specular into many tiny highlights.
      const m = new MeshPhysicalMaterial({
        color,
        metalness: 0.75,
        roughness: 0.45,
        envMapIntensity: 1.2,
        clearcoat: 0.55,
        clearcoatRoughness: 0.18,
        iridescence: 0.3,
        iridescenceIOR: 1.4,
      });
      m.normalMap = createGlitterNormalTexture(512);
      m.normalScale.set(2.4, 2.4);
      return m;
    }

    case 'neon': {
      // Saturated, slightly emissive — pops in any lighting.
      const emissive = color.clone().multiplyScalar(0.7);
      return new MeshPhysicalMaterial({
        color,
        roughness: 0.45,
        metalness: 0,
        emissive,
        emissiveIntensity: 0.4,
        clearcoat: 0.6,
        clearcoatRoughness: 0.12,
        envMapIntensity: 0.7,
      });
    }

    case 'clear':
      // Cast acrylic — high transmission, low roughness, true IOR.
      return new MeshPhysicalMaterial({
        color: new Color('#ffffff'),
        roughness: 0.04,
        transmission: 1,
        thickness: 6,
        ior: 1.49,
        attenuationDistance: 220,
        attenuationColor: color,
        envMapIntensity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
      });

    case 'glow': {
      // Glow-in-the-dark — opaque pastel by day, emissive by night.
      const isNight = glowMode === 'night';
      return new MeshPhysicalMaterial({
        color,
        roughness: isNight ? 0.6 : 0.85,
        metalness: 0,
        emissive: isNight ? color.clone() : new Color('#000000'),
        emissiveIntensity: isNight ? 1.4 : 0,
        envMapIntensity: isNight ? 0.3 : 0.6,
      });
    }

    default:
      return new MeshPhysicalMaterial({ color });
  }
}

/** Build a small noise normal map for the glitter finish. */
function createGlitterNormalTexture(size: number): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  // Base = normal map "flat" colour (RGB 128, 128, 255).
  ctx.fillStyle = 'rgb(128,128,255)';
  ctx.fillRect(0, 0, size, size);

  // Sprinkle ~1500 small "facets" with random tilted normals.
  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 1.4 + 0.4;
    const tilt = Math.random() * Math.PI * 2;
    const strength = 0.6 + Math.random() * 0.4;
    const nx = Math.round(128 + Math.cos(tilt) * 100 * strength);
    const ny = Math.round(128 + Math.sin(tilt) * 100 * strength);
    ctx.fillStyle = `rgb(${nx},${ny},${randInt(180, 255)})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.needsUpdate = true;
  return texture;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export type { ColorRepresentation };
