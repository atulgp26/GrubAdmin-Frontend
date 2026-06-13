"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
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
import BoxCountBadge from "@/components/ui/BoxCountBadge";
import Modal from "@/components/ui/Modal";
import Icon from "@/components/ui/Icon";
import CheckBox from "@/components/ui/CheckBox";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import TableActionBar from "@/components/ui/TableActionBar";
import ReassignRoleModal from "@/components/pages/employees/ReassignRoleModal";
import DropdownPortal from "@/components/ui/DropdownPortal";
import EmployeeRowMenu from "@/components/pages/employees/EmployeeRowMenu";
import ReassignConfirmModal from "@/components/pages/employees/ReassignConfirmModal";
import RolePermissionsModal from "@/components/pages/employees/RolePermissionsModal";
import Link from "next/link";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import ExportListModal from "@/components/pages/employees/ExportListModal";
import SuspendEmployeeModal from "@/components/pages/employees/SuspendEmployeeModal";
import { showSuccess, showError } from "@/components/ui/toast";
import DeleteEmployeeModal from "@/components/pages/employees/DeleteEmployeeModal";
import EditEmployeeModal from "@/components/pages/employees/EditEmployeeModal";
import AddNewEmployee from "@/components/pages/employees/AddNewEmployee";
import CustomTooltip from "@/components/ui/CustomTooltip";
import { employeeService } from "@/api/services/employeeService";
import { roleService } from "@/api/services/roleService";
import { useEmployees } from "@/hooks/useEmployees";
import LoadingDetails from "@/components/ui/LoadingDetails";
import { usePermissions } from "@/context/PermissionContext";

