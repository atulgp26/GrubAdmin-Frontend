"use client";
import React, { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function DeleteBoxModal({
	open,
	onClose,
	onConfirm,
	onRequireUnassign,
	boxName = "this box",
	boxId = "",
	assignment,
	items = [],
	count,
}) {
	// const [confirmStep, setConfirmStep] = useState(false);
	const [description, setDescription] = useState("");

	const resolvedItems = useMemo(
		() =>
			items && items.length
				? items
				: [
						{
							name: boxName,
							code: boxId,
							assignment,
						},
					],
		[items],
	);
	const totalCount = useMemo(
		() => count ?? resolvedItems.length,
		[count, resolvedItems],
	);

	const isAssigned = useMemo(
		() =>
			resolvedItems.some(
				(item) =>
					(item.assignment ?? "").toString().toLowerCase() ===
					"assigned",
			),
		[resolvedItems],
	);

	const firstItem = useMemo(() => resolvedItems[0] || {}, [resolvedItems]);
	const title = useMemo(
		() =>
			totalCount > 1
				? `Delete ${totalCount} selected boxes?`
				: `Delete ${firstItem.name ?? boxName}${
						firstItem.code
							? ` [${firstItem.code}]`
							: boxId
								? ` [${boxId}]`
								: ""
					}?`,
		[totalCount, firstItem],
	);

	// Primary button label
	const primaryLabel = useMemo(
		() =>
			isAssigned
				? "OKAY"
				: totalCount > 1
					? `DELETE ${totalCount} BOXES`
					: "DELETE BOX",
		[isAssigned, totalCount],
	);

	const handlePrimaryAction = () => {
		if (isAssigned) {
			onRequireUnassign();
			return;
		}

		onConfirm?.();
		onClose?.();
	};

	const handleClose = () => {
		onClose?.();
	};

	useEffect(() => {
		if (isAssigned) {
			setDescription(
				totalCount > 1
					? "One or more selected boxes are assigned to clients. Remove their assignments first, then delete the boxes."
					: "The box is already assigned to a client. First remove assignment, then delete the box.",
			);
		} else {
			setDescription(
				totalCount > 1
					? "This will permanently delete the selected boxes and remove them from the GrubPacs list. This action cannot be undone."
					: "This will permanently delete the box and remove it from the GrubPacs list. This action cannot be undone.",
			);
		}
	}, [totalCount, isAssigned]);

	if (!open) return null;

	return (
		<Modal
			open={open}
			onClose={handleClose}
			width="w-[604px]"
			closeOnOutsideClick={!isAssigned}
		>
			<div className="flex flex-col items-center text-center mt-8 space-y-6">
				<h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
					{title}
				</h2>
				<p className="text-lg text-[var(--color-neutral-secondary)] max-w-md">
					{description}
				</p>
				<hr className="w-full border-t border-[var(--color-box-border)]" />
				<div className="w-full flex flex-col gap-3 px-4 pb-6">
					<Button
						variant="primary"
						size="mdLg"
						onClick={handlePrimaryAction}
						className={
							!isAssigned
								? "bg-[var(--notif-error)] hover:bg-[var(--notif-error-hover)]"
								: ""
						}
					>
						{primaryLabel}
					</Button>
					{!isAssigned && (
						<Button
							variant="cancel"
							size="mdLg"
							onClick={handleClose}
						>
							CANCEL
						</Button>
					)}
				</div>
			</div>
		</Modal>
	);
}
