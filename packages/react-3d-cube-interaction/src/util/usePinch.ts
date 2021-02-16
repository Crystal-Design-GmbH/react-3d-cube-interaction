import { useEffect, useState } from 'react';

interface ZoomData {
  absoluteZoom: number;
  relativeZoom: number;
}

export interface UsePinchParams {
  interactionElement?: HTMLElement;
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

export default function usePinch({
  interactionElement,
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
    if (!interactionElement) return;

    /**
     * CONTAINER_WIDTH_ZOOM_FACTORS Zoom factors = elemWidth
     */
    const pxToZoomFactor = (px: number) => {
      const { width: elemWidth } = interactionElement.getBoundingClientRect();
      return (CONTAINER_WIDTH_ZOOM_FACTORS / elemWidth) * px;
    };

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
        setZoomFactor((currZoom) => {
          const newAbsoluteZoom = validateZoomFactor(
            currZoom.absoluteZoom + currZoom.relativeZoom,
          );
          if (currZoom.relativeZoom !== 0) {
            onZoomEnd({
              relativeZoom: currZoom.relativeZoom,
              absoluteZoom: newAbsoluteZoom,
            });
          }
          return {
            relativeZoom: 0,
            absoluteZoom: newAbsoluteZoom,
          };
        });
      }
    }

    interactionElement.addEventListener('touchmove', onTouchMove);
    interactionElement.addEventListener('touchstart', onTouchStart);
    interactionElement.addEventListener('touchend', onTouchEnd);
  }, [interactionElement, minZoom, maxZoom]);

  return { zoom, isPinching };
}
