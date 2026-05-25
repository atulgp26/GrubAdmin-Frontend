"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Button from "@/components/ui/Button";
import SearchWithSuggestions from "@/components/ui/SearchWithSuggestions";
import {
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
} from "@/components/ui/Table";
import TableCheckbox from "@/components/ui/TableCheckbox";
import Badge from "@/components/ui/Badge";
import GroupCollapseTable from "@/components/shared/GroupCollapseTable";
import { BsThreeDotsVertical } from "react-icons/bs";
import Pagination from "@/components/ui/Pagination";
import BoxCountBadge from "@/components/ui/BoxCountBadge";
import CustomTooltip from "@/components/ui/CustomTooltip";
import Modal from "@/components/ui/Modal";
import Icon from "@/components/ui/Icon";
import CheckBox from "@/components/ui/CheckBox";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import TableActionBar from "@/components/ui/TableActionBar";
import DropdownPortal from "@/components/ui/DropdownPortal";
import ExportListModal from "@/components/pages/employees/ExportListModal";
import { showSuccess, showError } from "@/components/ui/toast";
import { IoChevronBack } from "react-icons/io5";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { employeeService } from "@/api/services/employeeService";
import { roleService } from "@/api/services/roleService";
import RolePermissionsModal from "@/components/pages/employees/RolePermissionsModal";
import { usePermissions } from "@/context/PermissionContext";

