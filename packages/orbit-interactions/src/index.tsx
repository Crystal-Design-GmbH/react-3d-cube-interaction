import React, { useEffect, useState } from 'react';
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
} from './index.module.css';
import {
  ControlElementRotation,
  calculateElementRotation,
  CalculateElementRotationResult,
} from './util/math';
import {
  AllPointerEventTypes,
  NormalizedInteractionEvent,
  normalizePointerEvent,
} from './util/pointer-events';
import usePinch, { UsePinchParams } from './util/usePinch';

interface Props extends Pick<UsePinchParams, 'minZoom' | 'maxZoom'> {
  /**
   * Element on which to bind
   * click/touch listeners.
   * Defaults to document.
   */
  interactionElement?: HTMLElement;
  /**
   * Size of the cube.
   * Must be an __absolute__
   * CSS Value, e.g. px, em, vh, etc.
   * Defaults to 120px
   */
  size?: string;
  onRotationChange?: (p: ControlElementRotation) => void;
  /**
   * Returns a scaled value:
   * 10 = width of interactionElement
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
}

const OrbitInteractions: React.FC<Props> = ({
  interactionElement,
  size = '130px',
  onRotationChange = () => {},
  onZoomChange = () => {},
  classnames,
  ...props
}) => {
  const [elemRotation, setRotationState] = useState<ControlElementRotation>({
    rotX: 0,
    rotY: 0,
  });

  const { zoom, isPinching } = usePinch({
    interactionElement,
    onZoomEnd: onZoomChange,
    ...props,
  });

  useEffect(() => {
    if (!interactionElement || isPinching) return;
    let pointerStartEvent: NormalizedInteractionEvent | undefined = undefined;
    let currRot: CalculateElementRotationResult | undefined = undefined;

    const { width: elemWidth } = interactionElement.getBoundingClientRect();

    const onPointerDown = (event: AllPointerEventTypes) => {
      const e = normalizePointerEvent(event);
      pointerStartEvent = e;
    };

    const onPointerMove = (event: AllPointerEventTypes) => {
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
          let newRotX = lastRot.rotX + addRot.rotX;
          let newRotY = lastRot.rotY + addRot.rotY;
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

          currRot = {
            ...addRot,
            rotX: newRotX,
            rotY: newRotY,
          };
          return currRot;
        });
      }
    };

    const onInteractionEnd = (event: AllPointerEventTypes) => {
      pointerStartEvent = undefined;
      if (currRot) {
        onRotationChange(currRot);
      }
    };

    interactionElement.addEventListener('touchstart', onPointerDown);
    interactionElement.addEventListener('mousedown', onPointerDown);
    interactionElement.addEventListener('touchmove', onPointerMove);
    interactionElement.addEventListener('mousemove', onPointerMove);
    interactionElement.addEventListener('touchend', onInteractionEnd);
    interactionElement.addEventListener('mouseup', onInteractionEnd);
    return () => {
      // Give touchend handlers chance to execute
      setTimeout(() => {
        interactionElement.removeEventListener('touchstart', onPointerDown);
        interactionElement.removeEventListener('mousedown', onPointerDown);
        interactionElement.removeEventListener('touchmove', onPointerMove);
        interactionElement.removeEventListener('touchend', onInteractionEnd);
        interactionElement.removeEventListener('mouseleave', onInteractionEnd);
        interactionElement.removeEventListener('mousemove', onPointerMove);
        interactionElement.removeEventListener('mouseup', onInteractionEnd);
      }, 0);
    };
  }, [interactionElement, isPinching]);

  return (
    <div
      className={controlElementContainer}
      style={
        {
          '--size': size,
        } as any
      }
    >
      <div
        className={controlElement}
        style={
          {
            '--zoomFactor': zoom / 10 + 1,
            '--rotY': `${elemRotation.rotY}deg`,
            '--rotX': `${elemRotation.rotX}deg`,
          } as any
        }
      >
        <div
          className={`${cubeFace} ${cubeFaceFront} ${classnames?.cubeFace} ${classnames?.cubeFaceFront}`}
        >
          front
        </div>
        <div
          className={`${cubeFace} ${cubeFaceBack} ${classnames?.cubeFace} ${classnames?.cubeFaceBack}`}
        >
          back
        </div>
        <div
          className={`${cubeFace} ${cubeFaceRight} ${classnames?.cubeFace} ${classnames?.cubeFaceRight}`}
        >
          right
        </div>
        <div
          className={`${cubeFace} ${cubeFaceLeft} ${classnames?.cubeFace} ${classnames?.cubeFaceLeft}`}
        >
          left
        </div>
        <div
          className={`${cubeFace} ${cubeFaceTop} ${classnames?.cubeFace} ${classnames?.cubeFaceTop}`}
        >
          top
        </div>
        <div
          className={`${cubeFace} ${cubeFaceBottom} ${classnames?.cubeFace} ${classnames?.cubeFaceBottom}`}
        >
          bottom
        </div>
      </div>
    </div>
  );
};

export default OrbitInteractions;

export { ControlElementRotation };
