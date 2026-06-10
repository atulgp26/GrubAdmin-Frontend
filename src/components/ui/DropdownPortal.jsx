import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function DropdownPortal({
  targetRef,
  open,
  onClose,
  children,
  containerRef,
}) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (open && targetRef?.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const containerRect = containerRef?.current
        ? containerRef.current.getBoundingClientRect()
        : { top: 0, left: 0 };

      const scrollY = containerRef?.current ? 0 : window.scrollY;
      const scrollX = containerRef?.current ? 0 : window.scrollX;

      setPosition({
        top: targetRect.bottom - containerRect.top + scrollY + 4,
        left: targetRect.right - containerRect.left + scrollX - 192,
        width: targetRect.width,
      });
    }
  }, [open, targetRef, containerRef]);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        targetRef.current &&
        !targetRef.current.contains(e.target)
      ) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, targetRef]);

  if (!open || !targetRef?.current) return null;

  const portalContainer = containerRef?.current || document.body;

  return createPortal(
    <div
      ref={menuRef}
      data-portal-container="dropdown"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        minWidth: 192,
        zIndex: 1000,
      }}
      className="bg-white rounded-lg"
    >
      {children}
    </div>,
    portalContainer
  );
}
