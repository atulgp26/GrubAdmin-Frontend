"use client";
import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import CheckBox from "@/components/ui/CheckBox";
import { IoChevronBack } from "react-icons/io5";
import { roleService } from "@/api/services/roleService";
import { employeeService } from "@/api/services/employeeService";
import { showError } from "@/components/ui/toast";
import LoadingDetails from "@/components/ui/LoadingDetails";

export default function ReassignRoleModal({
	open,
	onClose,
	onConfirm,
	title,
	description,
	backHidden,
	excludeRoleId,
}) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedGroup, setSelectedGroup] = useState(null);
	const [hideRole, setHideRole] = useState(false);
	const [roles, setRoles] = useState([]);
	const [loading, setLoading] = useState(false);

	// Calculate permissions count from permissions_json
	const calculatePermissionsCount = (permissionsJson) => {
		if (!permissionsJson || typeof permissionsJson !== "object") return 0;
		return Object.values(permissionsJson).reduce((total, permissions) => {
			return (
				total + (Array.isArray(permissions) ? permissions.length : 0)
			);
		}, 0);
	};

	// Format date helper
	const formatDate = (dateString) => {
		if (!dateString) return "N/A";

		const date = new Date(dateString);
		const now = new Date();
		const today = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
		);
		const dateOnly = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
		);

		// Check if it's today
		if (dateOnly.getTime() === today.getTime()) {
			return "Today";
		}

		// Format as "DD MMM 'YY"
		const day = date.getDate();
		const month = date.toLocaleString("en-US", { month: "short" });
		const year = date.getFullYear().toString().slice(-2);

		return `${day} ${month} '${year}`;
	};

	// Fetch roles from API and compute assignment counts from employees
	useEffect(() => {
		if (open) {
			const fetchRoles = async () => {
				try {
					setLoading(true);
					const [rolesResponse, adminsResponse] = await Promise.all([
						roleService.getRoles(),
						employeeService.getAdmins({}),
					]);

					// Build assignment counts by role id from employees list
					const countsByRoleId = {};
					if (
						adminsResponse?.success &&
						adminsResponse?.code === 200 &&
						Array.isArray(adminsResponse?.data?.admins)
					) {
						adminsResponse.data.admins.forEach((admin) => {
							const roleId =
								admin?.role?.id ||
								admin?.role_id ||
								admin?.roleId ||
								admin?.roleID;
							if (!roleId) return;
							const key = String(roleId);
							countsByRoleId[key] =
								(countsByRoleId[key] || 0) + 1;
						});
					}

					if (
						rolesResponse.success &&
						rolesResponse.code === 200 &&
						rolesResponse.data?.roles
					) {
						const rolesData = rolesResponse.data.roles.map(
							(role, index) => {
								const permissionsCount =
									calculatePermissionsCount(
										role.permissions_json,
									);
								const roleId = role.id ?? `role-${index}`;
								const assignmentCount =
									countsByRoleId[String(roleId)] || 0;
								return {
									id: roleId,
									name: role.name,
									permissionsCount: permissionsCount,
									assignmentCount: assignmentCount,
									status: `${permissionsCount} permissions | ${assignmentCount} assigned`,
									permissions: "View List",
									updated: formatDate(role.updated_at),
									created: formatDate(role.created_at),
								};
							},
						);
						setRoles(rolesData);
					} else {
						console.error("Failed to fetch roles:", rolesResponse);
						showError("Failed to load roles. Please try again.");
					}
				} catch (error) {
					console.error("Error fetching roles:", error);
					showError("Failed to load roles. Please try again.");
				} finally {
					setLoading(false);
				}
			};
			fetchRoles();
		}
	}, [open]);

	// Filter roles based on search and hideRole checkbox
	const filteredGroups = roles.filter((group) => {
		const matchesSearch = group.name
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const shouldHide = hideRole && group.assignmentCount > 0;
			const isCurrentRole = excludeRoleId && String(group.id) === String(excludeRoleId); 
	return matchesSearch && !shouldHide && !isCurrentRole;
});

	const handleSelectGroup = (group) => {
		setSelectedGroup(group);
	};

	const handleConfirm = () => {
		if (selectedGroup) {
			onConfirm(selectedGroup);
			setSelectedGroup(null);
			setSearchTerm("");
		}
	};

	const handleClose = () => {
		setSelectedGroup(null);
		setSearchTerm("");
		setHideRole(false);
		onClose();
	};

	// Reset state when modal closes
	useEffect(() => {
		if (!open) {
			setSelectedGroup(null);
			setSearchTerm("");
			setHideRole(false);
		}
	}, [open]);

	return (
		<Modal
			open={open}
			onClose={handleClose}
			width="w-[920px]"
			height="max-h-[85vh]"
		>
			<div className="flex flex-col h-full overflow-y-auto">
			<div className={`${backHidden ? "hidden" : ""}`}>
				<Button
					variant="cancel"
					size="mdLg"
					className="flex gap-2  group"
					onClick={onClose}
				>
					<IoChevronBack className="w-6 h-6 text-[var(--color-stroke-brand)]" />
					BACK
				</Button>
			</div>
			<div className="flex flex-col px-6 py-6">
				<div className="mb-4">
					<h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-2">
						{title}
					</h2>
					<p className="text-[var(--color-stroke-brand)] text-base">
						{description}
					</p>
				</div>

				<div className="flex items-center justify-between mb-4">
					<div className="w-64">
						<SearchInput
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search role"
							clearable={true}
							onClear={() => setSearchTerm("")}
						/>
					</div>
					<div className="flex items-center gap-4">
						<span className="text-sm text-[var(--color-stroke-brand)]">
							Showing {filteredGroups.length} of {roles.length}
						</span>
						<label className="flex items-center gap-1 text-lg text-[var(--color-neutral-secondary)]">
							<CheckBox
								checked={hideRole}
								onChange={(e) => setHideRole(e.target.checked)}
							/>
							Hide roles with assignment
						</label>
					</div>
				</div>

				<div className="rounded-lg">
					<div className=" p-4 border-b border-[var(--color-stroke-neutral)]">
						<div className="grid grid-cols-2 text-sm font-medium text-[var(--color-stroke-brand)]">
							<span>Role</span>
							<div className="grid grid-cols-4">
								<span>Permissions</span>
								<span>Updated</span>
								<span>Created</span>
								<span></span>
							</div>
						</div>
					</div>

					<div className="max-h-[200px] overflow-y-auto">
						{loading ? (
							<LoadingDetails entity="roles" />
						) : filteredGroups.length === 0 ? (
							<div className="flex items-center justify-center py-12">
								<div className="text-[var(--color-stroke-brand)]">
									No roles found.
								</div>
							</div>
						) : (
							filteredGroups.map((group) => (
								<div
									key={group.id}
									className="p-4 border-b border-[var(--color-stroke-neutral)] last:border-b-0 hover:bg-gray-50"
								>
									<div className="grid grid-cols-2 items-center">
										<div className="flex flex-col gap-1">
											<div className="text-[var(--color-neutral-secondary)] font-semibold">
												{group.name}
											</div>
											<div className="text-sm text-[var(--color-stroke-brand)]">
												{group.status}
											</div>
										</div>
										<div className="grid grid-cols-4">
											<div className="text-[var(--color-stroke-brand)] text-sm">
												{group.permissions}
											</div>
											<div className="text-[var(--color-neutral-secondary)]">
												{group.updated}
											</div>
											<div className="text-[var(--color-neutral-secondary)]">
												{group.created}
											</div>
											<div className="flex">
												<p
													onClick={() =>
														handleSelectGroup(group)
													}
													className={`cursor-pointer px-4 py-1.5 ${
														selectedGroup?.id ===
														group.id
															? "!bg-[var(--sidebar-active-bg)] text-sm rounded-lg !text-[var(--color-filter-text)] underline !font-medium shadow-[0_0_0_2px_var(--color-shadow-select)] border !border-[var(--color-filter-text)]"
															: "!text-[var(--info-panel-view-bg)] hover:underline hover:bg-[var(--sidebar-active-bg)] hover:border-[var(--color-filter-text)] hover:text-[var(--color-filter-text)] active:bg-[var(--color-admin-profile-border)] active:border-[var(--info-panel-view-bg)] active:shadow-[0_0_0_2px_var(--color-shadow-select)] text-sm rounded-lg !font-medium border !border-[var(--info-panel-view-bg)]"
													}`}
												>
													{selectedGroup?.id ===
													group.id
														? "SELECTED"
														: "SELECT"}
												</p>
											</div>
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</div>

				<div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-stroke-neutral)]">
					<div className="text-lg text-[var(--color-neutral-secondary)]">
						{selectedGroup ? (
							<span>{selectedGroup.name} selected.</span>
						) : (
							<span>No role selected yet!</span>
						)}
					</div>
					<Button
						variant="outline"
						size="mdLg"
						disabled={!selectedGroup}
						onClick={handleConfirm}
						className="w-1/2"
					>
						CONFIRM ASSIGNMENT
					</Button>
				</div>
			</div>
			</div>
		</Modal>
	);
}