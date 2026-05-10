import { Shape } from 'three';

/**
 * A heart shape, in millimetres, centred at origin and bounded by
 * (-size/2, -size/2) to (size/2, size/2).
 *
 * Built from two cubic bezier halves that meet at the top dimple and bottom
 * point. Symmetrical about the Y axis.
 */
export function heartShape(size: number): Shape {
  const s = size / 2;
  const shape = new Shape();

  // Start at the bottom point.
  shape.moveTo(0, -s);

  // Right half — bottom point up to the right peak.
  shape.bezierCurveTo(
    1.0 * s,
    -0.5 * s,
    1.05 * s,
    0.4 * s,
    0.5 * s,
    0.6 * s,
  );
  // Right peak across the dimple to the centre top.
  shape.bezierCurveTo(
    0.25 * s,
    0.75 * s,
    0.05 * s,
    0.55 * s,
    0,
    0.4 * s,
  );
  // Left side mirror — centre top to left peak.
  shape.bezierCurveTo(
    -0.05 * s,
    0.55 * s,
    -0.25 * s,
    0.75 * s,
    -0.5 * s,
    0.6 * s,
  );
  // Left peak down to the bottom point.
  shape.bezierCurveTo(
    -1.05 * s,
    0.4 * s,
    -1.0 * s,
    -0.5 * s,
    0,
    -s,
  );

  return shape;
}