const EmployeesList = () => {
	const { can } = usePermissions();
	const canViewActive =
		can("view active employees", "employees") ||
		can("view active employees");
	const canViewSuspended =
		can("view suspended employees", "employees") ||
		can("view suspended employees");
	const canAddEmployees =
		can("add employees", "employees") || can("add employees");
	const canExportEmployees =
		can("export employees", "employees") || can("export employees");
	const canSuspendEmployees =
		can("suspend employees", "employees") || can("suspend employees");
	const canDeleteEmployees =
		can("delete employees", "employees") || can("delete employees");
	const canViewRoles = can("view roles", "roles") || can("view roles");
	const canViewDismissed =
		can("view dismissed employees", "employees") ||
		can("view dismissed employees");
	const hasAnyActions =
		canAddEmployees ||
		canViewRoles ||
		canViewDismissed ||
		canExportEmployees;
	// For actions
	const actionOptions = [
		{
			group: "Dashboard",
			title: "Dashboard",
			items: [
				{
					id: "viewdashboard",
					label: "View dashboard",
					type: "checkbox",
					disabled: true,
				},
				{
					id: "exportdashboard",
					label: "Export dashboard",
					type: "checkbox",
					disabled: true,
				},
			],
		},
		{
			group: "details",
			title: "Employees",
			items: [
				{
					id: "activeemployees",
					label: "View active employees",
					type: "checkbox",
					disabled: true,
				},
				{
					id: "employeeLogs",
					label: "View employee logs",
					type: "checkbox",
					disabled: true,
				},
				{
					id: "suspendedemployees",
					label: "View suspended employees",
					type: "checkbox",
					disabled: true,
				},
				{
					id: "dismissedemployees",
					label: "View dismissed employees",
					type: "checkbox",
					disabled: true,
				},
				{
					id: "addemployees",
					label: "Add employees",
					type: "checkbox",
					disabled: true,
				},
				{
					id: "editemployees",
					label: "Edit employees",
					type: "checkbox",
					disabled: true,
				},
				{
					id: "deleteemployees",
					label: "Delete employees",
					type: "checkbox",
					disabled: true,
				},
				{
					id: "suspendemployees",
					label: "Suspend employees",
					type: "checkbox",
					disabled: true,
				},
			],
		},
	];

	// For export
	const exportOptions = [
		{
			group: "scope",
			title: "Scope",
			items: [
				{ id: "employees", label: "All employees", type: "radio" },
				{
					id: "filteredList",
					label: "As per the filtered list",
					type: "radio",
				},
				{ id: "onlyActive", label: "Only active", type: "radio" },
				{ id: "onlySuspended", label: "Only suspended", type: "radio" },
				{ id: "onlyDismissed", label: "Only dismissed", type: "radio" },
			],
		},
		{
			group: "details",
			title: "Extra details",
			items: [
				{
					id: "rolesPermission",
					label: "Roles & permission",
					type: "checkbox",
				},
				{
					id: "activityLogs",
					label: "Activity logs",
					type: "checkbox",
				},
			],
		},
	];

	const midLevelData = [
		{ id: "delivery", label: "Delivery" },
		{ id: "hospitality", label: "Hospitality" },
		{ id: "medical", label: "Medical" },
		{ id: "camping", label: "Camping" },
	];

	const [searchValue, setSearchValue] = useState("");
	const [selectedRole, setSelectedRole] = useState([]);
	const [groupByRole, setGroupByRole] = useState(false);
	const [selectedEmployees, setSelectedEmployees] = useState(new Set());
	const [selectAll, setSelectAll] = useState(false);
	const [openGroupIndex, setOpenGroupIndex] = useState(null);
	const [isActionModalOpen, setIsActionModalOpen] = useState(false);
	const [openReassignModal, setOpenReassignModal] = useState(false);
	const [menuOpen, setMenuOpen] = useState(null);
	const [reassignConfirmModal, setReassignConfirmModal] = useState(false);
	const [exportListModal, setExportListModal] = useState(false);
	const [options, setOptions] = useState([]);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [suspendEmployeeModal, setSuspendEmployeeModal] = useState("");
	const [deleteEmployeeModal, setDeleteEmployeeModal] = useState(false);
	const [editEmployeeModal, setEditEmployeeModal] = useState(false);
	const [addNewEmployeeModal, setAddNewEmployeeModal] = useState(false);
	const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] =
		useState(null);
	const buttonRefs = useRef({});
	const [footer, setFooter] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;
	// Removed rolesMap - not needed since admin.role.name is always available from API
	const [selectedRoleForReassign, setSelectedRoleForReassign] =
		useState(null); // Store selected role from ReassignRoleModal
	const [rolePermissionsModal, setRolePermissionsModal] = useState(false);
	const [selectedRoleForPermissions, setSelectedRoleForPermissions] =
		useState(null);

	// Removed fetchRoles useEffect - rolesMap not needed since admin.role.name is always available
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
		} catch (error) {
			return "";
		}
	};

	// Store selected employee data to preserve it during API calls
	const [preservedEmployee, setPreservedEmployee] = useState(null);
	// Track selected employee ID from suggestion click
	const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

	const { status, employees: rawEmployees, totalCount, error, refetch, isLoading, isError } = useEmployees({
		searchValue,
		selectedRole,
		filterStatus,
		currentPage,
		pageSize,
		selectedEmployeeId,
	});

	const employees = useMemo(() => {
		if (!rawEmployees || rawEmployees.length === 0) return [];
		return rawEmployees.map((admin, index) => {
			const firstName = admin.first_name || "";
			const lastName = admin.last_name || "";
			const fullName =
				[firstName, lastName].filter(Boolean).join(" ") ||
				"Unnamed Employee";

			let phoneFormatted = "";
			if (admin.mobile_number && admin.country_code) {
				phoneFormatted = `${admin.country_code} ${admin.mobile_number}`;
			} else if (admin.mobile_number) {
				phoneFormatted = admin.mobile_number;
			}

			let roleName = "No role";
			if (
				admin.role &&
				typeof admin.role === "object" &&
				admin.role.name
			) {
				roleName = admin.role.name;
			}

			return {
				id: admin.id || `emp-${index}`,
				name: fullName,
				empId: admin.employee_id
					? `#${admin.employee_id}`
					: `#${admin.id?.slice(-8) || `EMP${index}`}`,
				joinDate: formatJoiningDate(admin.joining_date),
				addedDate: admin.created_at
					? formatJoiningDate(admin.created_at)
					: admin.joining_date
						? formatJoiningDate(admin.joining_date)
						: "Unknown",
				location: admin.location || "Not specified",
				phone: phoneFormatted || "Not provided",
				email: admin.email || "Not provided",
				role: roleName,
				updated: formatDate(admin.updated_at),
				originalData: admin,
			};
		});
	}, [rawEmployees]);

	// Clear selections on page change
	useEffect(() => {
		setSelectedEmployees(new Set());
		setSelectAll(false);
	}, [currentPage]);

	// Removed rolesMap useEffect - it was causing re-renders and blocking
	// Employees already get roles from admin.role.name in fetchEmployees
	// rolesMap is only used as fallback, and admin.role.name is always available

	const [roleOptions, setRoleOptions] = useState([]);

	useEffect(() => {
		// Only fetch on client side
		if (typeof window === "undefined") return;

		const fetchRoleOptions = async () => {
			try {
				const response = await roleService.getRoles();
				if (
					response.success &&
					response.code === 200 &&
					response.data?.roles
				) {
					// De-duplicate by role id while preserving API order
					const seen = new Set();
					const options = [];
					response.data.roles.forEach((role) => {
						const roleId = role.id;
						if (!seen.has(roleId)) {
							seen.add(roleId);
							options.push({ id: roleId, label: role.name });
						}
					});
					setRoleOptions(options);
				}
			} catch (error) {
				console.error("Error fetching roles for filter:", error);
			}
		};
		fetchRoleOptions();
	}, []);

	const calculateReassignRoles = () => {
		if (!selectedRoleForReassign) return [];

		const rolesData = [];

		const roleGroups = {};
		selectedEmployees.forEach((employeeId) => {
			const employee = employees.find((emp) => emp.id === employeeId);
			if (employee) {
				const currentRoleName = employee.role || "No role";
				if (!roleGroups[currentRoleName]) {
					roleGroups[currentRoleName] = [];
				}
				roleGroups[currentRoleName].push(employee);
			}
		});

		Object.keys(roleGroups).forEach((roleName) => {
			const count = roleGroups[roleName].length;
			const roleId = roleGroups[roleName][0]?.originalData?.role_id;
			// Permissions count - using placeholder since rolesMap removed
			const permissions = 0;
			rolesData.push({
				name: roleName,
				count: count,
				permissions: permissions,
				type: "old",
			});
		});

		rolesData.push({
			name: selectedRoleForReassign.name,
			count: selectedEmployees.size,
			permissions: selectedRoleForReassign.permissionsCount || 0,
			type: "new",
		});

		return rolesData;
	};

	const reassignRoles = calculateReassignRoles();

	// Filter employees based on search (client-side for suggestions only; API handles server-side filtering)
	// For display, use employees directly since API already filters and paginates
	const filteredEmployees = employees.filter((employee) => {
		// If a specific employee was selected from suggestions, prioritize showing that employee
		if (selectedEmployeeId) {
			return employee.id === selectedEmployeeId;
		}

		// Role filter first (client-side fallback, but API should handle this)
		if (selectedRole.length > 0) {
			const employeeRoleId = employee.originalData?.role_id;
			// Normalize types to avoid number/string mismatch
			const selectedSet = new Set(
				(selectedRole || []).map((id) => String(id)),
			);
			if (!selectedSet.has(String(employeeRoleId))) return false;
		}

		// Search filter (client-side fallback for instant feedback, but API should handle this)
		if (!searchValue || typeof searchValue !== "string") return true;
		const searchLower = searchValue.toLowerCase().trim();
		const employeeNameLower = (employee.name || "").toLowerCase().trim();
		const employeeEmailLower = (employee.email || "").toLowerCase().trim();

		// Exact match first (for when suggestion is clicked)
		if (
			employeeNameLower === searchLower ||
			employeeEmailLower === searchLower
		) {
			return true;
		}

		// Partial match for other fields
		return (
			employeeNameLower.includes(searchLower) ||
			employeeEmailLower.includes(searchLower) ||
			(employee.empId || "").toLowerCase().includes(searchLower) ||
			(employee.phone || "").toLowerCase().includes(searchLower) ||
			(employee.role || "").toLowerCase().includes(searchLower) ||
			(employee.location || "").toLowerCase().includes(searchLower)
		);
	});

	// Reset pagination when filters/search/grouping change
	useEffect(() => {
		setCurrentPage(1);
		// Clear selected employee ID when search changes manually (not from suggestion click)
		if (!searchValue || searchValue.trim() === "") {
			setSelectedEmployeeId(null);
			setPreservedEmployee(null);
		}
	}, [searchValue, selectedRole, filterStatus, groupByRole]);

	// Clear preserved employee if it's found in the current employees list
	useEffect(() => {
		if (preservedEmployee && selectedEmployeeId && employees.length > 0) {
			const found = employees.find(
				(emp) => emp.id === selectedEmployeeId,
			);
			if (found) {
				// Employee found in current list, clear preserved employee after a short delay
				// This allows the user to see the result
				const timer = setTimeout(() => {
					setPreservedEmployee(null);
				}, 1000);
				return () => clearTimeout(timer);
			}
		}
	}, [employees, selectedEmployeeId, preservedEmployee]);

	// If we have a preserved employee that's not in employees list, add it for display
	const employeesWithPreserved =
		preservedEmployee &&
			selectedEmployeeId &&
			!employees.find((emp) => emp.id === selectedEmployeeId)
			? [preservedEmployee, ...employees]
			: employees;

	// Re-filter with preserved employee included
	const filteredEmployeesWithPreserved = employeesWithPreserved.filter(
		(employee) => {
			// If a specific employee was selected from suggestions, prioritize showing that employee
			if (selectedEmployeeId) {
				return employee.id === selectedEmployeeId;
			}

			// Role filter first (client-side fallback, but API should handle this)
			if (selectedRole.length > 0) {
				const employeeRoleId = employee.originalData?.role_id;
				// Normalize types to avoid number/string mismatch
				const selectedSet = new Set(
					(selectedRole || []).map((id) => String(id)),
				);
				if (!selectedSet.has(String(employeeRoleId))) return false;
			}

			// Search filter (client-side fallback for instant feedback, but API should handle this)
			if (!searchValue || typeof searchValue !== "string") return true;
			const searchLower = searchValue.toLowerCase().trim();
			const employeeNameLower = (employee.name || "")
				.toLowerCase()
				.trim();
			const employeeEmailLower = (employee.email || "")
				.toLowerCase()
				.trim();

			// Exact match first (for when suggestion is clicked)
			if (
				employeeNameLower === searchLower ||
				employeeEmailLower === searchLower
			) {
				return true;
			}

			// Partial match for other fields
			return (
				employeeNameLower.includes(searchLower) ||
				employeeEmailLower.includes(searchLower) ||
				(employee.empId || "").toLowerCase().includes(searchLower) ||
				(employee.phone || "").toLowerCase().includes(searchLower) ||
				(employee.role || "").toLowerCase().includes(searchLower) ||
				(employee.location || "").toLowerCase().includes(searchLower)
			);
		},
	);

	// Pagination view (flat list) - Use filtered employees when search is active
	// When search is active, use client-side filtering to show exact matches
	// When no search, use API results directly (server-side pagination)
	const visibleFlatEmployees =
		searchValue && searchValue.trim()
			? filteredEmployeesWithPreserved // Use client-side filtered results when searching (includes preserved employee)
			: employees; // Use API results directly when no search
	const totalItems =
		searchValue && searchValue.trim()
			? filteredEmployeesWithPreserved.length // Use filtered count when searching (includes preserved employee)
			: totalCount; // Use server-side total count from API when no search
	const pageEmployeeIds = visibleFlatEmployees.map((emp) => emp.id);
	const allPageSelected =
		pageEmployeeIds.length > 0 &&
		pageEmployeeIds.every((id) => selectedEmployees.has(id));
	const somePageSelected = pageEmployeeIds.some((id) =>
		selectedEmployees.has(id),
	);

	const handleRowAction = (action, employeeId) => {
		console.log("Action selected:", action, "Employee ID:", employeeId);
		switch (action) {
			case "edit":
				const employee = employees.find((emp) => emp.id === employeeId);
				setSelectedEmployeeForEdit(employee);
				setEditEmployeeModal(true);
				break;
			case "reassign":
				setSelectedEmployees(new Set([employeeId]));
				setOpenReassignModal(true);
				break;
			case "suspend":
				setSelectedEmployees(new Set([employeeId]));
				setSuspendEmployeeModal(true);
				break;
			case "delete":
				setSelectedEmployees(new Set([employeeId]));
				setDeleteEmployeeModal(true);
				break;
			default:
				break;
		}
	};

	const handleSelectAll = (checked, subset = filteredEmployees) => {
		setSelectAll(checked);
		if (checked) {
			setSelectedEmployees(new Set(subset.map((emp) => emp.id)));
		} else {
			setSelectedEmployees(new Set());
		}
	};
	const handleReassignConfirm = (selectedRole) => {
		setSelectedRoleForReassign(selectedRole);
		setOpenReassignModal(false);
		setReassignConfirmModal(true);
	};
	const handleSuspend = async () => {
		try {
			// Collect all selected employees for suspension
			const adminIds =
				selectedEmployees.size > 0
					? Array.from(selectedEmployees)
					: filteredEmployees.map((e) => e.id);

			if (adminIds.length === 0) {
				setSuspendEmployeeModal(false);
				showError("No employees selected for suspension.");
				return;
			}

			const count = adminIds.length;
			console.log("Suspending employees - Count:", count);
			console.log("Suspending employees - IDs:", adminIds);
			console.log("API payload will be:", { admins: adminIds });

			const response = await employeeService.suspendAdmin(adminIds);
			console.log("Suspend API response:", response);

			if (response.success && response.code === 200) {
				if (count === 1) {
					const empName = employees.find(e => String(e.id) === String(adminIds[0]))?.name || "Employee";
					showSuccess("Success!", `${empName}'s account has been suspended.`, false, "#");
				} else {
					showSuccess("Success!", `${count} employees have been suspended.`, false, "#");
				}
				setSuspendEmployeeModal(false);
				setSelectedEmployees(new Set());
				setSelectAll(false);

				// Small delay to ensure backend has processed the status change
				await new Promise((resolve) => setTimeout(resolve, 500));

				// Refresh the employees list to remove suspended employees
				await refetch();
			} else {
				const errorMsg =
					response.error ||
					response.message ||
					"Failed to suspend employee(s). Please try again.";
				showError(errorMsg);
			}
		} catch (error) {
			console.error("Error suspending employees:", error);

			if (error.response?.data?.message) {
				showError(error.response.data.message);
			} else if (error.response?.data?.error) {
				showError(error.response.data.error);
			} else {
				showError("Failed to suspend employee(s). Please try again.");
			}
		}
	};
	const handleDelete = async () => {
		try {
			const adminIds = Array.from(selectedEmployees);
			if (adminIds.length === 0) {
				showError("Please select employees to delete.");
				return;
			}
			const res = await employeeService.deleteAdmins({ adminIds });
			if (res?.success && res.code === 200) {
				const count = adminIds.length;
				if (count === 1) {
					const empName = employees.find(e => String(e.id) === String(adminIds[0]))?.name || "Employee";
					showSuccess("Success!", `${empName}'s account has been deleted.`, false, "#");
				} else {
					showSuccess("Success!", `${count} employees have been deleted.`, false, "#");
				}
				setDeleteEmployeeModal(false);
				setSelectedEmployees(new Set());
				setSelectAll(false);
				await refetch();
			} else {
				const errorMsg =
					res?.error || res?.message || "Failed to delete employees.";
				showError(errorMsg);
			}
		} catch (e) {
			showError("Failed to delete employees. Please try again.");
		}
	};
	const getPermissionsCount = (employee) => {
		if (!employee?.originalData?.role?.permissions_json) return 0;
		const permissionsJson = employee.originalData.role.permissions_json;
		let totalCount = 0;
		Object.keys(permissionsJson).forEach((sectionKey) => {
			const permissionList = permissionsJson[sectionKey];
			if (Array.isArray(permissionList)) {
				totalCount += permissionList.length;
			}
		});
		return totalCount;
	};

	const handleViewDetails = (employee) => {
		if (employee && employee.originalData && employee.originalData.role) {
			setSelectedRoleForPermissions(employee.originalData.role);
			setRolePermissionsModal(true);
		}
	};

	const handleTakeAction = () => {
		setTitle("Customise your export");
		setDescription(
			"Select the scope, and details you'd like to include in the export file.",
		);
		setOptions(exportOptions);
		setExportListModal(true);
	};

	const handleExportConfirm = async ({ scope, checked }) => {
		try {
			setExportListModal(false);

			const params = {};

			if (scope === "employees" || !scope) {
				params.fetch_all = true;
			} else if (scope === "filteredList") {
				params.fetch_all = false;
				if (searchValue && searchValue.trim()) {
					params.query = searchValue.trim();
				}
				if (selectedRole.length > 0) {
					params.role = selectedRole; // multiple roles
				}
			} else if (scope === "onlyActive") {
				params.status = "active";
				params.fetch_all = true;
			} else if (scope === "onlySuspended") {
				params.status = "suspended";
				params.fetch_all = true;
			} else if (scope === "onlyDismissed") {
				params.status = "dismissed";
				params.fetch_all = true;
			}

			if (checked["rolesPermission"]) {
				params.include_roles = true;
			}
			if (checked["activityLogs"]) {
				params.include_activity_logs = true;
			}

			console.log("Export Employees with params:", params);

			const response = await employeeService.exportAdmins(params);

			console.log("Export response received:", response);

			if (response && typeof response === "object" && response.blob) {
				const blob = response.blob;
				const filename =
					response.filename ||
					`employees_export_${new Date().toISOString().split("T")[0]}.csv`;

				console.log(
					"Export blob - size:",
					blob.size,
					"type:",
					blob.type,
				);
				console.log("Export filename:", filename);

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

				console.log("Download link clicked for:", finalFilename);

				setTimeout(() => {
					window.URL.revokeObjectURL(url);
					if (document.body.contains(link)) {
						document.body.removeChild(link);
					}
				}, 100);

				showSuccess("Success!", "CSV file downloaded successfully.");
			} else {
				console.error("Invalid export response:", response);
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

	const handleAddNewEmployee = () => {
		setAddNewEmployeeModal(true);
	};

	const handleAddEmployeeConfirm = async (formData) => {
		try {
			setAddNewEmployeeModal(false);
			// Refresh list to include the newly added employee
			await refetch();
		} catch (_) {
			// no-op
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
		setSelectAll(newSelected.size === employees.length);
	};
	const onReassign = () => {
		setOpenReassignModal(true);
	};
	const handleConfirmChanges = async () => {
		if (!selectedRoleForReassign || selectedEmployees.size === 0) {
			showError("Please select a role and employees.");
			return;
		}

		try {
			const adminIds = Array.from(selectedEmployees);

			const response = await employeeService.bulkAssignRole(
				selectedRoleForReassign.id,
				adminIds,
			);

			if (response.success && response.code === 200) {
				const roleName = selectedRoleForReassign.name;
				const count = selectedEmployees.size;

				setReassignConfirmModal(false);
				setOpenReassignModal(false);

				if (count === 1) {
					const empName = employees.find(e => String(e.id) === String(adminIds[0]))?.name || "Employee";
					showSuccess("Success!", `Roles updated: ${empName} now assigned as ${roleName}.`, false, "#");
				} else {
					showSuccess("Success!", `Roles updated: ${count} employees now assigned as ${roleName}.`, false, "#");
				}

				setSelectedEmployees(new Set());
				setSelectAll(false);
				setSelectedRoleForReassign(null);

				await refetch();
			} else {
				const errorMsg =
					response.error ||
					response.message ||
					"Failed to assign role. Please try again.";
				showError(errorMsg);
			}
		} catch (error) {
			console.error("Error assigning role:", error);
			showError("Failed to assign role. Please try again.");
		}
	};

	const handleEditConfirm = async (updatedEmployeeData) => {
		if (!selectedEmployeeForEdit || !selectedEmployeeForEdit.originalData) {
			showError("Employee data not found. Please try again.");
			return;
		}

		try {
			const originalAdmin = selectedEmployeeForEdit.originalData;
			const adminId = originalAdmin.id;

			if (!adminId) {
				showError("Employee ID not found. Please try again.");
				return;
			}

			const nameParts = updatedEmployeeData.name
				? updatedEmployeeData.name.split(" ").filter((p) => p.trim())
				: [];
			const firstName = nameParts[0] || "";
			const lastName = nameParts.slice(1).join(" ") || "";

			if (!firstName || firstName.trim().length === 0) {
				showError("Please fill the First name field.");
				return;
			}
			if (!lastName || lastName.trim().length === 0) {
				showError("Please fill the Last name field.");
				return;
			}
			if (
				!updatedEmployeeData.email ||
				updatedEmployeeData.email.trim().length === 0
			) {
				showError("Please fill the Email field.");
				return;
			}

			let countryCode = originalAdmin.country_code || "+91";
			let mobileNumber = originalAdmin.mobile_number || "";

			if (
				updatedEmployeeData.phone &&
				updatedEmployeeData.phone !== selectedEmployeeForEdit.phone
			) {
				const phoneStr = updatedEmployeeData.phone.trim();

				if (phoneStr.startsWith("+91")) {
					countryCode = "+91";
					mobileNumber = phoneStr.substring(3).replace(/\D/g, "");
				} else if (phoneStr.startsWith("91") && phoneStr.length > 2) {
					countryCode = "+91";
					mobileNumber = phoneStr.substring(2).replace(/\D/g, "");
				} else {
					const phoneMatch = phoneStr.match(/^(\+?\d{1,3})\s*(.+)$/);
					if (phoneMatch) {
						countryCode = phoneMatch[1].startsWith("+")
							? phoneMatch[1]
							: `+${phoneMatch[1]}`;
						mobileNumber = phoneMatch[2]
							.replace(/\s/g, "")
							.replace(/\D/g, "");
					} else {
						countryCode = "+91";
						mobileNumber = phoneStr.replace(/\D/g, "");
					}
				}
			}

			let roleId = originalAdmin.role_id;

			if (updatedEmployeeData.role_id) {
				roleId = updatedEmployeeData.role_id;
			} else if (
				updatedEmployeeData.role &&
				updatedEmployeeData.role !== selectedEmployeeForEdit.role
			) {
				const roleName = updatedEmployeeData.role;
				// Find role from roleOptions instead of rolesMap
				const roleOption = roleOptions.find(
					(ro) => ro.label === roleName,
				);
				if (roleOption) {
					roleId = roleOption.id;
				} else {
					console.warn(
						`Role "${roleName}" not found. Keeping existing role_id: ${roleId}`,
					);
				}
			}

			let joiningDateISO = originalAdmin.joining_date;
			if (
				updatedEmployeeData.joinDate &&
				updatedEmployeeData.joinDate !==
				selectedEmployeeForEdit.joinDate
			) {
				const dateStr = updatedEmployeeData.joinDate;
				if (dateStr.includes("T") || dateStr.includes("Z")) {
					joiningDateISO = dateStr;
				} else {
					const parsedDate = new Date(dateStr);
					if (!isNaN(parsedDate.getTime())) {
						joiningDateISO = parsedDate.toISOString();
					}
				}
			}

			const payload = {
				id: adminId,
				email: updatedEmployeeData.email || originalAdmin.email,
				first_name: firstName,
				last_name: lastName,
			};

			const updatedEmployeeId = updatedEmployeeData.employee_id
				? updatedEmployeeData.employee_id.replace(/^#\s*/, "")
				: originalAdmin.employee_id;

			if (updatedEmployeeId) {
				payload.employee_id = updatedEmployeeId;
			}

			if (updatedEmployeeData.location !== undefined) {
				payload.location =
					updatedEmployeeData.location ||
					originalAdmin.location ||
					"";
			}

			if (joiningDateISO) {
				payload.joining_date = joiningDateISO;
			}

			if (roleId) {
				payload.role = roleId;
			}

			if (mobileNumber) {
				payload.mobile_number = mobileNumber;
				payload.country_code = countryCode;
			}

			console.log("Updating employee with payload:", payload);

			const response = await employeeService.updateAdmin(payload);

			console.log("Update employee response:", response);

			if (response.success && response.code === 200) {
				const fullName =
					updatedEmployeeData.name ||
					`${originalAdmin.first_name} ${originalAdmin.last_name}`.trim();
				showSuccess(
					"Success!",
					`${fullName || "Employee"}'s details updated successfully.`,
					false,
					"#"
				);

				setEditEmployeeModal(false);
				setSelectedEmployeeForEdit(null);

				await refetch();
			} else {
				const errorMsg =
					response.error ||
					response.message ||
					"Failed to update employee. Please try again.";
				showError(errorMsg);
			}
		} catch (error) {
			console.error("Error updating employee:", error);

			let errorMessage = "Failed to update employee. Please try again.";

			if (error.response?.data) {
				const errorData = error.response.data;

				if (errorData.errors) {
					const fieldErrors = Object.keys(errorData.errors).map(
						(field) => {
							const fieldName = field
								.replace(/_/g, " ")
								.replace(/\b\w/g, (l) => l.toUpperCase());
							return `${fieldName}: ${Array.isArray(errorData.errors[field]) ? errorData.errors[field][0] : errorData.errors[field]}`;
						},
					);
					if (fieldErrors.length > 0) {
						errorMessage = fieldErrors.join(". ");
					}
				} else if (errorData.message) {
					errorMessage = errorData.message;

					if (
						errorMessage.toLowerCase().includes("last_name") ||
						errorMessage.toLowerCase().includes("last name")
					) {
						errorMessage = "Please fill the Last name field.";
					} else if (
						errorMessage.toLowerCase().includes("first_name") ||
						errorMessage.toLowerCase().includes("first name")
					) {
						errorMessage = "Please fill the First name field.";
					} else if (errorMessage.toLowerCase().includes("email")) {
						errorMessage = "Please provide a valid Email address.";
					}
				} else if (errorData.error) {
					errorMessage = errorData.error;

					if (
						errorMessage.toLowerCase().includes("last_name") ||
						errorMessage.toLowerCase().includes("last name")
					) {
						errorMessage = "Please fill the Last name field.";
					} else if (
						errorMessage.toLowerCase().includes("first_name") ||
						errorMessage.toLowerCase().includes("first name")
					) {
						errorMessage = "Please fill the First name field.";
					} else if (errorMessage.toLowerCase().includes("email")) {
						errorMessage = "Please provide a valid Email address.";
					}
				}
			} else if (error.message) {
				if (
					error.message.includes("400") ||
					error.message.includes("Bad Request")
				) {
					errorMessage = "Please fill all required fields correctly.";
				} else {
					errorMessage = error.message;
				}
			}

			showError(errorMessage);
		}
	};
	const groupEmployeesByRole = () => {
		// Build groups strictly from API roles by id (supports duplicate role names)
		const groups = [];

		const pushGroup = (roleLabel, roleId) => {
			const roleEmployees = employees.filter((emp) => {
				const rid =
					emp?.originalData?.role?.id || emp?.originalData?.role_id;
				return String(rid) === String(roleId);
			});

			if (roleEmployees.length === 0) return;
			const permissionsCount =
				roleEmployees.length > 0 &&
					roleEmployees[0]?.originalData?.role?.permissions_json
					? (() => {
						const permissionsJson =

							roleEmployees[0].originalData.role.permissions_json;

						let totalCount = 0;
						Object.keys(permissionsJson).forEach((sectionKey) => {
							const permissionList = permissionsJson[sectionKey];
							if (Array.isArray(permissionList)) {
								totalCount += permissionList.length;
							}
						});
						return totalCount;
					})()

					: 0;

			groups.push({
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
						placement="left"
						arrowPosition="left"
					>
						<span className="cursor-default hover:underline text-[var(--color-stroke-brand)] font-medium text-sm">
							{String(roleLabel || "").toUpperCase()}
						</span>
					</CustomTooltip>
				),
				items: roleEmployees,
			});
		};

		// Push groups in API order; include duplicates by id even if labels repeat
		roleOptions.forEach(({ id, label }) => pushGroup(label, id));

		return groups;
	};

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
							<TableCell className="w-12 p-4">
								<TableCheckbox
									checked={allGroupSelected}
									onChange={(e) =>
										handleGroupSelectAll(e.target.checked)
									}
									indeterminate={
										someGroupSelected && !allGroupSelected
									}
								/>
							</TableCell>
							<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
								Name
							</TableCell>
							<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
								Contact info
							</TableCell>
							<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
								Updated
							</TableCell>
							<TableCell className="w-12 p-4"></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{group.items.map((employee) => (
							<TableRow key={employee.id}>
								<TableCell className="w-12 p-4">
									<TableCheckbox
										checked={selectedEmployees.has(
											employee.id,
										)}
										onChange={(e) =>
											handleSelectEmployee(
												employee.id,
												e.target.checked,
											)
										}
									/>
								</TableCell>
								<TableCell className="p-4">
									<div>
										<Link
											href={`/employees/activelogs?id=${encodeURIComponent(employee.id)}&name=${encodeURIComponent(employee.name)}`}
											className="font-semibold pb-1 text-base text-[var(--color-neutral-secondary)] hover:underline"
										>
											{employee.name}
										</Link>
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
										tooltipSide="left"
										tooltipAlign="end"
										tooltipAlignOffset={2}
										tooltipContent={
											<div className="space-y-2">
			<div className="text-[var(--color-stroke-brand)] text-xs text-right">
  Last updated by You
</div>
<div className="text-[var(--color-stroke-brand)] text-xs text-right">
  Added on {employee.joinDate}
</div>
											</div>
										}
									>
										<span className="cursor-default hover:underline">
											{employee.updated}
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
										<EmployeeRowMenu
											open={menuOpen === employee.id}
											onClose={() => setMenuOpen(null)}
											onRowAction={(action) =>
												handleRowAction(
													action,
													employee.id,
												)
											}
											employeeId={employee.id}
										/>
									</DropdownPortal>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	};

	if (!canViewActive) return null;

	return (
	<div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
			<div className="flex items-center justify-between mb-6 flex-shrink-0">
				<h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
					Employees
				</h1>
				<div className="flex items-center gap-8 relative">
					{canViewSuspended && (
						<Link
							href="/employees/suspended"
							className="flex items-center px-3 py-2 rounded-lg text-[var(--color-stroke-brand)] font-medium text-base  hover:underline group border-none text-[var(--color-stroke-brand)] hover:bg-[var(--color-neutral-secondary-bg)]  hover:text-[var(--notif-border)] active:bg-[var(--color-stroke-neutral)] active:shadow-[0_0_0_2px_var(--color-tablecheckbox-shadow)] "
						>
							VIEW SUSPENDED
						</Link>
					)}
					{hasAnyActions && (
						<button
							variant="modal"
							className={`${isActionModalOpen ? "border border-[var(--color-filter-text)] underline bg-[var(--color-filter-text)] shadow-[0px_0px_0px_2px_var(--color-shadow-select)]" : "bg-[var(--color-brand-primary-btn)] border border-[var(--info-panel-view-bg)]"} hover:border active:border hover:bg-[var(--color-filter-text)] hover:border-[var(--color-filter-text)] active:bg-[var(--color-primary-btn-active)] active:border-[var(--info-panel-view-bg)] hover:underline active:shadow-[0px_0px_0px_2px_var(--color-shadow-select)] py-2 px-3 rounded-lg text-white font-medium`}
							onClick={() =>
								setIsActionModalOpen(!isActionModalOpen)
							}
						>
							TAKE ACTION
						</button>
					)}
				</div>
			</div>

			{/* Search and Filters */}
			<div className="flex items-center justify-between mb-6 flex-shrink-0">
				<div className="flex items-center gap-4">
					<div className="w-64">
						<SearchWithSuggestions
							data={employees}
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
							onSelect={(item) => {
								// When clicking a suggestion, immediately show that employee
								// Preserve the employee data so it stays visible even if API doesn't return it
								setPreservedEmployee(item);
								setSelectedEmployeeId(item.id);
								const exactSearchTerm =
									item.name || item.email || "";
								setCurrentPage(1);
								setSearchValue(exactSearchTerm);
								// The useEffect will trigger fetchEmployees automatically
								// The preserved employee will be added to results if not found in API response
							}}
							getLabel={(item) => item.name || item.email || ""}
							getSubLabel={(item) => item.role || "Employee"}
							placeholder="Search employee"
							className="[&_input]:!h-8 [&_input]:!py-1"
							clearable={true}
							onClear={() => {
								setSearchValue("");
								setSelectedEmployeeId(null);
								setPreservedEmployee(null);
							}}
							openOnFocus={false}
							minChars={1}
						/>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<span className="text-sm text-[var(--color-stroke-brand)]">
						Showing {visibleFlatEmployees.length} of {totalItems}
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
			{isLoading ? (
  <LoadingDetails entity="employees" />
) : groupByRole ? (
  <div className="flex-1 overflow-y-auto min-h-0">
    <GroupCollapseTable
						groups={groupEmployeesByRole()}
						openIndex={openGroupIndex}
						setOpenIndex={setOpenGroupIndex}
						renderTable={renderGroupTable}
						noResultsMessage="No employees found."
						tableContainerClass="w-full"
					/>
					{selectedEmployees.size > 0 && (
						<TableActionBar
							selectedCount={selectedEmployees.size}
							onClearSelection={() => {
								setSelectedEmployees(new Set());
								setSelectAll(false);
							}}
							onReassignRole={onReassign}
							onSuspend={
								canSuspendEmployees
									? () => setSuspendEmployeeModal(true)
									: undefined
							}
							onDelete={
								canDeleteEmployees
									? () => setDeleteEmployeeModal(true)
									: undefined
							}
							allowSuspend={canSuspendEmployees}
							allowDelete={canDeleteEmployees}
							employeeList={true}
						/>
					)}
				</div>
			) : (
  <div className="flex-1 overflow-y-auto min-h-0">
    <div className="bg-[var(--color-bg-primary,white)]">
      <Pagination
						currentPage={currentPage}
						pageSize={pageSize}
						totalItems={totalItems}
						onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
						onNext={() => {
							const totalPages = Math.ceil(totalItems / pageSize);
							if (currentPage < totalPages) {
								setCurrentPage((p) => p + 1);
							}
						}}
					/>
</div>
					<Table className="min-w-full">
						<TableHead className="sticky top-0 z-10 bg-[var(--color-bg-primary,white)]">
							<TableRow>
								<TableCell className="w-12 p-4">
									<TableCheckbox
										checked={allPageSelected}
										onChange={(e) =>
											handleSelectAll(
												e.target.checked,
												visibleFlatEmployees,
											)
										}
										indeterminate={
											somePageSelected && !allPageSelected
										}
									/>
								</TableCell>
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
									Updated
								</TableCell>
								<TableCell className="w-12 p-4"></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{visibleFlatEmployees.map((employee) => (
								<TableRow key={employee.id}>
									<TableCell className="p-4">
										<TableCheckbox
											checked={selectedEmployees.has(
												employee.id,
											)}
											onChange={(e) =>
												handleSelectEmployee(
													employee.id,
													e.target.checked,
												)
											}
										/>
									</TableCell>
									<TableCell className="p-4">
										<div>
											<Link
											href={`/employees/activelogs?id=${encodeURIComponent(employee.id)}&name=${encodeURIComponent(employee.name)}`}
											className="font-semibold text-base pb-1 text-[var(--color-neutral-secondary)] hover:underline"
										>
											{employee.name}
										</Link>
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
											placement="left"
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
										tooltipSide="left"
										tooltipAlign="end"
										tooltipAlignOffset={2}
										tooltipContent={
											<div className="space-y-2">
												<div className="text-[var(--color-stroke-brand)] text-xs text-right">
  Last updated by You
</div>
<div className="text-[var(--color-stroke-brand)] text-xs text-right">
  Added on {employee.joinDate}
</div>
											</div>
										}
										>
											<span className="cursor-default hover:underline">
												{employee.updated}
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
											className={`p-2 hover:bg-[var(--color-neutral-secondary-bg)] rounded-lg ${menuOpen === employee.id ? "bg-[var(--color-neutral-secondary-bg)] shadow-[0_0_0_2px_var(--color-shadow-actionmenu)] rounded-lg" : ""}`}
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
											<EmployeeRowMenu
												open={menuOpen === employee.id}
												onClose={() =>
													setMenuOpen(null)
												}
												onRowAction={(action) =>
													handleRowAction(
														action,
														employee.id,
													)
												}
												employeeId={employee.id}
											/>
										</DropdownPortal>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{visibleFlatEmployees.length === 0 && !isLoading ? (
						<div className="text-center py-12 text-[var(--color-stroke-brand)]">
							No employees found.
						</div>
					) : (
						<TableActionBar
							selectedCount={selectedEmployees.size}
							onClearSelection={() => {
								setSelectedEmployees(new Set());
								setSelectAll(false);
							}}
							onReassignRole={onReassign}
							onSuspend={
								canSuspendEmployees
									? () => setSuspendEmployeeModal(true)
									: undefined
							}
							onDelete={
								canDeleteEmployees
									? () => setDeleteEmployeeModal(true)
									: undefined
							}
							allowSuspend={canSuspendEmployees}
							allowDelete={canDeleteEmployees}
							employeeList={true}
						/>
					)}
				</div>
			)}

			{hasAnyActions && (
				<Modal
					open={isActionModalOpen}
					onClose={() => setIsActionModalOpen(false)}
					width="w-98"
					height="h-auto"
					top="top-36"
					right="right-2"
					noBlur={true}
					positionClass="items-start justify-end"
					closeOnOutsideClick={true}
					noXPadding={true}
					hideClose={true}
				>
					<div className="">
						{canAddEmployees && (
							<div
								onClick={handleAddNewEmployee}
								className="cursor-pointer border-b border-[var(--color-stroke-neutral)] hover:bg-[var(--color-neutral-secondary-bg)] flex items-center gap-3 px-4 py-3"
							>
								<div className="h-full flex items-center items-center justify-center">
									<Icon
										name="user_plus"
										className="w-5 h-5 text-[var(--notif-success)]"
									/>
								</div>
								<div className=" flex-1">
									<h3 className="text-sm text-[var(--color-neutral-secondary)] mb-1">
										Add new employee
									</h3>
									<p className="text-xs text-[var(--color-stroke-brand)] leading-relaxed">
										Add employees to manage GrubPac
										operations. <br />
										Assign roles like Admin, Support, or
										Technician to give <br />
										them the right level of access.
									</p>
								</div>
							</div>
						)}
						{canViewRoles && (
							<Link href="/employees/roles">
								<div className="cursor-pointer border-b border-[var(--color-stroke-neutral)] hover:bg-[var(--color-neutral-secondary-bg)] flex items-center gap-3 px-4 py-3">
									<div className="flex justify-center">
										<Icon
											name="notes_info"
											className="w-5 h-5 text-[var(--color-neutral-light)]"
										/>
									</div>
									<div className="flex-1">
										<h3 className="text-sm text-[var(--color-neutral-secondary)] mb-1">
											Manage roles
										</h3>
										<p className="text-xs text-[var(--color-stroke-brand)] leading-relaxed">
											Roles define what employees can and
											cannot do inside <br />
											the platform. <br />
											Use predefined roles for quick setup
											or create custom <br />
											ones tailored to your organization's
											needs.
										</p>
									</div>
								</div>
							</Link>
						)}
						{canViewDismissed && (
							<Link href="/employees/dismissemployee">
								<div className="cursor-pointer border-b border-[var(--color-stroke-neutral)] hover:bg-[var(--color-neutral-secondary-bg)] flex items-center gap-3 px-4 py-3">
									<div className="flex justify-center">
										<Icon
											name="user_wrong"
											className="w-5 h-5 text-[var(--notif-error)]"
										/>
									</div>
									<div className="flex-1">
										<h3 className="text-sm text-[var(--color-neutral-secondary)] mb-1">
											Dismissed employees
										</h3>
										<p className="text-xs text-[var(--color-stroke-brand)] leading-relaxed">
											View records of employees whose
											accounts were <br /> permanently
											deleted. <br /> Kept for compliance
											and historical reference.
										</p>
									</div>
								</div>
							</Link>
						)}
						{canExportEmployees && (
							<div
								onClick={handleTakeAction}
								className="cursor-pointer hover:bg-[var(--color-neutral-secondary-bg)] flex items-center gap-3 px-4 py-3"
							>
								<div className="flex justify-center">
									<Icon
										name="download"
										className="w-5 h-5 text-[var(--color-neutral-light)]"
									/>
								</div>
								<div className="flex-1">
									<h3 className="text-sm text-[var(--color-neutral-secondary)] mb-1">
										Export employee list
									</h3>
									<p className="text-xs text-[var(--color-stroke-brand)] leading-relaxed">
										Download your employee records for
										reporting <br /> or backup.
									</p>
								</div>
							</div>
						)}
					</div>
				</Modal>
			)}
			<ReassignRoleModal
				open={openReassignModal}
				onClose={() => setOpenReassignModal(false)}
				onConfirm={handleReassignConfirm}
				title={`Reassign role to ${selectedEmployees.size} employees`}
				description="Their previous access will be updated with the new permissions. It won’t remove their records, only their access changes."
			/>
			<ReassignConfirmModal
				open={reassignConfirmModal}
				onClose={() => setReassignConfirmModal(false)}
				selectedCount={selectedEmployees.size}
				roles={reassignRoles}
				onConfirmChanges={handleConfirmChanges}
			/>
			<ExportListModal
				open={exportListModal}
				onClose={() => setExportListModal(false)}
				onConfirm={handleExportConfirm}
				options={options}
				title={title}
				description={description}
				footer={footer}
				midLevelData={midLevelData}
			/>
			<SuspendEmployeeModal
				open={suspendEmployeeModal}
				onClose={() => setSuspendEmployeeModal(false)}
				onSuspend={handleSuspend}
				selectedCount={selectedEmployees.size}
				firstSelectedName={(() => {
					const firstId = [...selectedEmployees][0];
					const emp = employees.find((e) => e.id === firstId);
					return emp?.name || "selected employee";
				})()}
			/>
			<DeleteEmployeeModal
				open={deleteEmployeeModal}
				onDelete={handleDelete}
				onClose={() => setDeleteEmployeeModal(false)}
				onSuspend={() => setSuspendEmployeeModal(true)}
				selectedCount={selectedEmployees.size}
				firstSelectedName={(() => {
					const firstId = [...selectedEmployees][0];
					const emp = employees.find((e) => e.id === firstId);
					return emp?.name || "selected account";
				})()}
			/>
			<EditEmployeeModal
				open={editEmployeeModal}
				onClose={() => {
					setEditEmployeeModal(false);
					setSelectedEmployeeForEdit(null);
				}}
				employeeData={selectedEmployeeForEdit}
				onConfirm={handleEditConfirm}
			/>
			<AddNewEmployee
				isOpen={addNewEmployeeModal}
				onClose={() => setAddNewEmployeeModal(false)}
				onConfirm={handleAddEmployeeConfirm}
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

export default EmployeesList;
