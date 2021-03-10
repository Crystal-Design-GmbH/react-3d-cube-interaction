import React, {
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {
  controlElementContainer,
  controlElement,
  cubeFace,
  cubeFaceFront,
  cubeFaceBack,
  cubeFaceRight,
  cubeFaceLeft,
  cubeFaceTop,
  cubeFaceBottom,
  hidden,
  // rotateIcon,
  // rotateIconHorizontal,
  // rotateIconVertical,
} from './index.module.css';
import { animateToRotation, rotateToCubeSide } from './util/animate';
import {
  ControlElementRotation,
  calculateElementRotation,
  CalculateElementRotationResult,
  sanitizeRotation,
  snapRotation,
  ControlElementRotationInverted,
  normalizeRotationFormat,
  convertToInverted,
  CubeRotation,
  toCubeRotation,
} from './util/math';
import {
  AllPointerEventTypes,
  NormalizedInteractionEvent,
  normalizePointerEvent,
} from './util/pointer-events';
import usePinch, {
  CONTAINER_WIDTH_ZOOM_FACTORS,
  UsePinchParams,
} from './util/usePinch';

// import rotateIconImg from './rotate.svg';

interface Props extends Pick<UsePinchParams, 'minZoom' | 'maxZoom'> {
  /**
   * Element on which to bind
   * click/touch start listeners.
   * Defaults to document.body.
   */
  interactionElement?: HTMLElement | null;
  /**
   * Element on which to bind
   * click/touch move listeners.
   * This way, a gesture can continue
   * outside of the interactionElement.
   * Defaults to document.body.
   */
  interactionMoveElement?: HTMLElement | null;
  initialRotation?: ControlElementRotation | ControlElementRotationInverted;
  /**
   * Size of the cube.
   * Must be an __absolute__
   * CSS Value, e.g. px, em, vh, etc.
   * Defaults to 120px
   */
  size?: string;
  /**
   * Called when rotation changes.
   * X rotation is a value between -90° and 0°
   * Y rotation is a value between 0° and 360°
   */
  onRotationChange?: (p: CubeRotation) => void;
  /**
   * Returns a scaled value:
   * 5 = width of interactionElement
   */
  onZoomChange?: (p: number) => void;
  classnames?: Partial<{
    cubeFace: string;
    cubeFaceFront: string;
    cubeFaceBack: string;
    cubeFaceRight: string;
    cubeFaceLeft: string;
    cubeFaceTop: string;
    cubeFaceBottom: string;
  }>;
  /**
   * Defaults to german cube
   * face descriptors
   */
  cubeFaceChildren?: {
    front: ReactNode;
    back: ReactNode;
    right: ReactNode;
    left: ReactNode;
    top: ReactNode;
    bottom: ReactNode;
  };
  /**
   * If set, cube will automatically fade
   * away if no user interaction occured
   * after the specified amount of milliseconds
   */
  autoHide?: number;
}

export interface CubeControlApi {
  rotateTo: (
    newRotation: (ControlElementRotation | ControlElementRotationInverted) & {
      /**
       * If true, animation is applied
       * to cube
       */
      smooth?: boolean;
    },
  ) => any;
}

const OrbitInteractions = React.forwardRef<CubeControlApi, Props>(
  (
    {
      interactionElement = document.body,
      interactionMoveElement = document.body,
      size = '130px',
      onRotationChange = () => {},
      onZoomChange = () => {},
      classnames,
      initialRotation = {
        rotX: 0,
        rotY: 0,
      },
      cubeFaceChildren = {
        back: 'hinten',
        bottom: '',
        front: 'vorne',
        left: 'links',
        right: 'rechts',
        top: 'oben',
      },
      autoHide,
      ...props
    },
    ref,
  ) => {
    const [elemRotation, setRotationState] = useState<ControlElementRotation>(
      sanitizeRotation(normalizeRotationFormat(initialRotation)),
    );
    const [faceH, setFaceH] = useState<number>(0);

    const onRotationEndCallback = (rot: ControlElementRotation) => {
      setRotationState(rot);
      onRotationChange(toCubeRotation(rot));
    };

    // External API
    useImperativeHandle(
      ref,
      () => ({
        rotateTo: (newRotation) => {
          const normalizedRotation = normalizeRotationFormat(newRotation);
          if (newRotation.smooth) {
            animateToRotation({
              currentRotation: elemRotation,
              onRotationChange: setRotationState,
              onRotationEnd: onRotationEndCallback,
              targetRotation: normalizedRotation,
            });
          } else {
            onRotationEndCallback(normalizedRotation);
          }
        },
      }),
      [elemRotation, setRotationState],
    );

    const { zoom, isPinching } = usePinch({
      interactionElement,
      interactionMoveElement,
      onZoomEnd: (zoom) => onZoomChange(zoom.absoluteZoom),
      ...props,
    });

    const shouldAutoHide = autoHide !== undefined;

    // Cube is hidden automatically at the beginning if autoHide is enabled
    const [isHidden, setHidden] = useState<boolean>(shouldAutoHide);

    const rotateToBack = useCallback(() => {
      rotateToCubeSide({
        currentRotation: elemRotation,
        onRotationChange: setRotationState,
        side: 'back',
        onRotationEnd: onRotationEndCallback,
      });
    }, [elemRotation, setRotationState]);

    const rotateToFront = useCallback(() => {
      rotateToCubeSide({
        currentRotation: elemRotation,
        onRotationChange: setRotationState,
        side: 'front',
        onRotationEnd: onRotationEndCallback,
      });
    }, [elemRotation, setRotationState]);

    const rotateToLeft = useCallback(() => {
      rotateToCubeSide({
        currentRotation: elemRotation,
        onRotationChange: setRotationState,
        side: 'left',
        onRotationEnd: onRotationEndCallback,
      });
    }, [elemRotation, setRotationState]);

    const rotateToRight = useCallback(() => {
      rotateToCubeSide({
        currentRotation: elemRotation,
        onRotationChange: setRotationState,
        side: 'right',
        onRotationEnd: onRotationEndCallback,
      });
    }, [elemRotation, setRotationState]);

    const rotateToTop = useCallback(() => {
      rotateToCubeSide({
        currentRotation: elemRotation,
        onRotationChange: setRotationState,
        side: 'top',
        onRotationEnd: onRotationEndCallback,
      });
    }, [elemRotation, setRotationState]);

    useEffect(() => {
      if (isPinching) {
        setHidden(false);
        return;
      } else {
        setHidden(true);
      }
      if (!interactionElement || !interactionMoveElement) return;
      let pointerStartEvent: NormalizedInteractionEvent | undefined = undefined;
      let isPointerDown = false;

      const { width: elemWidth } = interactionElement.getBoundingClientRect();

      const onPointerDown = (event: AllPointerEventTypes) => {
        isPointerDown = true;
        setHidden(false);
        const e = normalizePointerEvent(event);
        pointerStartEvent = e;
      };

      const onPointerMove = (event: AllPointerEventTypes) => {
        if (isPointerDown) {
          setHidden(false);
        }
        const e = normalizePointerEvent(event);
        if (pointerStartEvent) {
          const addRot = calculateElementRotation({
            startPos: {
              x: pointerStartEvent.clientX,
              y: pointerStartEvent.clientY,
            },
            currentPos: {
              x: e.clientX,
              y: e.clientY,
            },
            elemWidth,
          });
          pointerStartEvent = e;
          setRotationState((lastRot) => {
            const sanitizedRot = sanitizeRotation({
              rotX: lastRot.rotX + addRot.rotX,
              rotY: lastRot.rotY + addRot.rotY,
            });
            return {
              ...addRot,
              ...sanitizedRot,
            };
          });
        }
      };

      const onInteractionEnd = (event: AllPointerEventTypes) => {
        isPointerDown = false;
        setHidden(true);
        pointerStartEvent = undefined;
        setRotationState((currRot) => {
          const snappedRot = snapRotation(currRot);
          let newRot = {
            ...currRot,
            ...snappedRot,
          };
          window.requestAnimationFrame(() => {
            const rotationCallbackData = toCubeRotation(newRot);
            onRotationChange(rotationCallbackData);
          });
          return newRot;
        });
      };

      interactionElement.addEventListener('touchstart', onPointerDown);
      interactionElement.addEventListener('mousedown', onPointerDown);
      interactionMoveElement.addEventListener('touchmove', onPointerMove);
      interactionMoveElement.addEventListener('mousemove', onPointerMove);
      interactionMoveElement.addEventListener('touchend', onInteractionEnd);
      interactionMoveElement.addEventListener('mouseup', onInteractionEnd);
      return () => {
        // Give touchend handlers chance to execute
        setTimeout(() => {
          interactionElement.removeEventListener('touchstart', onPointerDown);
          interactionElement.removeEventListener('mousedown', onPointerDown);
          interactionMoveElement.removeEventListener(
            'touchmove',
            onPointerMove,
          );
          interactionMoveElement.removeEventListener(
            'touchend',
            onInteractionEnd,
          );
          interactionMoveElement.removeEventListener(
            'mousemove',
            onPointerMove,
          );
          interactionMoveElement.removeEventListener(
            'mouseup',
            onInteractionEnd,
          );
        }, 0);
      };
    }, [interactionElement, interactionMoveElement, isPinching]);

    const onElementContainerEnter = useCallback(() => {
      setHidden(false);
    }, [setHidden]);

    const onElementContainerLeave = useCallback(() => {
      setHidden(true);
    }, [setHidden]);

    return (
      <div
        className={`${controlElementContainer}${
          isHidden && shouldAutoHide ? ` ${hidden}` : ''
        }`}
        style={
          {
            '--size': size,
            '--zoomFactor': zoom.relativeZoomCssScaleFactor,
            '--rotY': `${elemRotation.rotY}deg`,
            '--rotX': `${elemRotation.rotX}deg`,
            '--fontSize': `${faceH / 4.4}px`,
            '--autoHideDuration': `${(autoHide ?? 0) / 1000}s`,
          } as any
        }
        onMouseEnter={onElementContainerEnter}
        onMouseLeave={onElementContainerLeave}
      >
        {/* <div className={`${rotateIcon} ${rotateIconHorizontal}`}>
        <img src={rotateIconImg} alt="Rotate" />
      </div>
      <div className={`${rotateIcon} ${rotateIconVertical}`}>
        <img src={rotateIconImg} alt="Rotate" />
      </div> */}
        <div className={controlElement}>
          <div
            onClick={rotateToFront}
            className={`${cubeFace} ${cubeFaceFront} ${classnames?.cubeFace} ${classnames?.cubeFaceFront}`}
            ref={(elem) => {
              if (elem && faceH === 0) {
                const { height } = elem.getBoundingClientRect();
                setFaceH(height);
              }
            }}
          >
            {cubeFaceChildren.front}
          </div>
          <div
            onClick={rotateToBack}
            className={`${cubeFace} ${cubeFaceBack} ${classnames?.cubeFace} ${classnames?.cubeFaceBack}`}
          >
            {cubeFaceChildren.back}
          </div>
          <div
            onClick={rotateToRight}
            className={`${cubeFace} ${cubeFaceRight} ${classnames?.cubeFace} ${classnames?.cubeFaceRight}`}
          >
            {cubeFaceChildren.right}
          </div>
          <div
            onClick={rotateToLeft}
            className={`${cubeFace} ${cubeFaceLeft} ${classnames?.cubeFace} ${classnames?.cubeFaceLeft}`}
          >
            {cubeFaceChildren.left}
          </div>
          <div
            onClick={rotateToTop}
            className={`${cubeFace} ${cubeFaceTop} ${classnames?.cubeFace} ${classnames?.cubeFaceTop}`}
          >
            {cubeFaceChildren.top}
          </div>
          <div
            className={`${cubeFace} ${cubeFaceBottom} ${classnames?.cubeFace} ${classnames?.cubeFaceBottom}`}
          >
            {cubeFaceChildren.bottom}
          </div>
        </div>
      </div>
    );
  },
);

export default OrbitInteractions;

export { CubeRotation };
