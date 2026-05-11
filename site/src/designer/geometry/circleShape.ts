import { Shape } from 'three';

/**
 * A circle, in millimetres, centred at origin with diameter `size`.
 * Used for coaster-style pieces where the silhouette is a perfect disc.
 *
 * Approximated by 64 line segments — same fidelity as `Shape.getPoints(32)`
 * used downstream in `translateShape`, so a higher count would be lost.
 */
export function circleShape(size: number): Shape {
  const r = size / 2;
  const shape = new Shape();
  const segments = 64;
  shape.moveTo(r, 0);
  for (let i = 1; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    shape.lineTo(Math.cos(theta) * r, Math.sin(theta) * r);
  }
  shape.closePath();
  return shape;
}
