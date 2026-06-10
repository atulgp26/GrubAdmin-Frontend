import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function DropdownPortal({ targetRef, open, onClose, children }) {
	const [position, setPosition] = useState({ top: 0, left: 0 });
	const menuRef = useRef(null);

	useEffect(() => {
		if (!open || !targetRef?.current) return;

		const updatePosition = () => {
			const rect = targetRef.current.getBoundingClientRect();
			setPosition({
				top: rect.bottom + 4,
				left: rect.right, 
			});
		};

		updatePosition();

		// Reposition on scroll or resize
		window.addEventListener("scroll", updatePosition, true);
		window.addEventListener("resize", updatePosition);
		return () => {
			window.removeEventListener("scroll", updatePosition, true);
			window.removeEventListener("resize", updatePosition);
		};
	}, [open, targetRef]);

	useEffect(() => {
		if (!open) return;

		const handleClick = (e) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target) &&
				targetRef?.current &&
				!targetRef.current.contains(e.target)
			) {
				onClose?.();
			}
		};

		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [open, onClose, targetRef]);

	if (!open) return null;

	return createPortal(
		<div
			ref={menuRef}
			data-portal-container="dropdown"
			style={{
				position: "fixed",
				top: position.top,
				right: `calc(100vw - ${position.left}px)`, 
				width: "max-content", 
				zIndex: 1000,
			}}
			className="bg-white rounded-lg"
		>
			{children}
		</div>,
		document.body,
	);
}
