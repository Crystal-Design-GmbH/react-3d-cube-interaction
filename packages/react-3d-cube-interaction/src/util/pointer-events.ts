type ReactTouchOrMouseEvent =
  | React.TouchEvent<HTMLDivElement>
  | React.MouseEvent<HTMLDivElement, MouseEvent>;
export type AllPointerEventTypes =
  | MouseEvent
  | TouchEvent
  | ReactTouchOrMouseEvent;

export interface NormalizedInteractionEvent {
  clientX: number;
  clientY: number;
  target: EventTarget | null;
}

export function isTouchEvent(
  e: AllPointerEventTypes,
): e is TouchEvent | React.TouchEvent<HTMLDivElement> {
  return !!(e as TouchEvent).touches;
}

export function normalizePointerEvent(
  event: AllPointerEventTypes,
): NormalizedInteractionEvent {
  if (isTouchEvent(event)) {
    const touch = event.touches.item(0) || event.changedTouches.item(0);
    if (touch) {
      return touch;
    }
    return {
      clientX: 0,
      clientY: 0,
      target: null,
    };
  }

  return event;
}
