import { useEffect, useState } from 'react';
import { snapZoomValue } from './math';

interface ZoomData {
  absoluteZoom: number;
  relativeZoom: number;
}

export interface UsePinchParams {
  interactionElement?: HTMLElement | null;
  interactionMoveElement?: HTMLElement | null;
  /**
   * Defaults to 10
   */
  maxZoom?: number;
  /**
   * Defaults to -10
   */
  minZoom?: number;
  onZoomEnd?: (zoom: ZoomData) => void;
}

export const CONTAINER_WIDTH_ZOOM_FACTORS = 5;

function calcTwoFingerDistance(e: TouchEvent) {
  return Math.hypot(
    e.touches[0].pageX - e.touches[1].pageX,
    e.touches[0].pageY - e.touches[1].pageY,
  );
}

/**
 * touch = two finger zoom
 * mouse = scroll zoom
 */
export default function usePinch({
  interactionElement,
  interactionMoveElement = document.body,
  minZoom = -10,
  maxZoom = 10,
  onZoomEnd = () => {},
}: UsePinchParams) {
  const [zoom, setZoomFactor] = useState<ZoomData>({
    absoluteZoom: 0,
    relativeZoom: 0,
  });
  const [isPinching, setPinching] = useState<boolean>(false);

  const validateZoomFactor = (zoomFac: number) => {
    let newZoomFactor = zoomFac;
    newZoomFactor = Math.min(maxZoom, newZoomFactor);
    newZoomFactor = Math.max(minZoom, newZoomFactor);
    return newZoomFactor;
  };

  useEffect(() => {
    let didCancel = false;
    if (!interactionElement || !interactionMoveElement) return;

    /**
     * CONTAINER_WIDTH_ZOOM_FACTORS Zoom factors = elemWidth
     */
    const pxToZoomFactor = (px: number) => {
      const { width: elemWidth } = interactionElement.getBoundingClientRect();
      return (CONTAINER_WIDTH_ZOOM_FACTORS / elemWidth) * px;
    };

    function onZoomEndEvent() {
      setZoomFactor((currZoom) => {
        let newAbsoluteZoom = validateZoomFactor(
          currZoom.absoluteZoom + currZoom.relativeZoom,
        );
        newAbsoluteZoom = snapZoomValue(newAbsoluteZoom);
        if (currZoom.relativeZoom !== 0) {
          window.requestAnimationFrame(() => {
            onZoomEnd({
              relativeZoom: currZoom.relativeZoom,
              absoluteZoom: newAbsoluteZoom,
            });
          });
        }
        return {
          relativeZoom: 0,
          absoluteZoom: newAbsoluteZoom,
        };
      });
    }

    let initialDist: number = 0;
    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        initialDist = calcTwoFingerDistance(e);
      } else {
        initialDist = 0;
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (!initialDist) {
        return; // Only one finger active
      }
      setPinching(true);
      const newDist = calcTwoFingerDistance(e);
      const diff = newDist - initialDist;
      initialDist = newDist;
      setZoomFactor((currZoom) => {
        const newRelativeZoom = validateZoomFactor(
          currZoom.relativeZoom + pxToZoomFactor(diff),
        );
        return {
          ...currZoom,
          relativeZoom: newRelativeZoom,
        };
      });
    }

    function onTouchEnd(e: TouchEvent) {
      if (e.touches.length < 2) {
        initialDist = 0;
        setPinching(false);
        onZoomEndEvent();
      }
    }

    let timeout: number | undefined = undefined;
    function onMouseWheel(e: WheelEvent) {
      setPinching(true);
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }
      timeout = window.setTimeout(() => {
        if (didCancel) return;
        setPinching(false);
        onZoomEndEvent();
      }, 400);
      const delta = e.deltaY * -1;
      setZoomFactor((currZoom) => {
        const newRelativeZoom = validateZoomFactor(
          currZoom.relativeZoom + pxToZoomFactor(delta),
        );
        return {
          ...currZoom,
          relativeZoom: newRelativeZoom,
        };
      });
    }

    interactionMoveElement.addEventListener('touchmove', onTouchMove);
    interactionElement.addEventListener('touchstart', onTouchStart);
    interactionMoveElement.addEventListener('touchend', onTouchEnd);
    interactionElement.addEventListener('wheel', onMouseWheel);

    return () => {
      didCancel = true;
      interactionMoveElement.removeEventListener('touchmove', onTouchMove);
      interactionElement.removeEventListener('touchstart', onTouchStart);
      interactionMoveElement.removeEventListener('touchend', onTouchEnd);
      interactionElement.removeEventListener('wheel', onMouseWheel);
    };
  }, [interactionElement, minZoom, maxZoom, interactionMoveElement]);

  return { zoom, isPinching };
}
