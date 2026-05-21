"use client";
import React, { useMemo, useRef, useState } from "react";
import {
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
} from "@/components/ui/Table";
import TableCheckbox from "@/components/ui/TableCheckbox";
import CustomTooltip from "@/components/ui/CustomTooltip";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import DropdownPortal from "@/components/ui/DropdownPortal";
import GrubpacRowMenu from "@/components/pages/grubpacs/GrubpacRowMenu";
import { BsThreeDotsVertical } from "react-icons/bs";
import BoxCountBadge from "@/components/ui/BoxCountBadge";

export default function GrubPacsTable({
	data = [],
	selectedItems = [],
	onSelectAll,
	onSelectItem,
	hideVerticalColumn,
	groupName,
	onRowAction = () => {},
}) {
	const isAllSelected = useMemo(
		() => data.length > 0 && selectedItems.length === data.length,
		[data, selectedItems],
	);
	const isIndeterminate = selectedItems.length > 0 && !isAllSelected;
	const [openMenuId, setOpenMenuId] = useState(null);
	const buttonRefs = useRef({});
	const getAssignmentState = (item) =>
		(item.assignment ?? groupName ?? "").toString().toLowerCase();

	const handleToggleMenu = (id) => {
		setOpenMenuId((prev) => (prev === id ? null : id));
	};

	const handleMenuAction = (actionKey, item, assignmentState) => {
		onRowAction(actionKey, item, assignmentState ?? groupName);
		setOpenMenuId(null);
	};
	const getIconColor = (vertical) => {
		switch (vertical.toLowerCase()) {
			case "medical":
				return "text-[var(--color-icon-medical)]";
			case "delivery":
				return "text-[var(--info-panel-view-bg)]";
			case "hospitality":
				return "text-[var(--color-brand-default)]";
			case "camping":
				return "text-[var(--color-icon-camping)]";
			default:
				return "text-[var(--info-panel-view-bg)]"; // fallback
		}
	};
	return (
		<div className="">
			<Table>
				{/* Header */}
				<TableHead>
					<TableRow className="">
						<TableCell className="w-12 !pl-4">
							<TableCheckbox
								checked={isAllSelected}
								indeterminate={isIndeterminate}
								onChange={(e) => onSelectAll(e.target.checked)}
							/>
						</TableCell>
						<TableCell className="text-[var(--color-stroke-brand)]  w-[220px]">
							Name
						</TableCell>
						<TableCell className="text-[var(--color-stroke-brand)]  w-[220px] text-right">
							Client
						</TableCell>
						{!hideVerticalColumn && (
							<TableCell className="text-[var(--color-stroke-brand)]  w-[180px]">
								Vertical
							</TableCell>
						)}
						<TableCell className="text-[var(--color-stroke-brand)]  w-[140px] ">
							Status
						</TableCell>
						<TableCell className="text-[var(--color-stroke-brand)]  w-[160px] ">
							Updated On
						</TableCell>
						<TableCell className="w-12 !pr-4 text-right text-[var(--color-stroke-brand)]"></TableCell>
					</TableRow>
				</TableHead>

				{/* Body */}
				<TableBody>
					{data.map((item) => {
						const assignmentState = getAssignmentState(item);
						const badgeColor =
							assignmentState === "assigned"
								? "delivery"
								: assignmentState === "unassigned"
									? "gray"
									: assignmentState || "gray";
						const crownColor =
							assignmentState === "assigned"
								? "text-[var(--info-panel-view-bg)]"
								: assignmentState === "unassigned"
									? "text-[var(--color-neutral-light)]"
									: getIconColor(
											groupName ?? assignmentState,
										);

						return (
							<TableRow
								key={item.id}
								className={`hover:bg-[var(--color-neutral-secondary-bg)] transition ${
									selectedItems.includes(item.id)
										? "bg-[var(--color-neutral-secondary-bg)]"
										: ""
								}`}
							>
								<TableCell className="!pl-4">
									<TableCheckbox
										checked={selectedItems.includes(
											item.id,
										)}
										onChange={(e) =>
											onSelectItem(
												item.id,
												e.target.checked,
											)
										}
									/>
								</TableCell>
								<TableCell className="font-semibold text-[var(--color-neutral-secondary)]">
									<div className="flex flex-col gap-1">
										<div className="text-[var(--color-neutral-secondary)] font-semibold">
											{item.name}
										</div>
										<div className="text-[var(--color-stroke-brand)] text-sm">
											{item.code}
										</div>
									</div>
								</TableCell>
								<TableCell className="!text-right text-[var(--color-stroke-brand)]">
									<div className="flex justify-end">
										<BoxCountBadge
											asText={groupName === "Assigned"}
											tooltipSide="bottom"
											tooltipAlign="end"
											tooltipTextColor="text-[var(--color-neutral-secondary)]"
											tooltipText={
												groupName === "Unassigned"
													? "Click To Assign"
													: undefined
											}
											onClick={
												groupName === "Unassigned"
													? () =>
															onRowAction(
																"assign",
																item,
																groupName,
															)
													: undefined
											}
											tooltipContent={
												groupName === "Assigned" ? (
													<div className="space-y-2">
														<div className="flex flex-col text-[var(--color-stroke-brand)] text-xs">
															<div className="text-right text-[var(--color-stroke-brand)]">
																Assigned to{" "}
																<span className="text-[var(--info-panel-view-bg)] text-sm font-semibold cursor-pointer hover:underline">
																	{
																		item
																			.client
																			?.name
																	}
																	{item.client
																		?.organization_name &&
																		`(${
																			item
																				.client
																				?.organization_name
																		})`}
																</span>
															</div>
															<div className="text-right text-sm text-[var(--color-stroke-brand)] font-medium">
																(
																{
																	item.client
																		?.country_code
																}{" "}
																{
																	item.client
																		?.mobile_number
																}{" "}
																|{" "}
																{
																	item.client
																		?.email
																}
																)
															</div>
														</div>
													</div>
												) : (
													<div className="text-right text-sm text-[var(--color-stroke-brand)]">
														Click to assign box to a
														client
													</div>
												)
											}
										>
											<Badge
												color={badgeColor}
												className="leading-none group hover:bg-[var(--color-admin-profile-border)] hover:border-[var(--info-panel-view-bg)] flex items-center cursor-pointer"
											>
												<Icon
													name="crown"
													className={`w-4 h-4 ${crownColor} group-hover:text-[var(--info-panel-view-bg)]`}
												/>
												<span className="text-xs font-medium text-[var(--color-neutral-secondary)]">
													{item.clientName?.trim()
														? item.clientName
														: ""}
												</span>
											</Badge>
										</BoxCountBadge>
									</div>
								</TableCell>

								{!hideVerticalColumn && (
									<TableCell className=" text-[var(--color-neutral-secondary)]">
										<div className="w-max">
											<Badge
												color={`${item.vertical.name.toLowerCase()}`}
												className="leading-none flex items-center space-x-2 w-max cursor-pointer"
											>
												<Icon
													name="inventory"
													className={`w-4 h-4 ${getIconColor(item.vertical.name)}`}
												/>
												{item.vertical.name}
											</Badge>
										</div>
									</TableCell>
								)}
								<TableCell
									className={` text-[var(--color-neutral-secondary)] font-medium`}
								>
									{item.statusDisplay ?? item.status}
								</TableCell>
								<TableCell className=" text-[var(--color-neutral-secondary)]">
									{item.updatedOn}
								</TableCell>
								<TableCell className="w-12 !pr-4 text-right">
									<div className="relative">
										<button
											ref={(el) => {
												if (el) {
													buttonRefs.current[
														item.id
													] = el;
												} else {
													delete buttonRefs.current[
														item.id
													];
												}
											}}
											onClick={() =>
												handleToggleMenu(item.id)
											}
											className={`p-2 rounded-lg transition hover:bg-[var(--color-neutral-secondary-bg)] ${
												openMenuId === item.id
													? "bg-[var(--color-neutral-secondary-bg)] shadow-[0_0_0_2px_var(--color-shadow-actionmenu)]"
													: ""
											}`}
											aria-label="Open actions"
										>
											<BsThreeDotsVertical className="w-5 h-5 text-[var(--color-stroke-brand)]" />
										</button>
										<DropdownPortal
											targetRef={
												buttonRefs.current[item.id]
													? {
															current:
																buttonRefs
																	.current[
																	item.id
																],
														}
													: null
											}
											open={openMenuId === item.id}
											onClose={() => setOpenMenuId(null)}
										>
											<GrubpacRowMenu
												open={openMenuId === item.id}
												onClose={() =>
													setOpenMenuId(null)
												}
												onAction={(action) =>
													handleMenuAction(
														action,
														item,
														assignmentState,
													)
												}
												isAssigned={
													assignmentState ===
													"assigned"
												}
											/>
										</DropdownPortal>
									</div>
								</TableCell>
							</TableRow>
						);
					})}

					{data.length === 0 && (
						<TableRow>
							<TableCell
								colSpan={hideVerticalColumn ? 6 : 7}
								className="text-center py-6 text-gray-400 text-sm"
							>
								No grubpacs found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
