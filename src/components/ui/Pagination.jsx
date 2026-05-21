"use client";
import React from "react";
import Button from "@/components/ui/Button";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

const Pagination = ({
	currentPage = 1,
	pageSize = 10,
	totalItems = 0,
	onPrev,
	onNext,
	className = "",
}) => {
	const safePageSize = Math.max(1, pageSize || 1);
	const safeTotal = Math.max(0, totalItems || 0);
	const totalPages = Math.max(1, Math.ceil(safeTotal / safePageSize));
	const currentPageClamped = Math.min(Math.max(currentPage, 1), totalPages);
	const pageStart =
		safeTotal === 0 ? 0 : (currentPageClamped - 1) * safePageSize + 1;
	const pageEnd = Math.min(currentPageClamped * safePageSize, safeTotal);

	return (
		<div
			className={`bg-[var(--color-neutral-secondary-bg)] flex justify-between items-center py-2 px-4 ${className}`}
		>
			<span className="text-sm text-[var(--color-stroke-brand)]">{`Showing ${pageStart}-${pageEnd} of ${safeTotal}`}</span>
			<div className="flex gap-3">
				<Button
					variant="grayOutline"
					className="flex !px-2 items-center justify-center"
					onClick={onPrev}
					disabled={currentPageClamped <= 1 || safeTotal === 0}
				>
					<FaAngleLeft className="w-4 h-4" />
				</Button>
				<Button
					variant="grayOutline"
					className="flex !px-2 items-center justify-center"
					onClick={onNext}
					disabled={
						currentPageClamped >= totalPages || safeTotal === 0
					}
				>
					<FaAngleRight className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
};

export default Pagination;
