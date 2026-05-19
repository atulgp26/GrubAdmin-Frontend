import React, { useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";
import { HiOutlineChevronDown } from "react-icons/hi";
import { RxCross2 } from "react-icons/rx";
import SearchInput from "./SearchInput";
import { twMerge } from "tailwind-merge";

export default function Select({
	value,
	onChange,
	options,
	placeholder,
	showSearch = false,
	className = "",
	fontSize,
	padding = "",
	onOpenChange,
	disabled,
}) {
	const [searchTerm, setSearchTerm] = useState("");
	const selectedOption = options.find((opt) => opt.value === value);
	const displayValue =
		selectedOption && !selectedOption.isRemove ? selectedOption.label : "";

	const filteredOptions = showSearch
		? options.filter(
				(opt) =>
					opt.isRemove ||
					opt.label
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					(opt.description &&
						opt.description
							.toLowerCase()
							.includes(searchTerm.toLowerCase())),
			)
		: options;
	// Helper to notify parent about open/close changes without causing render loops
	const OpenNotifier = ({ open, onOpenChange: cb }) => {
		const cbRef = React.useRef(cb);
		// keep latest callback
		useEffect(() => {
			cbRef.current = cb;
		}, [cb]);
		// call only when `open` changes
		useEffect(() => {
			if (typeof cbRef.current === "function") cbRef.current(open);
		}, [open]);
		return null;
	};

	return (
		<Listbox value={value} onChange={onChange} disabled={disabled}>
			{({ open }) => (
				<div className={`relative w-full ${className}`}>
					<OpenNotifier open={open} onOpenChange={onOpenChange} />
					<Listbox.Button
						className={twMerge(
							`w-full text-left ${padding} py-3 px-4 rounded-lg bg-white  hover:bg-[var(--color-neutral-secondary-bg)] duration-200 flex items-center border focus:outline-none ${
								open
									? "border border-[var(--info-panel-view-bg)] shadow-[0_0_0_4px_var(--color-shadow-select)]"
									: "border border-[var(--color-box-border)]"
							}`,
							disabled
								? "!bg-[var(--color-neutral-secondary-bg)] cursor-not-allowed"
								: "",
						)}
					>
						<span
							className={`text-sm ${fontSize} font-normal ${
								displayValue
									? "text-[var(--color-neutral-secondary)]"
									: "text-[var(--color-neutral-light)]"
							}`}
						>
							{displayValue || placeholder}
						</span>
						<HiOutlineChevronDown
							className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--info-panel-view-bg)] pointer-events-none ${open ? "rotate-180" : "rotate-0"}`}
						/>
					</Listbox.Button>
					<Listbox.Options className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-[4px_4px_8px_0px_var(--color-notif-shadow-soft),0px_0px_4px_0px_var(--color-notif-shadow-strong)] border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] border border-[var(--color-stroke-neutral)] max-h-60 focus:outline-none overflow-y-auto scrollbar-hide">
						{showSearch && (
							<div className={` sticky top-0 bg-white p-2`}>
								<SearchInput
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
									placeholder="Search"
									className="w-full"
									onClear={() => setSearchTerm("")}
								/>
							</div>
						)}
						{placeholder && !showSearch && (
							<Listbox.Option
								key="placeholder"
								value=""
								disabled
								className="text-[var(--color-neutral-light)] px-4 py-2 cursor-default select-none text-sm font-normal"
							>
								{placeholder}
							</Listbox.Option>
						)}
						{filteredOptions.length === 0 &&
						showSearch &&
						searchTerm ? (
							<div className="px-4 py-2 text-sm text-[var(--color-neutral-light)]">
								No options found
							</div>
						) : (
							filteredOptions.map((opt, index) => (
								<React.Fragment key={opt.value}>
									{opt.isRemove && index > 0 && (
										<div className="border-t border-[var(--color-box-border)] mx-2 my-1"></div>
									)}
									<Listbox.Option
										value={opt.value}
										className={({ active, selected }) =>
											`px-4 py-2 cursor-pointer select-none bg-white hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)] transition-colors text-sm font-normal ${
												opt.isRemove
													? active
														? "!bg-[var(--color-admin-profile-border)] text-[var(--color-neutral-primary)]"
														: "text-[var(--color-neutral-secondary)] bg-white"
													: selected
														? "!bg-[var(--sidebar-active-bg)] text-[var(--color-neutral-primary)]"
														: "text-[var(--color-neutral-secondary)]"
											}`
										}
									>
										{opt.isRemove ? (
											<div className="flex items-center gap-2">
												<RxCross2 className="w-4 h-4" />
												{opt.label}
											</div>
										) : (
											opt.label
										)}
										{opt.description && (
											<div className="text-xs text-[var(--color-stroke-brand)] mt-1">
												{opt.description}
											</div>
										)}
									</Listbox.Option>
								</React.Fragment>
							))
						)}
					</Listbox.Options>
				</div>
			)}
		</Listbox>
	);
}
