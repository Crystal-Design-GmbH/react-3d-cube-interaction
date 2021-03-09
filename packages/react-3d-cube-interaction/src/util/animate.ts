import { ControlElementRotation } from './math';

type NumericalObj = { [key: string]: number };

function isNumericalObject(obj: any): obj is NumericalObj {
  const keys = Object.keys(obj);
  return typeof obj[keys[0]] === 'number';
}

interface AnimateObjectValuesParams<TData> {
  from: TData;
  to: TData;
  duration: number;
  onAnimate: (value: TData) => void;
  onAnimationEnd?: (value: TData) => void;
}

/**
 * Animate the properties
 * of an object. Both objects
 * are expected to have
 * the same properties.
 */
export function animateObjectValues<TData>({
  to,
  from,
  duration,
  onAnimate,
  onAnimationEnd = () => {},
}: AnimateObjectValuesParams<TData>) {
  if (!isNumericalObject(to) || !isNumericalObject(from)) return;

  const diffObj: NumericalObj = Object.keys(to).reduce((obj, key) => {
    const diff = to[key] - from[key];
    return {
      ...obj,
      [key]: diff,
    };
  }, {});

  const animFactorObj = Object.keys(to).reduce((obj, key) => {
    const animFactor = diffObj[key] / duration;
    return {
      ...obj,
      [key]: animFactor,
    };
  }, {}) as { [key: string]: number };
  let start = 0;
  let cancelled = false;

  const animate = (timestamp: number = Date.now()) => {
    if (!start) {
      start = timestamp;
    }
    const elapsed = timestamp - start;
    const newValues = Object.keys(to).reduce((obj, key) => {
      let value = from[key] + animFactorObj[key] * elapsed;
      return {
        ...obj,
        [key]: value,
      };
    }, {});
    onAnimate(newValues as TData);

    if (elapsed < duration && !cancelled) {
      window.setTimeout(() => animate(), 1000 / 60);
    } else {
      onAnimate(to);
      onAnimationEnd(to);
    }
  };
  animate();

  return () => {
    cancelled = true;
  };
}

type CubeSide = 'back' | 'front' | 'left' | 'right' | 'top';

interface RotateCubeParams {
  currentRotation: ControlElementRotation;
  targetRotation: ControlElementRotation;
  onRotationChange: (rot: ControlElementRotation) => void;
  onRotationEnd: (rot: ControlElementRotation) => void;
}

interface RotateToCubeSideParams
  extends Omit<RotateCubeParams, 'targetRotation'> {
  side: CubeSide;
}

const rotationTargets: { [key in CubeSide]: ControlElementRotation } = {
  top: {
    rotX: -90,
    rotY: 0,
  },
  back: {
    rotX: 0,
    rotY: 180,
  },
  left: {
    rotX: 0,
    rotY: 90,
  },
  right: {
    rotX: 0,
    rotY: 270,
  },
  front: {
    rotX: 0,
    rotY: 0,
  },
};

export function animateToRotation({
  targetRotation,
  currentRotation,
  onRotationChange,
  onRotationEnd,
}: RotateCubeParams) {
  animateObjectValues<ControlElementRotation>({
    from: currentRotation,
    to: targetRotation,
    duration: 500,
    onAnimate: onRotationChange,
    onAnimationEnd: onRotationEnd,
  });
}

export function rotateToCubeSide({
  side,
  currentRotation,
  onRotationChange,
  onRotationEnd,
}: RotateToCubeSideParams) {
  const targetRotation = rotationTargets[side];
  animateToRotation({
    currentRotation,
    onRotationChange,
    onRotationEnd,
    targetRotation,
  });
}
