export interface ControlElementRotation {
  rotX: number;
  rotY: number;
}

/**
 * Always returns a number
 * between -180 and 180
 */
export function sanitizeDeg(deg: number) {
  let newDeg = deg;
  if (newDeg < -180) {
    newDeg = Math.abs(-180 - newDeg);
  }
  if (newDeg > 180) {
    newDeg = -180 + (newDeg - 180);
  }
  return newDeg;
}

export interface Vector2 {
  x: number;
  y: number;
}

function calcAngleDegrees({ x, y }: Vector2) {
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export type QuadrantType = '+x' | '+y' | '-x' | '-y';

export interface CalculateElementRotationResult extends ControlElementRotation {
  quadrant: QuadrantType;
}

interface CalculateElementRotationParams {
  startPos: Vector2;
  currentPos: Vector2;
  elemWidth: number;
}

export function calculateElementRotation({
  startPos,
  currentPos,
  elemWidth,
}: CalculateElementRotationParams): CalculateElementRotationResult {
  /**
   * We assume that the full width of
   * the container equals a rotation
   * of 180°
   */
  const pxToDeg = (px: number) => {
    const onePxInDeg = 180 / elemWidth;
    return onePxInDeg * px;
  };

  const deltaPoint: Vector2 = {
    x: startPos.x - currentPos.x,
    y: startPos.y - currentPos.y,
  };
  const deltaAngle = calcAngleDegrees(deltaPoint);
  const dist = Math.sqrt(
    (startPos.x - currentPos.x) ** 2 + (startPos.y - currentPos.y) ** 2,
  );
  const rotationInDeg = pxToDeg(dist);
  let rotX = 0;
  let rotY = 0;

  let quadrant: QuadrantType = '+x';

  if (deltaAngle < 45 && deltaAngle >= -45) {
    rotY = rotationInDeg * -1;
    quadrant = '-y';
  }
  if (deltaAngle < -45 && deltaAngle >= -135) {
    rotX = rotationInDeg * -1;
    quadrant = '-x';
  }
  if (
    (deltaAngle < -135 && deltaAngle >= -180) ||
    (deltaAngle >= 135 && deltaAngle <= 180)
  ) {
    rotY = rotationInDeg;
    quadrant = '+y';
  }

  if (deltaAngle >= 45 && deltaAngle < 135) {
    rotX = rotationInDeg;
    quadrant = '+x';
  }

  return {
    rotX,
    rotY,
    quadrant,
  };
}