const DismissEmployees = () => {
	const router = useRouter();
	const { can } = usePermissions();
	const canViewDismissed =
		can("view dismissed employees", "employees") ||
		can("view dismissed employees");
	const canExportEmployees =
		can("export employees", "employees") || can("export employees");
	const canViewEmployeeLogs =
		can("view employee logs", "employees") || can("view employee logs");
	const [searchValue, setSearchValue] = useState("");
	const [selectedRole, setSelectedRole] = useState([]);
	const [groupByRole, setGroupByRole] = useState(false);
	const [selectedEmployees, setSelectedEmployees] = useState(new Set());
	const [selectAll, setSelectAll] = useState(false);
	const [openGroupIndex, setOpenGroupIndex] = useState(null);
	const [exportListModal, setExportListModal] = useState(false);
	const [menuOpen, setMenuOpen] = useState(null);
	const buttonRefs = useRef({});
	const [rolePermissionsModal, setRolePermissionsModal] = useState(false);
	const [selectedRoleForPermissions, setSelectedRoleForPermissions] =
		useState(null);
	const [roleOptions, setRoleOptions] = useState([]);
	const [employees, setEmployees] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;

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
		if (dateOnly.getTime() === today.getTime()) {
			return "Today";
		}
		const day = date.getDate();
		const month = date.toLocaleString("en-US", { month: "short" });
		const year = date.getFullYear().toString().slice(-2);
		return `${day} ${month} '${year}`;
	};

	const formatJoiningDate = (dateString) => {
		if (!dateString) return "";
		try {
			const date = new Date(dateString);
			const day = date.getDate();
			const month = date.toLocaleString("en-US", { month: "short" });
			const year = date.getFullYear().toString().slice(-2);
			return `${day} ${month} '${year}`;
		} catch (e) {
			return "";
		}
	};

	// Fetch dismissed employees from API
	const fetchDismissedEmployees = useCallback(async () => {
		try {
			setLoading(true);
			const params = { status: "dismissed" };
			if (searchValue && searchValue.trim()) {
				params.query = searchValue.trim();
			}
			if (selectedRole.length > 0) {
				// For dismissed employees, API expects role name (string) instead of role ID
				const selectedRoleOption = roleOptions.find(
					(ro) => ro.id === selectedRole[0],
				);
				if (selectedRoleOption) {
					params.role = selectedRoleOption.label; // Send role name instead of ID
				}
			}
			const response = await employeeService.getAdmins(params);
			if (
				response?.success &&
				response.code === 200 &&
				response.data?.admins
			) {
				const transformed = response.data.admins.map((admin, index) => {
					const firstName = admin.first_name || "";
					const lastName = admin.last_name || "";
					const fullName =
						[firstName, lastName].filter(Boolean).join(" ") ||
						"Unnamed Employee";
					const phoneFormatted =
						admin.mobile_number && admin.country_code
							? `${admin.country_code} ${admin.mobile_number}`
							: admin.mobile_number || "";
					// For dismissed employees, role is a string directly (e.g., "manager", "support")
					// Not an object with a name property
					let roleName = "No role";
					if (admin.role) {
						if (typeof admin.role === "string") {
							roleName = admin.role;
						} else if (admin.role.name) {
							roleName = admin.role.name;
						}
					} else if (admin.role_name) {
						roleName = admin.role_name;
					}

					return {
						id: admin.id || `emp-${index}`,
						name: fullName,
						empId: admin.employee_id
							? `#${admin.employee_id}`
							: `#${admin.id?.slice(-8) || `EMP${index}`}`,
						joinDate: formatJoiningDate(admin.joining_date),
						location: admin.location || "Not specified",
						phone: phoneFormatted || "Not provided",
						email: admin.email || "Not provided",
						role: roleName,
						dismissed: formatDate(
							admin.dismissed_at || admin.updated_at,
						),
						originalData: admin,
					};
				});
				setEmployees(transformed);
			} else {
				setEmployees([]);
			}
		} catch (e) {
			setEmployees([]);
		} finally {
			setLoading(false);
		}
	}, [searchValue, selectedRole, roleOptions]);

	// Fetch role options from API
	useEffect(() => {
		if (typeof window === "undefined") return;
		const fetchRoleOptions = async () => {
			try {
				const response = await roleService.getRoles();
				if (
					response.success &&
					response.code === 200 &&
					response.data?.roles
				) {
					const options = response.data.roles.map((role) => ({
						id: role.id,
						label: role.name,
					}));
					setRoleOptions(options);
				}
			} catch (error) {
				console.error("Error fetching roles for filter:", error);
			}
		};
		fetchRoleOptions();
	}, []);

	// Fetch dismissed employees on mount and when filters change
	useEffect(() => {
		if (typeof window === "undefined") return;
		fetchDismissedEmployees();
	}, [fetchDismissedEmployees]);

	const getPermissionsCount = (employee) => {
		if (!employee?.originalData?.role?.permissions_json) return 0;
		const permissionsJson = employee.originalData.role.permissions_json;
		let totalCount = 0;
		Object.keys(permissionsJson).forEach((sectionKey) => {
			const permissionList = permissionsJson[sectionKey] || [];
			totalCount += permissionList.length;
		});
		return totalCount;
	};

	const handleViewDetails = (employee) => {
		if (employee && employee.originalData && employee.originalData.role) {
			setSelectedRoleForPermissions(employee.originalData.role);
			setRolePermissionsModal(true);
		}
	};

	const exportOptions = [
		{
			group: "scope",
			title: "Scope",
			items: [
				{
					id: "employees",
					label: "All dismissed employees",
					type: "radio",
				},
				{
					id: "filteredList",
					label: "As per the filtered list",
					type: "radio",
				},
			],
		},
		{
			group: "details",
			title: "Extra details",
			items: [
				{
					id: "activityLogs",
					label: "Activity logs",
					type: "checkbox",
				},
			],
		},
	];

	const handleExportConfirm = async ({ scope, checked }) => {
		try {
			setExportListModal(false);

			const params = {
				status: "dismissed", // Always set status to dismissed for this page
			};

			// Handle scope
			if (scope === "employees" || !scope) {
				// All dismissed employees
				params.fetch_all = true;
			} else if (scope === "filteredList") {
				// As per the filtered list
				if (searchValue && searchValue.trim()) {
					params.query = searchValue.trim();
				}
				if (selectedRole.length > 0) {
					// For dismissed employees, API expects role name (string) instead of role ID
					const selectedRoleOption = roleOptions.find(
						(ro) => ro.id === selectedRole[0],
					);
					if (selectedRoleOption) {
						params.role = selectedRoleOption.label; // Send role name instead of ID
					}
				}
			}

			// Handle extra details
			if (checked["activityLogs"]) {
				params.include_activity_logs = true;
			}

			const response = await employeeService.exportAdmins(params);

			if (response && typeof response === "object" && response.blob) {
				const blob = response.blob;
				const filename =
					response.filename ||
					`dismissed_employees_export_${new Date().toISOString().split("T")[0]}.csv`;

				if (blob.size === 0) {
					showError(
						"Export file is empty. Please check your filters and try again.",
					);
					return;
				}

				const finalFilename = filename.endsWith(".csv")
					? filename
					: `${filename}.csv`;

				const url = window.URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = finalFilename;
				link.style.display = "none";

				document.body.appendChild(link);
				link.click();

				setTimeout(() => {
					window.URL.revokeObjectURL(url);
					if (document.body.contains(link)) {
						document.body.removeChild(link);
					}
				}, 100);

				showSuccess("Success!", "CSV file downloaded successfully.");
			} else {
				showError("Failed to export. Invalid response from server.");
			}
		} catch (error) {
			console.error("Export error:", error);
			const errorMessage =
				error.message ||
				"Failed to export employees. Please try again.";
			showError(errorMessage);
		}
	};

	const handleExportList = () => {
		setExportListModal(true);
	};

	// Filter employees based on search value and selected roles
	const filteredEmployees = employees.filter((employee) => {
		if (selectedRole.length > 0) {
			// For dismissed employees, compare by role name (string) instead of role ID
			const selectedRoleOption = roleOptions.find(
				(ro) => ro.id === selectedRole[0],
			);
			if (selectedRoleOption) {
				const employeeRoleName = employee.role || "No role";
				// Compare role names (case-insensitive)
				if (
					employeeRoleName.toLowerCase() !==
					selectedRoleOption.label.toLowerCase()
				) {
					return false;
				}
			}
		}

		if (!searchValue) return true;

		const searchLower = searchValue.toLowerCase();
		return (
			employee.name.toLowerCase().includes(searchLower) ||
			employee.empId.toLowerCase().includes(searchLower) ||
			employee.email.toLowerCase().includes(searchLower) ||
			employee.phone.includes(searchValue) ||
			employee.role.toLowerCase().includes(searchLower) ||
			employee.location.toLowerCase().includes(searchLower)
		);
	});

	// Compute visible slice for flat (non-grouped) table
	const flatTotal = filteredEmployees.length;
	const flatStart = (currentPage - 1) * pageSize;
	const flatEnd = Math.min(flatStart + pageSize, flatTotal);
	const visibleFlatEmployees = filteredEmployees.slice(flatStart, flatEnd);

	// Reset pagination when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [searchValue, selectedRole, groupByRole]);

	const handleSelectAll = (checked, subset = filteredEmployees) => {
		setSelectAll(checked);
		if (checked) {
			setSelectedEmployees(new Set(subset.map((emp) => emp.id)));
		} else {
			setSelectedEmployees(new Set());
		}
	};

	const handleSelectEmployee = (empId, checked) => {
		const newSelected = new Set(selectedEmployees);
		if (checked) {
			newSelected.add(empId);
		} else {
			newSelected.delete(empId);
		}
		setSelectedEmployees(newSelected);
		setSelectAll(
			newSelected.size === filteredEmployees.length &&
				filteredEmployees.length > 0,
		);
	};

	// Group employees by role
	const groupEmployeesByRole = () => {
		const groupedEmployees = {};

		filteredEmployees.forEach((employee) => {
			if (employee.role && employee.role.trim()) {
				const roleName = employee.role;
				if (!groupedEmployees[roleName]) {
					groupedEmployees[roleName] = [];
				}
				groupedEmployees[roleName].push(employee);
			}
		});

		const allRoleNames = new Set();
		roleOptions.forEach((role) => {
			if (role.label) {
				allRoleNames.add(role.label);
			}
		});

		const allRoles = Array.from(allRoleNames).sort((a, b) => {
			return a.localeCompare(b);
		});

		return allRoles.map((roleName) => {
			const roleEmployees = groupedEmployees[roleName] || [];
			const permissionsCount =
				roleEmployees.length > 0 &&
				roleEmployees[0]?.originalData?.role?.permissions_json
					? (() => {
							const permissionsJson =
								roleEmployees[0].originalData.role
									.permissions_json;
							let totalCount = 0;
							Object.keys(permissionsJson).forEach(
								(sectionKey) => {
									const permissionList =
										permissionsJson[sectionKey] || [];
									totalCount += permissionList.length;
								},
							);
							return totalCount;
						})()
					: 0;

			return {
				name: (
					<CustomTooltip
						title={
							<div className="space-y-2">
								<div className="text-[var(--color-stroke-brand)] text-sm">
									{permissionsCount} permissions
								</div>
								<div
									className="text-[var(--info-panel-view-bg)] text-sm font-semibold cursor-pointer hover:underline"
									onClick={(e) => {
										e.stopPropagation();
										if (
											roleEmployees.length > 0 &&
											roleEmployees[0].originalData?.role
										) {
											handleViewDetails({
												originalData: {
													role: roleEmployees[0]
														.originalData.role,
												},
											});
										}
									}}
								>
									View details &gt;&gt;
								</div>
							</div>
						}
						placement="bottom"
						arrowPosition="left"
					>
						<span className="cursor-default hover:underline text-[var(--color-stroke-brand)] font-medium text-sm">
							{roleName.toUpperCase()}
						</span>
					</CustomTooltip>
				),
				items: roleEmployees,
			};
		});
	};

	// Render table content for each group
	const renderGroupTable = (group) => {
		const groupEmployeeIds = group.items.map((emp) => emp.id);
		const allGroupSelected =
			groupEmployeeIds.length > 0 &&
			groupEmployeeIds.every((id) => selectedEmployees.has(id));
		const someGroupSelected = groupEmployeeIds.some((id) =>
			selectedEmployees.has(id),
		);

		const handleGroupSelectAll = (checked) => {
			const newSelected = new Set(selectedEmployees);
			if (checked) {
				groupEmployeeIds.forEach((id) => newSelected.add(id));
			} else {
				groupEmployeeIds.forEach((id) => newSelected.delete(id));
			}
			setSelectedEmployees(newSelected);
			setSelectAll(
				newSelected.size === employees.length && employees.length > 0,
			);
		};

		if (group.items.length === 0) {
			return (
				<div className="text-center py-12 text-[var(--color-stroke-brand)]">
					No employees assigned to this role.
				</div>
			);
		}

		return (
			<div className="">
				<Table className="min-w-full">
					<TableHead>
						<TableRow>
							<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
								Name
							</TableCell>
							<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
								Contact info
							</TableCell>
							<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
								Dismissed
							</TableCell>
							<TableCell className="w-12 p-4"></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{group.items.map((employee) => (
							<TableRow key={employee.id}>
								<TableCell className="p-4">
									<div>
										<div className="font-semibold pb-1 text-base text-[var(--color-neutral-secondary)]">
											{employee.name}
										</div>
										<div className="text-sm text-[var(--color-stroke-brand)]">
											{employee.empId} | Joined{" "}
											{employee.joinDate} |{" "}
											{employee.location}
										</div>
									</div>
								</TableCell>
								<TableCell className="p-4">
									<div className="flex flex-col">
										<div className="text-[var(--color-neutral-secondary)] pb-1 text-base font-semibold">
											{employee.phone}
										</div>
										<div className="text-sm text-[var(--color-stroke-brand)]">
											{employee.email}
										</div>
									</div>
								</TableCell>
								<TableCell className="p-4 text-[var(--color-neutral-secondary)] text-base">
									<BoxCountBadge
										asText
										tooltipSide="bottom"
										tooltipAlign="end"
										tooltipContent={
											<div className="space-y-2">
												<div className="text-[var(--color-stroke-brand)] text-xs text-right">
													Dismissed by You
												</div>
												<div className="text-[var(--color-stroke-brand)] text-xs text-right">
													Added on {employee.joinDate}{" "}
													(You)
												</div>
											</div>
										}
									>
										<span className="cursor-default hover:underline">
											{employee.dismissed}
										</span>
									</BoxCountBadge>
								</TableCell>
								<TableCell className="w-12 p-4">
									<button
										ref={(el) =>
											(buttonRefs.current[employee.id] =
												el)
										}
										onClick={() =>
											setMenuOpen(
												menuOpen === employee.id
													? null
													: employee.id,
											)
										}
										className={`p-2 hover:bg-[var(--color-neutral-secondary-bg)] rounded-lg ${menuOpen === employee.id ? "bg-[var(--color-neutral-secondary-bg)] shadow-[0_0_0_2px_var(--color-shadow-actionmenu)] rounded-lg" : ""}`}
									>
										<BsThreeDotsVertical className="w-5 h-5 text-[var(--color-stroke-brand)]" />
									</button>
									<DropdownPortal
										targetRef={
											buttonRefs.current[employee.id]
												? {
														current:
															buttonRefs.current[
																employee.id
															],
													}
												: null
										}
										open={menuOpen === employee.id}
										onClose={() => setMenuOpen(null)}
									>
										<div className="absolute w-52 bg-white border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] rounded-lg shadow-[4px_4px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)] z-50">
											{canViewEmployeeLogs && (
												<button className="flex items-center w-full px-4 py-3 text-sm text-[var(--color-neutral-secondary)] ">
													<Icon
														name="note"
														className="mr-2 w-5 h-5 text-[var(--color-neutral-light)]"
													/>{" "}
													View logs
												</button>
											)}
										</div>
									</DropdownPortal>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	};

	// Create search data for SearchWithSuggestions
	const searchData = employees.map((employee) => ({
		id: employee.id,
		name: employee.name,
		code: employee.role,
	}));

	if (!canViewDismissed) return null;

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-4">
					<Button
						variant="cancel"
						onClick={() => router.push("/employees/list")}
						className="p-2 rounded-lg transition-colors"
					>
						<IoChevronBack className="w-4 h-4 text-[var(--color-stroke-brand)]" />
					</Button>
					<h1 className="text-lg font-semibold text-[var(--color-neutral-primary)]">
						Dismissed employees
					</h1>
				</div>
				<div className="flex items-center gap-3 relative">
					{canExportEmployees && (
						<Button
							variant="cancel"
							size="sm"
							onClick={handleExportList}
							className="btn-size-md-sm"
						>
							EXPORT LIST
						</Button>
					)}
				</div>
			</div>

			{/* Search and Filters */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-4">
					<div className="w-64">
						<SearchWithSuggestions
							data={searchData}
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
							onSelect={(item) => setSearchValue(item.name)}
							getLabel={(item) => item.name || item.email || ""}
							getSubLabel={(item) => item.code || "Employee"}
							placeholder="Search employee"
							className="[&_input]:!h-8 [&_input]:!py-1"
							clearable={true}
							onClear={() => setSearchValue("")}
							openOnFocus={false}
							minChars={1}
						/>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<span className="text-sm text-[var(--color-stroke-brand)]">
						Showing {visibleFlatEmployees.length} of{" "}
						{filteredEmployees.length}
					</span>
					<div className="w-48">
						<MultiSelectDropdown
							options={roleOptions}
							selected={selectedRole}
							setSelected={setSelectedRole}
							placeholder="All roles"
						/>
					</div>
					<label className="flex items-center gap-2 text-lg text-[var(--color-neutral-secondary)]">
						<CheckBox
							checked={groupByRole}
							onChange={(e) => setGroupByRole(e.target.checked)}
						/>
						Group as per role
					</label>
				</div>
			</div>

			{/* Table or Grouped View */}
			{loading ? (
				<div className="flex items-center justify-center py-12">
					<div className="text-[var(--color-neutral-secondary)]">
						Loading dismissed employees...
					</div>
				</div>
			) : groupByRole ? (
				<GroupCollapseTable
					groups={groupEmployeesByRole()}
					openIndex={openGroupIndex}
					setOpenIndex={setOpenGroupIndex}
					renderTable={renderGroupTable}
					noResultsMessage="No dismissed employees found."
					tableContainerClass="w-full"
				/>
			) : (
				<div className="">
					<Pagination
						currentPage={currentPage}
						pageSize={pageSize}
						totalItems={flatTotal}
						onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
						onNext={() => setCurrentPage((p) => p + 1)}
					/>
					<Table className="min-w-full">
						<TableHead>
							<TableRow>
								<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
									Name
								</TableCell>
								<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
									Contact info
								</TableCell>
								<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
									Role
								</TableCell>
								<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
									Dismissed
								</TableCell>
								<TableCell className="w-12 p-4"></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{visibleFlatEmployees.map((employee) => (
								<TableRow key={employee.id}>
									<TableCell className="p-4">
										<div>
											<div className="font-semibold text-base pb-1 text-[var(--color-neutral-secondary)]">
												{employee.name}
											</div>
											<div className="text-sm text-[var(--color-stroke-brand)]">
												{employee.empId} | Joined{" "}
												{employee.joinDate} |{" "}
												{employee.location}
											</div>
										</div>
									</TableCell>
									<TableCell className="p-4">
										<div>
											<div className="text-[var(--color-neutral-secondary)] pb-1 text-base font-semibold">
												{employee.phone}
											</div>
											<div className="text-sm text-[var(--color-stroke-brand)]">
												{employee.email}
											</div>
										</div>
									</TableCell>
									<TableCell className="p-4">
										<CustomTooltip
											title={
												<div>
													<div className="text-[var(--color-stroke-brand)] text-sm">
														{getPermissionsCount(
															employee,
														)}{" "}
														permissions
													</div>
													<div
														className="text-[var(--info-panel-view-bg)] text-sm font-semibold cursor-pointer hover:underline"
														onClick={(e) => {
															e.stopPropagation();
															handleViewDetails(
																employee,
															);
														}}
													>
														<i>
															View details
															&gt;&gt;
														</i>
													</div>
												</div>
											}
											placement="bottom"
											arrowPosition="left"
										>
											<Badge
												color="gray"
												className="!rounded-full hover:bg-[var(--color-admin-profile-border)] hover:border hover:border-[var(--info-panel-view-bg)] transition-all duration-200"
											>
												{employee.role}
											</Badge>
										</CustomTooltip>
									</TableCell>
									<TableCell className="p-4 text-[var(--color-neutral-secondary)] text-base">
										<BoxCountBadge
											asText
											tooltipSide="bottom"
											tooltipAlign="end"
											tooltipContent={
												<div className="space-y-2">
													<div className="text-[var(--color-stroke-brand)] text-xs text-right">
														Dismissed by You
													</div>
													<div className="text-[var(--color-stroke-brand)] text-xs text-right">
														Added on{" "}
														{employee.joinDate}{" "}
														(You)
													</div>
												</div>
											}
										>
											<span className="cursor-default hover:underline">
												{employee.dismissed}
											</span>
										</BoxCountBadge>
									</TableCell>
									<TableCell className="p-4">
										<button
											ref={(el) =>
												(buttonRefs.current[
													employee.id
												] = el)
											}
											onClick={() =>
												setMenuOpen(
													menuOpen === employee.id
														? null
														: employee.id,
												)
											}
											className={`p-2 hover:bg-[var(--color-neutral-secondary-bg)] rounded-lg ${
												menuOpen === employee.id
													? "bg-[var(--color-neutral-secondary-bg)] shadow-[0_0_0_2px_var(--color-shadow-actionmenu)] rounded-lg"
													: ""
											}`}
										>
											<BsThreeDotsVertical className="w-5 h-5 text-[var(--color-stroke-brand)]" />
										</button>
										<DropdownPortal
											targetRef={
												buttonRefs.current[employee.id]
													? {
															current:
																buttonRefs
																	.current[
																	employee.id
																],
														}
													: null
											}
											open={menuOpen === employee.id}
											onClose={() => setMenuOpen(null)}
										>
											<div className="absolute w-52 bg-white border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] rounded-lg shadow-[4px_4px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)] z-50">
												{canViewEmployeeLogs && (
													<Link
														href={`/employees/dismissedlogs?id=${employee.id}`}
														className="block"
													>
														<button
															className="flex items-center w-full px-4 py-3 text-sm text-[var(--color-neutral-secondary)]"
															onClick={() =>
																setMenuOpen(
																	null,
																)
															}
														>
															<Icon
																name="note"
																className="mr-2 w-5 h-5 text-[var(--color-neutral-light)]"
															/>{" "}
															View logs
														</button>
													</Link>
												)}
											</div>
										</DropdownPortal>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{filteredEmployees.length === 0 && !loading ? (
						<div className="text-center py-12 text-[var(--color-stroke-brand)]">
							No dismissed employees found.
						</div>
					) : null}
				</div>
			)}
			<ExportListModal
				open={exportListModal}
				onClose={() => setExportListModal(false)}
				onConfirm={handleExportConfirm}
				options={exportOptions}
				title="Customise your export"
				description="Select the scope, and details you'd like to include in the export file."
			/>
			<RolePermissionsModal
				open={rolePermissionsModal}
				onClose={() => {
					setRolePermissionsModal(false);
					setSelectedRoleForPermissions(null);
				}}
				roleData={
					selectedRoleForPermissions
						? { role: selectedRoleForPermissions }
						: {}
				}
			/>
		</div>
	);
};

export default DismissEmployees;
