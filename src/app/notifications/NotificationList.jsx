import React from "react";
import Button from "@/components/ui/Button";
import NotificationItem from "./NotificationItem";
import { RxCross2 } from "react-icons/rx";
import {
	MdCheckBox,
	MdCheckBoxOutlineBlank,
	MdIndeterminateCheckBox,
} from "react-icons/md";
import Icon from "@/components/ui/Icon";
import TableCheckbox from "@/components/ui/TableCheckbox";

export default function NotificationList({
	filtered,
	selected,
	setSelected,
	getNotificationIcon,
	allSelected,
	onMarkAsRead,
	onDismiss,
}) {
	const showMultiSelectBar = selected.length > 0;
	const someSelected =
		selected.length > 0 && selected.length < filtered.length;

	return (
		<div className="bg-white rounded-lg !pl-3 overflow-hidden">
			<div className="flex items-center px-4 py-4 border-b border-[var(--color-stroke-neutral)]">
				<TableCheckbox
					checked={allSelected}
					indeterminate={someSelected}
					onChange={() =>
						setSelected(
							allSelected ? [] : filtered.map((n) => n.id),
						)
					}
				/>
				<span className="text-sm text-[var(--color-stroke-brand)] ml-7">
					Notifications
				</span>
			</div>
			<div className="divide-y divide-[var(--color-stroke-neutral)] cursor-pointer">
				{filtered.map((notification, idx) => (
					<NotificationItem
						key={notification.id}
						notification={notification}
						selected={selected.includes(notification.id)}
						onSelect={(e) =>
							setSelected((sel) =>
								e.target.checked
									? [...sel, notification.id]
									: sel.filter((x) => x !== notification.id),
							)
						}
						getNotificationIcon={getNotificationIcon}
						onDismiss={onDismiss}
					/>
				))}
			</div>
			{showMultiSelectBar && (
				<div className="fixed bottom-2 left-68 right-4 bg-[var(--color-neutral-secondary-bg)] border border-[var(--color-box-border)] rounded-lg flex items-center justify-between px-6 py-3 z-50 shadow-success-toast">
					<div className="flex items-center space-x-2">
						<div className="flex items-center gap-2 text-[var(--primary-gray)] font-medium">
							<Button
								variant="grayOutline"
								onClick={() => setSelected([])}
								className="flex gap-2 cursor-pointer bg-white px-4 py-2 bg-white rounded-md text-sm font-normal items-center"
								style={{
									color: "var(--color-stroke-brand)",
									border: "1px solid var(--color-stroke-brand)",
								}}
							>
								<RxCross2
									style={{
										color: "var(--color-stroke-brand)",
									}}
								/>
								{selected.length} SELECTED
							</Button>
						</div>
					</div>
					<Button
						variant="infoPanel"
						className="flex cursor-pointer gap-4 text-[var(--color-brand-default)] bg-transparent text-base px-8 py-2 rounded-lg font-medium items-center border-0"
						onClick={() => onMarkAsRead?.(selected)}
					>
						<Icon
							name="tick_mark"
							className="text-[var(--color-brand-default)]"
						/>
						MARK ALL AS READ
					</Button>
				</div>
			)}
		</div>
	);
}
