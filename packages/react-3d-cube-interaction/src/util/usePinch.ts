import { useEffect, useState } from 'react';
import { snapZoomValue } from './math';

interface ZoomState {
  absoluteZoom: number;
  relativeZoom: number;
}

interface ZoomData extends ZoomState {
  relativeZoomCssScaleFactor: number;
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
  onZoomEnd?: (zoom: ZoomState) => void;
  /**
   * Reset cube zoom factor
   * after MS amount of time.
   * Defaults to 500.
   */
  zoomFactorResetDelay?: number;
}

const CONTAINER_WIDTH_ZOOM_FACTORS = 5;

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
  zoomFactorResetDelay = 500,
}: UsePinchParams) {
  const [zoom, setZoomFactor] = useState<ZoomState>({
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

  /**
   * From minZoom to 0 = 0 - 1
   * From 0 to maxZoom = 1 - 3
   */
  const relativeZoomToCssScale = (relativeZoom: number) => {
    const MAX_CSS_SCALE_FACTOR = 3;

    let scaleFactor = 1;
    if (relativeZoom < 0) {
      scaleFactor = 1 - Math.abs(relativeZoom / minZoom);
    } else {
      scaleFactor = (relativeZoom / maxZoom) * (MAX_CSS_SCALE_FACTOR - 1) + 1;
    }

    return scaleFactor;
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
          ...currZoom,
          absoluteZoom: newAbsoluteZoom,
        };
      });
      // Reset relative zoom after a certain delay
      window.setTimeout(() => {
        if (!didCancel) {
          setZoomFactor((currZoom) => {
            return {
              ...currZoom,
              relativeZoom: 0,
            };
          });
        }
      }, zoomFactorResetDelay);
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

  const zoomData: ZoomData = {
    ...zoom,
    relativeZoomCssScaleFactor: relativeZoomToCssScale(zoom.relativeZoom),
  };

  return { zoom: zoomData, isPinching };
}
