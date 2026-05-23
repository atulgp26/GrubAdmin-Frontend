"use client";
import React from "react";

export default function LoadingDetails({
	entity = "items",
	variant = "block",
	text = null,
}) {
	if (variant === "inline") {
		return (
			<div className="flex items-center gap-2 text-[var(--color-neutral-primary)]">
				<div className="w-4 h-4 border-2 border-[var(--color-stroke-neutral)] border-t-transparent rounded-full animate-spin" />
				<span className="text-sm">
					{text ?? `Loading ${entity}...`}
				</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center py-12 text-[var(--color-neutral-secondary)]">
			<div className="w-6 h-6 border-4 border-[var(--color-stroke-neutral)] border-t-transparent rounded-full animate-spin mb-3" />
			<div className="text-sm">{text ?? `Loading ${entity}...`}</div>
		</div>
	);
}
