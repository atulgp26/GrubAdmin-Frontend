import Button from "./Button";
import { RxCross2, RxCrossCircled } from "react-icons/rx";
import { useState, useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { RiLoopRightFill } from "react-icons/ri";
import { FaUserCheck } from "react-icons/fa6";
import { FiUserCheck } from "react-icons/fi";
import { LuUserCheck } from "react-icons/lu";
import { PiUserCheck } from "react-icons/pi";
import { TbUserCheck } from "react-icons/tb";
import Icon from "./Icon";
export default function TableActionBar({
	selectedCount = 0,
	onClearSelection,
	onSuspend,
	onRemoveVehicles,
	onReassignRole,
	onRemoveRoom,
	rightActionLabel,
	rightActionIcon,
	onRightAction,
	suspended,
	rightActionVariant,
	onActivate,
	onDelete,
	onRoles,
	employeeList,
	allowActivate = true,
	allowDelete = true,
	allowSuspend = true,
	allowReassign = true,
	reassignButtonText = "Reassign Role",
	customActions = [],
}) {
	const [activeAction, setActiveAction] = useState(null);
	const [showMoreDropdown, setShowMoreDropdown] = useState(false);
	const moreRef = useRef(null);
	const actionRef = useRef(null);

	useEffect(() => {
		function handleClick(e) {
			if (moreRef.current && !moreRef.current.contains(e.target)) {
				setShowMoreDropdown(false);
			}
		}
		if (showMoreDropdown)
			document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [showMoreDropdown]);

	useEffect(() => {
		function handleClickOutside(e) {
			if (actionRef.current && !actionRef.current.contains(e.target)) {
				setActiveAction(null);
			}
		}
		if (activeAction)
			document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, [activeAction]);
	if (selectedCount === 0) return null;

	return (
		<div className="fixed bottom-1 left-64 right-4 bg-[var(--color-neutral-secondary-bg)] border border-[var(--color-box-border)] text-[var(--color-stroke-brand)] rounded-lg shadow-lg flex items-center justify-between px-6 py-3 z-50">
			<div className="flex items-center space-x-2">
				<Button
					variant="grayOutline"
					className="flex gap-2 !border cursor-pointer !border-[var(--color-stroke-brand)] bg-white px-4 py-2 rounded-md !text-base font-medium items-center"
					onClick={onClearSelection}
				>
					<RxCross2 className="text-lg" />
					{selectedCount} SELECTED
				</Button>
			</div>
			{suspended ? (
				<div className="flex items-center space-x-4">
					{customActions.map((action) => (
						<Button
							variant="grayOutline"
							className="flex gap-2 !border cursor-pointer !border-[var(--color-stroke-brand)] bg-white px-4 py-2 rounded-md !text-base font-medium items-center"
							onClick={onClearSelection}
							key={action.key}
						>
							<RxCross2 className="text-lg" />
							{selectedCount} SELECTED
						</Button>
					))}
					<div className="flex items-center space-x-2">
						{allowActivate && (
							<Button
								onClick={onActivate}
								variant="activateGreen"
								className="flex items-center gap-2 text-[var(--notif-success)] group-hover:text-[var(--color-success-dark)] font-medium uppercase"
							>
								<Icon
									name="user_check"
									className="w-5 h-5 text-[var(--notif-success)] group-hover:text-[var(--color-success-dark)]"
								/>
								ACTIVATE SELECTION
							</Button>
						)}
					</div>
					{allowDelete && (
						<div className="cursor-pointer flex items-center gap-3">
							<Button
								onClick={onDelete}
								variant="text"
								className="flex leading-none items-center gap-2 text-[var(--color-stroke-brand)] font-medium uppercase"
							>
								<Trash2 className="w-5 h-5 text-[var(--color-stroke-brand)] group-hover:text-[var(--notif-border)]" />
								Delete
							</Button>
						</div>
					)}
				</div>
			) : (
				<div className="flex items-center space-x-4">
					{customActions.map((action) => (
						<div
							onClick={action.onClick}
							key={action.key}
							className="cursor-pointer flex items-center gap-3"
						>
							<Button
								onClick={action.onClick}
								variant="text"
								className="flex items-center gap-2 text-[var(--color-stroke-brand)] font-medium uppercase"
							>
								{action.icon()}
								<span className="leading-none">
									{action.label}
								</span>
							</Button>
						</div>
					))}
					{allowReassign && (
						<div
							className={`${onRoles ? "hidden" : ""} cursor-pointer flex items-center gap-3`}
						>
							<Button
								onClick={onReassignRole}
								variant="text"
								className="flex items-center gap-2 text-[var(--color-stroke-brand)] font-medium uppercase"
							>
								<RiLoopRightFill className="w-5 h-5 text-[var(--color-stroke-brand)] group-hover:text-[var(--notif-border)]" />
								Reassign Role
							</Button>
						</div>
					)}
					{allowSuspend && (
						<div
							className={`${onRoles ? "hidden" : ""}  cursor-pointer flex items-center gap-3`}
						>
							<Button
								onClick={onSuspend}
								variant="text"
								className="flex items-center gap-2 text-[var(--color-stroke-brand)] font-medium uppercase"
							>
								<RxCrossCircled className="w-5 h-5 text-[var(--color-stroke-brand)] group-hover:text-[var(--notif-border)]" />
								Suspend Selection
							</Button>
						</div>
					)}
					{allowDelete && (
						<div
							className="cursor-pointer flex items-center gap-3"
							onClick={onDelete}
						>
							<Button
								onClick={onDelete}
								variant="text"
								className="flex items-center gap-2 text-[var(--color-stroke-brand)] font-medium uppercase"
							>
								<Trash2 className="w-5 h-5 text-[var(--color-stroke-brand)] group-hover:text-[var(--notif-border)]" />
								<span className="leading-none">
									{employeeList
										? "Delete"
										: "Delete Selection"}
								</span>
							</Button>
						</div>
					)}
					{rightActionLabel && onRightAction && (
						<Button
							variant={rightActionVariant || "lock"}
							className={`flex cursor-pointer items-center gap-2 px-4 py-2 ${
								rightActionLabel === "EMERGENCY UNLOCK"
									? `border border-[var(--color-warning)] !rounded-full hover:text-[var(--color-warning)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]`
									: "bg-transparent uppercase cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors"
							}`}
							onClick={onRightAction}
						>
							{rightActionIcon && rightActionIcon}
							{rightActionLabel}
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
