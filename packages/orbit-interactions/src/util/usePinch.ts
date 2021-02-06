import { useEffect, useState } from 'react';

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
  onZoomEnd?: (zoom: number) => void;
}

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
  const [zoom, setZoomFactor] = useState<number>(0);
  const [isPinching, setPinching] = useState<boolean>(false);

  useEffect(() => {
    if (!interactionElement) return;

    /**
     * 10 Zoom factors = elemWidth
     */
    const pxToZoomFactor = (px: number) => {
      const { width: elemWidth } = interactionElement.getBoundingClientRect();
      return (10 / elemWidth) * px;
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
        let newZoom = currZoom + pxToZoomFactor(diff);
        newZoom = Math.min(maxZoom, newZoom);
        newZoom = Math.max(minZoom, newZoom);
        return newZoom;
      });
    }

    function onTouchEnd(e: TouchEvent) {
      if (e.touches.length < 2) {
        initialDist = 0;
        setPinching(false);
        setZoomFactor((currZoom) => {
          if (currZoom !== 0) {
            onZoomEnd(currZoom);
          }
          return 0;
        });
      }
    }

    interactionElement.addEventListener('touchmove', onTouchMove);
    interactionElement.addEventListener('touchstart', onTouchStart);
    interactionElement.addEventListener('touchend', onTouchEnd);
  }, [interactionElement, minZoom, maxZoom]);

  return { zoom, isPinching };
}
