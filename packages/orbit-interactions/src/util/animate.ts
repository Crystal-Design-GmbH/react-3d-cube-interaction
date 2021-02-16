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
      onAnimationEnd(newValues as TData);
    }
  };
  animate();

  return () => {
    cancelled = true;
  };
}

type CubeSide = 'back' | 'front' | 'left' | 'right' | 'top';

interface RotateToCubeSideParams {
  side: CubeSide;
  currentRotation: ControlElementRotation;
  onRotationChange: (rot: ControlElementRotation) => void;
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

export function rotateToCubeSide({
  side,
  currentRotation,
  onRotationChange,
}: RotateToCubeSideParams) {
  const targetRot = rotationTargets[side];
  animateObjectValues<ControlElementRotation>({
    from: currentRotation,
    to: targetRot,
    duration: 500,
    onAnimate: onRotationChange,
  });
}
