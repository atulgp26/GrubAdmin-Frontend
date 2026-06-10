import { useEffect, useRef } from "react";

export function useClickOutside(ref, handler, enabled = true) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    let isDraggingScrollbar = false;

    // Scrollbar drag guard: when user mousedowns on the scrollbar area,
    // the event target is <html>/<body> (scrollbar is outside the DOM tree).
    // Any contains() check would return false, incorrectly triggering close.
    const onScrollbarCheck = (e) => {
      isDraggingScrollbar =
        e.clientX > document.documentElement.clientWidth ||
        e.clientY > document.documentElement.clientHeight;
    };

    const onMouseUp = () => {
      isDraggingScrollbar = false;
    };

    const onMouseDown = (e) => {
      if (!ref.current || isDraggingScrollbar) return;

      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        handlerRef.current(e);
      }
    };

    document.addEventListener("mousedown", onScrollbarCheck, true);
    document.addEventListener("mouseup", onMouseUp, true);
    document.addEventListener("mousedown", onMouseDown);

    return () => {
      document.removeEventListener("mousedown", onScrollbarCheck, true);
      document.removeEventListener("mouseup", onMouseUp, true);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [ref, enabled]);
}
