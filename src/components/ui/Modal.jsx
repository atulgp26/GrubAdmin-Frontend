import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";

export default function Modal({
	open,
	onClose,
	children,
	width = "max-w-50vw",
	height = "h-auto",
	customClass = "",
	positionClass = "items-center justify-center",
	top,
	right,
	bottom,
	left,
	noBlur = false,
	closeOnOutsideClick = true,
	noXPadding,
	noPadding,
	hideClose,
}) {
	const [isClient, setIsClient] = useState(false);
	const modalRef = useRef(null);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				closeOnOutsideClick &&
				modalRef.current &&
				!modalRef.current.contains(event.target)
			) {
				onClose();
			}
		};

		if (open) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [open, onClose, closeOnOutsideClick]);

	if (!isClient) return null;
	if (!open) return null;

	let positionClassWithImportant = positionClass
		.replace("justify-end", "!justify-end")
		.replace("justify-center", "!justify-center")
		.replace("justify-start", "!justify-start")
		.replace("items-center", "!items-center")
		.replace("items-start", "!items-start")
		.replace("items-end", "!items-end");

	const getInnerPadding = () => {
		if (noPadding || noXPadding) return "px-0 py-0";
		return "px-6 py-0 mt-10 mb-6";
	};

	return createPortal(
		<div
			className={`fixed inset-0 ${top} ${right} ${bottom} ${left} z-50 flex ${positionClassWithImportant} shadow-lg ${noBlur ? "" : "backdrop-blur-sm"} ${customClass}`}
		>
			<div
				ref={modalRef}
				className={`relative bg-white rounded-lg border border-[var(--color-stroke-neutral)] shadow-[4px_4px_8px_0px_var(--color-notif-shadow-soft),0px_0px_4px_0px_var(--color-notif-shadow-strong)] ${width} ${height} mx-4 p-0 flex flex-col justify-center`}
			>
				<button
					className={`${hideClose ? "hidden" : ""} absolute top-6 right-6 text-[var(--color-neutral-light)] focus:outline-none rounded-lg border-2 border-transparent transition-colors p-2
            hover:bg-[var(--color-alert-warm-bg)]
            active:bg-[var(--color-alert-warm-bg)] active:border-[var(--color-alert-warm-dark)] active:text-[var(--color-alert-warm-dark)]`}
					onClick={onClose}
					aria-label="Close"
				>
					{/* <MdClose className="w-6 h-6 text-[var(--color-stroke-brand)]" /> */}
				</button>
				<div className={`flex flex-col flex-1 h-full ${getInnerPadding()}`}>
					{children}
				</div>
			</div>
		</div>,
		document.body,
	);
}