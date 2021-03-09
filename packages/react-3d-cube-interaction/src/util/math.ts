export interface ControlElementRotation {
  rotX: number;
  rotY: number;
}

/**
 * Represents the same rotation in a different
 * format:
 * - horizontal rotation = rotX
 * - vertical rotation = rotY * -1
 */
export interface ControlElementRotationInverted {
  horizontal: number;
  vertical: number;
}

export type CubeRotation = ControlElementRotationInverted &
  ControlElementRotation;

/**
 * Converts inverted rotation
 * to standard ControlElementRotation
 */
export function convertFromInverted(
  rotation: ControlElementRotationInverted,
): ControlElementRotation {
  return {
    rotY: rotation.horizontal,
    rotX: rotation.vertical * -1,
  };
}

/**
 * Converts standard rotation
 * to inverted rotation
 */
export function convertToInverted(
  rotation: ControlElementRotation,
): ControlElementRotationInverted {
  return {
    horizontal: rotation.rotY,
    vertical: rotation.rotX * -1,
  };
}

function isInvertedRotation(
  rotation: ControlElementRotation | ControlElementRotationInverted,
): rotation is ControlElementRotationInverted {
  return (rotation as ControlElementRotationInverted).horizontal !== undefined;
}

/**
 * Converts inverted rotation
 * to standard rotation if needed
 */
export function normalizeRotationFormat(
  rotation: ControlElementRotation | ControlElementRotationInverted,
): ControlElementRotation {
  if (isInvertedRotation(rotation)) {
    return convertFromInverted(rotation);
  }
  return rotation;
}

export function toCubeRotation(rotation: ControlElementRotation): CubeRotation {
  return {
    ...rotation,
    ...convertToInverted(rotation),
  };
}

export function snapRotation({
  rotX,
  rotY,
}: ControlElementRotation): ControlElementRotation {
  const ROUND_TO = 5;
  return {
    rotX: Math.round(rotX / ROUND_TO) * ROUND_TO,
    rotY: Math.round(rotY / ROUND_TO) * ROUND_TO,
  };
}

export function sanitizeRotation({
  rotX,
  rotY,
}: ControlElementRotation): ControlElementRotation {
  let newRotX = rotX;
  let newRotY = rotY;
  if (newRotX > 0) {
    newRotX = 0;
  }
  if (newRotX < -90) {
    newRotX = -90;
  }
  if (newRotY > 360) {
    newRotY = newRotY - 360;
  }
  if (newRotY < 0) {
    newRotY = 360 + newRotY;
  }

  return {
    rotX: newRotX,
    rotY: newRotY,
  };
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
   * of 210°
   */
  const pxToDeg = (px: number) => {
    const onePxInDeg = 210 / elemWidth;
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
