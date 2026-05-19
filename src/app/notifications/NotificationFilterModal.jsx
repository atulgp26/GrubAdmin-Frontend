import React, { forwardRef } from "react";
import Button from "@/components/ui/Button";
import { IoCheckmark } from "react-icons/io5";

// Custom Checkbox component for notification filter
const CustomCheckbox = ({
	checked,
	onChange,
	colorVar,
	hoverState,
	checkedHoverState,
}) => {
	const checkedStyle = checked
		? {
				background: `var(${colorVar})`,
				borderColor: `var(${colorVar})`,
			}
		: {
				borderColor: `var(${colorVar})`,
			};

	return (
		<label className="inline-flex items-center justify-center w-6 h-6 cursor-pointer relative">
			<input
				type="checkbox"
				checked={checked}
				onChange={onChange}
				className="absolute opacity-0 w-0 h-0 peer"
			/>
			<span
				className={`w-5 h-5 flex items-center justify-center rounded border transition-all duration-150 ${hoverState} peer-active:scale-95 ${checked ? `${checkedHoverState}` : "bg-white"}`}
				style={checkedStyle}
			>
				{checked && (
					<svg
						width="16"
						height="16"
						viewBox="0 0 20 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M5 10.5L9 14L15 7"
							stroke="white"
							strokeWidth="2.2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				)}
			</span>
		</label>
	);
};

const TYPE_OPTIONS = [
	{
		label: "Severe",
		value: "error",
		colorVar: "--color-alert-warm",
		hoverState:
			"border border-[var(--color-brand-primary-btn)] hover:bg-[var(--sidebar-active-bg)] hover:!border-[var(--color-filter-text)] active:!shadow-[0_0_0_2px_var(--color-shadow-select)]",
		checkedHoverState:
			"border border-none hover:!bg-[var(--color-filter-text)] hover:!border-[var(--color-filter-text)] active:!bg-[var(--color-brand-primary-btn)] active:!border-[var(--color-brand-primary-btn)] active:!shadow-[0px_0px_0px_2px_var(--color-shadow-select)]",
	},
	{
		label: "Success",
		value: "success",
		colorVar: "--color-success",
		hoverState:
			"hover:bg-[var(--color-success-hover)] hover:border-[var(--color-success-dark)] active:!shadow-[0_0_0_2px_var(--color-success-shadow)]",
		checkedHoverState:
			"border border-none !bg-[var(--color-success)] hover:!bg-[var(--color-success-dark)] active:!bg-[var(--color-success)] active:!shadow-[0_0_0_2px_var(--color-success-shadow)]",
	},
	{ label: "Warning", value: "warning", colorVar: "--color-helpwrite-btn" },
];

const STATUS_OPTIONS = [
	{
		label: "Read",
		value: "read",
		colorVar: "--color-checkbox-bg",
		hoverState:
			"border border-[var(--color-checkbox-bg)] peer-hover:!border-[var(--notif-border)] peer-hover:bg-[var(--color-neutral-secondary-bg)] peer-active:shadow-[0_0_0_2px_var(--color-tablecheckbox-shadow)]",
		checkedHoverState:
			"border border-none peer-hover:!bg-[var(--notif-border)] peer-active:!bg-[var(--color-checkbox-bg)] peer-active:!shadow-[0_0_0_2px_var(--color-tablecheckbox-shadow)]",
	},
	{
		label: "Unread",
		value: "unread",
		colorVar: "--color-checkbox-bg",
		hoverState:
			"border border-[var(--color-checkbox-bg)] peer-hover:!border-[var(--notif-border)] peer-hover:bg-[var(--color-neutral-secondary-bg)] peer-active:shadow-[0_0_0_2px_var(--color-tablecheckbox-shadow)]",
		checkedHoverState:
			"border border-none peer-hover:!bg-[var(--notif-border)] peer-active:!bg-[var(--color-checkbox-bg)] peer-active:!shadow-[0_0_0_2px_var(--color-tablecheckbox-shadow)]",
	},
];

const NotificationFilterModal = forwardRef(
	(
		{
			open,
			onClose,
			selectedTypes = [],
			setSelectedTypes,
			selectedStatuses = [],
			setSelectedStatuses,
			onFilter,
		},
		ref,
	) => {
		if (!open) return null;

		const handleTypeChange = (value) => {
			setSelectedTypes((prev) =>
				prev.includes(value)
					? prev.filter((v) => v !== value)
					: [...prev, value],
			);
		};
		const handleStatusChange = (value) => {
			setSelectedStatuses((prev) =>
				prev.includes(value)
					? prev.filter((v) => v !== value)
					: [...prev, value],
			);
		};

		return (
			<div className="fixed inset-0 z-50 flex items-right justify-end right-6 animate-fadeIn">
				{/* Backdrop for outside click */}
				<div className="absolute inset-0" onClick={onClose} />
				<div
					ref={ref}
					className="bg-white rounded-lg divide-y divide-[var(--color-stroke-neutral)] py-4 border border-[var(--color-stroke-neutral)] shadow-[4px_4px_8px_0px_var(--color-notif-shadow-soft),0px_0px_4px_0px_var(--color-notif-shadow-strong)] w-full max-w-xl h-fit relative top-46 z-10"
				>
					{/* Type Section */}
					<div className="pb-4 mb-4 px-6">
						<div className="font-normal text-sm mb-3 text-[var(--color-neutral-secondary)]">
							Type
						</div>
						<div className="flex gap-23 items-center">
							{TYPE_OPTIONS.map((opt) => (
								<div
									key={opt.value}
									className="flex items-center gap-2 cursor-pointer select-none"
								>
									<CustomCheckbox
										checked={selectedTypes.includes(
											opt.value,
										)}
										onChange={() =>
											handleTypeChange(opt.value)
										}
										colorVar={opt.colorVar}
										hoverState={opt.hoverState}
										checkedHoverState={
											opt.checkedHoverState
										}
									/>
									<span className="font-normal text-lg text-[var(--color-neutral-secondary)]">
										{opt.label}
									</span>
								</div>
							))}
						</div>
					</div>
					{/* Status Section */}
					<div className="mb-3 pb-4 px-6">
						<div className="font-normal text-sm mb-3 text-[var(--color-neutral-secondary)]">
							Status
						</div>
						<div className="flex gap-27">
							{STATUS_OPTIONS.map((opt) => (
								<div
									key={opt.value}
									className="flex items-center gap-2 cursor-pointer select-none"
								>
									<CustomCheckbox
										checked={selectedStatuses.includes(
											opt.value,
										)}
										onChange={() =>
											handleStatusChange(opt.value)
										}
										colorVar={opt.colorVar}
										hoverState={opt.hoverState}
										checkedHoverState={
											opt.checkedHoverState
										}
									/>
									<span className="font-normal text-lg  text-[var(--color-neutral-secondary)]">
										{opt.label}
									</span>
								</div>
							))}
						</div>
					</div>
					{/* Actions */}
					<div className="flex justify-between items-center px-6">
						<Button
							variant="text"
							className=" cursor-pointer text-[var(--color-stroke-brand)] font-medium text-base px-4 py-2 rounded"
							onClick={onClose}
							type="button"
						>
							CANCEL
						</Button>
						<Button
							variant="secondary"
							className=" cursor-pointer flex items-center text-[var(--color-brand-default)] px-6 py-2 rounded-lg font-medium text-base"
							onClick={onFilter}
							type="button"
						>
							<IoCheckmark size={20} className="!mr-2" />
							FILTER NOTIFICATIONS
						</Button>
					</div>
				</div>
			</div>
		);
	},
);

export default NotificationFilterModal;
