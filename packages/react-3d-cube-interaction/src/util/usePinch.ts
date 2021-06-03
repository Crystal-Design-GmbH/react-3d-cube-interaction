import { useEffect, useState } from 'react';
import { snapZoomValue } from './math';

interface ZoomState {
  absoluteZoom: number;
  relativeZoom: number;
}

interface ZoomData extends ZoomState {
  relativeZoomCssScaleFactor: number;
}

/**
 * Holds information of the zoomCenter
 * relative to the interactionElement
 */
interface ZoomCenterPosition {
  x: number;
  y: number;
}

export interface ZoomEndEventData extends ZoomState {
  zoomCenter: ZoomCenterPosition;
}

export interface UsePinchParams {
  /**
   * If set true, the browser's
   * default scroll behaviour is
   * disabled. Defaults to false.
   */
  disableDefaultScrollBehaviour?: boolean;
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
  /**
   * Maximum absolute
   * css scale factor.
   * Defaults to 3
   */
  maxCssScale?: number;
  /**
   * Minimum absolute
   * css scale factor.
   * Defaults to 0
   */
  minCssScale?: number;
  onZoomEnd?: (zoom: ZoomEndEventData) => void;
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

function calcTwoFingerCenter(
  e: TouchEvent,
  interactionElement: HTMLElement,
): ZoomCenterPosition {
  const {
    top: offsetY,
    left: offsetX,
  } = interactionElement.getBoundingClientRect();

  return {
    x: (e.touches[0].pageX + e.touches[1].pageX) / 2 - offsetX,
    y: (e.touches[0].pageY + e.touches[1].pageY) / 2 - offsetY,
  };
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
  maxCssScale = 3,
  minCssScale = 0,
  disableDefaultScrollBehaviour,
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
    let scaleFactor = 1;
    if (relativeZoom < 0) {
      scaleFactor = 1 - Math.abs(relativeZoom / minZoom);
    } else {
      scaleFactor = (relativeZoom / maxZoom) * (maxCssScale - 1) + 1;
    }

    return Math.max(scaleFactor, minCssScale);
  };

  function resetRelativeZoom() {
    window.setTimeout(() => {
      setZoomFactor((currZoom) => {
        return {
          ...currZoom,
          relativeZoom: 0,
        };
      });
    }, zoomFactorResetDelay);
  }

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

    let pointerStartPos: ZoomCenterPosition | undefined = undefined;

    function onZoomEndEvent() {
      setZoomFactor((currZoom) => {
        let newAbsoluteZoom = validateZoomFactor(
          currZoom.absoluteZoom + currZoom.relativeZoom,
        );
        newAbsoluteZoom = snapZoomValue(newAbsoluteZoom);
        if (currZoom.relativeZoom !== 0) {
          window.requestAnimationFrame(() => {
            if (pointerStartPos) {
              onZoomEnd({
                relativeZoom: currZoom.relativeZoom,
                absoluteZoom: newAbsoluteZoom,
                zoomCenter: pointerStartPos,
              });
            }
          });
        }
        return {
          ...currZoom,
          absoluteZoom: newAbsoluteZoom,
        };
      });
      // Reset relative zoom after a certain delay
      if (!didCancel) {
        resetRelativeZoom();
      }
    }

    let initialDist: number = 0;
    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        initialDist = calcTwoFingerDistance(e);
        if (interactionElement) {
          pointerStartPos = calcTwoFingerCenter(e, interactionElement);
        }
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
      if (!interactionElement) return;
      // If event is prevented, the original
      // scroll behaviour of the browser
      // is disabled
      if (disableDefaultScrollBehaviour) {
        e.preventDefault();
      }
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

      const {
        top: offsetY,
        left: offsetX,
      } = interactionElement.getBoundingClientRect();
      pointerStartPos = {
        x: e.pageX - offsetX,
        y: e.pageY - offsetY,
      };

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
  }, [
    interactionElement,
    minZoom,
    maxZoom,
    interactionMoveElement,
    zoomFactorResetDelay,
    disableDefaultScrollBehaviour,
  ]);

  const zoomData: ZoomData = {
    ...zoom,
    relativeZoomCssScaleFactor: relativeZoomToCssScale(zoom.relativeZoom),
  };

  function setAbsoluteZoomFromOutside(newAbsoluteZoomParam: number) {
    const newAbsoluteZoom = validateZoomFactor(newAbsoluteZoomParam);
    setZoomFactor((currZoom) => {
      const interactionElementDimensions = interactionElement?.getBoundingClientRect();
      const zoomCenterX = interactionElementDimensions
        ? interactionElementDimensions.width / 2
        : 0;
      const zoomCenterY = interactionElementDimensions
        ? interactionElementDimensions.height / 2
        : 0;

      window.requestAnimationFrame(() => {
        onZoomEnd({
          relativeZoom: 0,
          absoluteZoom: newAbsoluteZoom,
          zoomCenter: { x: zoomCenterX, y: zoomCenterY },
        });
        resetRelativeZoom();
      });

      return {
        ...currZoom,
        relativeZoom: newAbsoluteZoom - currZoom.absoluteZoom,
        absoluteZoom: newAbsoluteZoom,
      };
    });
  }

  return { zoom: zoomData, isPinching, setAbsoluteZoomFromOutside };
}
