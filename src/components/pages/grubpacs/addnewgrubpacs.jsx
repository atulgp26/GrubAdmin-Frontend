"use client";

import React, { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { MdDone } from "react-icons/md";
import { customerService } from "@/api/services/customerService";
import { showError } from "@/components/ui/toast";

const defaultFormState = {
	id: null,
	box_id: "",
	name: "",
	vertical: "",
	status: "active",
};

const AddNewGrubPac = ({
	open,
	onClose,
	onConfirm,
	mode = "create",
	initialData = null,
}) => {
	const isEdit = useMemo(() => mode === "edit", [mode]);
	const [formData, setFormData] = useState(defaultFormState);
	const [initialFormData, setInitialFormData] = useState(defaultFormState);
	const [focusedField, setFocusedField] = useState("");
	const [verticals, setVerticals] = useState([]);

	const verticalOptions = useMemo(
		() =>
			verticals.map((v) => ({
				label: `${v.name.charAt(0).toUpperCase()}${v.name.slice(1)}`,
				value: v.id,
			})),
		[verticals],
	);

	const fetchVerticals = async () => {
		const verticalsResponse = await customerService.getVerticals();

		if (
			verticalsResponse.success &&
			verticalsResponse.code === 200 &&
			verticalsResponse.data.verticals
		) {
			setVerticals(verticalsResponse.data.verticals);
		} else if (!verticalsResponse.success) {
			showError(verticalsResponse.error ?? "Something went wrong");
		} else {
			showError("Something went wrong");
		}
	};

	useEffect(() => {
		if (!open) return;

		fetchVerticals();

		if (isEdit && initialData) {
			const formatted = {
				id: initialData.id ?? null,
				box_id: initialData.boxId ?? initialData.code ?? "",
				name: initialData.name ?? "",
				vertical:
					initialData.vertical?.id ?? initialData.verticalId ?? "",
				status: initialData.status ?? "active",
			};
			setFormData(formatted);
			setInitialFormData({ ...formatted });
		} else {
			setFormData({ ...defaultFormState });
			setInitialFormData({ ...defaultFormState });
		}
		setFocusedField("");
	}, [open, isEdit, initialData]);

	const handleInputChange = (field, value) => {
		if (isEdit && (field === "boxId" || field === "vertical")) {
			return;
		}
		if (field === "box_id") {
			const cleaned = value.startsWith("#") ? value.slice(1) : value;
			setFormData((prev) => ({ ...prev, [field]: cleaned }));
			return;
		}
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleFocus = (field) => {
		if (isEdit && (field === "boxId" || field === "vertical")) return;
		setFocusedField(field);
	};

	const handleBlur = () => {
		setFocusedField("");
	};

	const handleCancel = () => {
		setFormData(initialFormData);
		onClose();
	};

	const handleConfirm = () => {
		const canSubmit = isEdit ? isDirty : isFormValid;
		if (!canSubmit) return;
		if (onConfirm) onConfirm(formData);
		onClose();
	};

	const isFormValid = useMemo(
		() =>
			formData.box_id.trim() &&
			formData.name.trim() &&
			formData.vertical.trim(),
		[formData],
	);

	const isDirty = useMemo(
		() =>
			isEdit
				? ["box_id", "name", "vertical", "status"].some(
						(key) => formData[key] !== initialFormData[key],
					)
				: false,
		[formData],
	);

	const canSubmit = useMemo(
		() => (isEdit ? isDirty : isFormValid),
		[isEdit, isDirty, isFormValid],
	);

	if (!open) return null;

	return (
		<Modal
			open={open}
			onClose={handleCancel}
			width="max-w-xl"
			closeOnOutsideClick={true}
		>
			<div className="space-y-6">
				{/* Header */}
				<div className="space-y-2 mt-2">
					<h1 className="text-[var(--color-neutral-primary)] font-semibold text-2xl">
						{isEdit ? "Edit box" : "Add new GrubPac"}
					</h1>
					{!isEdit && (
						<p className="text-[var(--color-stroke-brand)] text-base">
							Add a GrubPac box to the list. Once created, you can
							assign it to a client.
						</p>
					)}
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-4">
						<h3 className="text-[var(--color-neutral-secondary)] text-base">
							Box ID
						</h3>
						<div className="relative">
							<Input
								type="text"
								placeholder="Box ID"
								value={formData.box_id}
								onChange={(e) =>
									handleInputChange("box_id", e.target.value)
								}
								onFocus={() => handleFocus("box_id")}
								onBlur={handleBlur}
								isFocused={focusedField === "box_id"}
								padding="!py-3 !px-8"
								disabled={isEdit}
								disabledClass={
									isEdit
										? "!bg-[var(--color-neutral-secondary-bg)] cursor-not-allowed"
										: ""
								}
							/>
							<span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-neutral-light)] text-sm pointer-events-none z-10">
								#
							</span>
						</div>
					</div>
					<div className="space-y-4">
						<h3 className="text-[var(--color-neutral-secondary)] text-base">
							Box name
						</h3>
						<div className="relative">
							<Input
								type="text"
								placeholder="Box name"
								value={formData.name}
								onChange={(e) =>
									handleInputChange("name", e.target.value)
								}
								onFocus={() => handleFocus("name")}
								onBlur={handleBlur}
								isFocused={focusedField === "name"}
								padding="!py-3 !px-4"
							/>
						</div>
					</div>
				</div>

				{/* Vertical and Status */}
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-4">
						<h3 className="text-[var(--color-neutral-secondary)] text-base">
							Vertical
						</h3>
						<Select
							options={verticalOptions}
							value={formData.vertical}
							onChange={(val) =>
								handleInputChange("vertical", val)
							}
							placeholder="Select vertical"
							fontSize="!text-base"
							padding="!py-3 !px-4"
							disabled={isEdit}
							chevronColor={
								isEdit
									? "text-[var(--color-neutral-light)]"
									: ""
							}
							disabledClass={
								isEdit
									? "!bg-[var(--color-neutral-secondary-bg)] cursor-not-allowed"
									: ""
							}
						/>
					</div>
					<div className="space-y-4">
						<h3 className="text-[var(--color-neutral-secondary)] text-base">
							Status
						</h3>
						<Select
							options={[
								{ value: "active", label: "Active" },
								{ value: "suspended", label: "Inactive" },
							]}
							value={formData.status}
							onChange={(val) => handleInputChange("status", val)}
							placeholder="Select status"
							fontSize="!text-base"
							padding="!py-3 !px-4"
						/>
					</div>
				</div>

				{/* Footer Buttons */}
				<div className="flex gap-4 pt-6 border-t border-[var(--color-box-border)]">
					<Button
						variant="grayOutline"
						size="mdLg"
						onClick={handleCancel}
						className="flex-1"
					>
						CANCEL
					</Button>
					<Button
						variant={
							canSubmit
								? isEdit
									? "primary"
									: "primary"
								: "disabledPrimary"
						}
						size="mdLg"
						onClick={handleConfirm}
						disabled={!canSubmit}
						className="flex-1 disabled:!bg-[var(--color-stroke-neutral)] disabled:!border-[var(--color-box-border)]"
					>
						{isEdit ? (
							"SAVE CHANGES"
						) : (
							<span className="flex items-center justify-center gap-2">
								CONFIRM
							</span>
						)}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default AddNewGrubPac;
