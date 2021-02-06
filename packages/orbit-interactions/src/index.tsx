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
  QuadrantType,
} from './util/math';
import {
  AllPointerEventTypes,
  NormalizedInteractionEvent,
  normalizePointerEvent,
} from './util/pointer-events';
import usePinch, { UsePinchParams } from './util/usePinch';

interface Props extends UsePinchParams {
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
}

const OrbitInteractions: React.FC<Props> = ({
  interactionElement,
  size = '130px',
  onRotationChange = () => {},
  onZoomChange = () => {},
  ...props
}) => {
  const [elemRotation, setRotationState] = useState<ControlElementRotation>({
    rotX: 0,
    rotY: 0,
  });

  function resetRotation() {
    setRotationState({
      rotX: 0,
      rotY: 0,
    });
  }

  const { zoom, isPinching } = usePinch({ interactionElement, ...props });

  useEffect(() => {
    // TODO: Only fire event at end of interaction!
    onRotationChange(elemRotation);
  }, [onRotationChange, elemRotation]);

  useEffect(() => {
    // TODO: Only fire event at end of interaction!
    onZoomChange(zoom);
  }, [onZoomChange, zoom]);

  useEffect(() => {
    if (!interactionElement || isPinching) return;
    let pointerStartEvent: NormalizedInteractionEvent | undefined = undefined;
    let lastQuadrant: QuadrantType | undefined = undefined;

    const { width: elemWidth } = interactionElement.getBoundingClientRect();

    const onPointerDown = (event: AllPointerEventTypes) => {
      const e = normalizePointerEvent(event);
      pointerStartEvent = e;
    };

    const onPointerMove = (event: AllPointerEventTypes) => {
      const e = normalizePointerEvent(event);
      if (pointerStartEvent) {
        const newRotation = calculateElementRotation({
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
        if (lastQuadrant !== newRotation.quadrant) {
          // Reset start position if user changes direction
          pointerStartEvent = e;
        }
        lastQuadrant = newRotation.quadrant;
        setRotationState(newRotation);
      }
    };

    const onInteractionEnd = (event: AllPointerEventTypes) => {
      pointerStartEvent = undefined;
      resetRotation();
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
        style={{
          transform: `scale(${zoom / 10 + 1}) translateZ(-100px) rotateY(${
            elemRotation.rotY
          }deg) rotateX(${elemRotation.rotX}deg)`,
        }}
      >
        <div className={`${cubeFace} ${cubeFaceFront}`} />
        <div className={`${cubeFace} ${cubeFaceBack}`} />
        <div className={`${cubeFace} ${cubeFaceRight}`} />
        <div className={`${cubeFace} ${cubeFaceLeft}`} />
        <div className={`${cubeFace} ${cubeFaceTop}`} />
        <div className={`${cubeFace} ${cubeFaceBottom}`} />
      </div>
    </div>
  );
};

export default OrbitInteractions;
