"use client";
import React, { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import SearchWithSuggestions from "@/components/ui/SearchWithSuggestions";
import Select from "@/components/ui/Select";
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
import { IoArrowBack, IoChevronBack } from "react-icons/io5";
import BoxCountBadge from "@/components/ui/BoxCountBadge";
import { useRouter } from "next/navigation";
import CheckBox from "@/components/ui/CheckBox";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import ActivateEmployeeModal from "@/components/pages/employees/ActivateEmployeeModal";
import ReassignRoleModal from "@/components/pages/employees/ReassignRoleModal";
import { showSuccess, showError } from "@/components/ui/toast";
import ExportListModal from "@/components/pages/employees/ExportListModal";
import TableActionBar from "@/components/ui/TableActionBar";
import DeleteEmployeeModal from "@/components/pages/employees/DeleteEmployeeModal";
import DropdownPortal from "@/components/ui/DropdownPortal";
import EmployeeRowMenu from "@/components/pages/employees/EmployeeRowMenu";
import { PencilLine, Trash2 } from "lucide-react";
import Icon from "@/components/ui/Icon";
import CustomTooltip from "@/components/ui/CustomTooltip";
import Link from "next/link";
import { employeeService } from "@/api/services/employeeService";
import { roleService } from "@/api/services/roleService";
import RolePermissionsModal from "@/components/pages/employees/RolePermissionsModal";
import InfoPanel from "@/components/common/InfoPanel";
import EditEmployeeModal from "@/components/pages/employees/EditEmployeeModal";
import { usePermissions } from "@/context/PermissionContext";

const SuspendedEmployees = () => {
  const router = useRouter();
  const { can } = usePermissions();
  const canViewSuspended = can('view suspended employees', 'employees') || can('view suspended employees');
  const canActivateEmployees = can('active employees', 'employees') || can('active employees');
  const canDeleteEmployees = can('delete employees', 'employees') || can('delete employees');
  const canExportEmployees = can('export employees', 'employees') || can('export employees');
  const [searchValue, setSearchValue] = useState("");
  const [selectedRole, setSelectedRole] = useState([]);
  const [groupByRole, setGroupByRole] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [openGroupIndex, setOpenGroupIndex] = useState(null);
  const [activateEmployeeModal, setActivateEmployeeModal] = useState(false);
  const [openReassignModal, setOpenReassignModal] = useState(false);
  const [pendingReassignRole, setPendingReassignRole] = useState(null);
  const [exportListModal, setExportListModal] = useState(false);
  const [deleteEmployeeModal, setDeleteEmployeeModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [singleEmployeeId, setSingleEmployeeId] = useState(null);
  const buttonRefs = useRef({});
  const ref = useRef();
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [rolePermissionsModal, setRolePermissionsModal] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null);
  const [editEmployeeModal, setEditEmployeeModal] = useState(false);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false); // Track if we've fetched data at least once
  // Store selected employee data to preserve it during API calls
  const [preservedEmployee, setPreservedEmployee] = useState(null);
  // Track selected employee ID from suggestion click
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
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

  // Fetch suspended employees from API
  const fetchSuspendedEmployees = async () => {
    try {
      setLoading(true);
      const params = { status: "suspended" };
      if (searchValue && searchValue.trim()) {
        params.query = searchValue.trim();
      }
      if (selectedRole.length > 0) {
        // Send all selected role IDs as repeated params (role=ID&role=ID...)
        params.role = selectedRole; // e.g., ['id1','id2']
      }
      const response = await employeeService.getAdmins(params);
      setHasFetched(true); // Mark that we've fetched data
      if (response?.success && response.code === 200 && response.data?.admins) {
        const transformed = response.data.admins.map((admin, index) => {
          const firstName = admin.first_name || "";
          const lastName = admin.last_name || "";
          const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Unnamed Employee";
          const phoneFormatted = admin.mobile_number && admin.country_code
            ? `${admin.country_code} ${admin.mobile_number}`
            : (admin.mobile_number || "");
          let roleName = "No role";
          // Priority: Use admin.role.name if available (most reliable - from API)
          if (admin.role && typeof admin.role === 'object' && admin.role.name) {
            roleName = admin.role.name;
          } else if (admin.role_name) {
            roleName = admin.role_name;
          }

          return {
            id: admin.id || `emp-${index}`,
            name: fullName,
            empId: `#${admin.id?.slice(-8) || `EMP${index}`}`,
            joinDate: formatJoiningDate(admin.joining_date),
            location: admin.location || "Not specified",
            phone: phoneFormatted || "Not provided",
            email: admin.email || "Not provided",
            role: roleName,
            suspended: formatDate(admin.suspended_at || admin.updated_at),
            originalData: admin,
          };
        });

        // If we have a preserved employee (from suggestion click) and it's not in the API response,
        // add it to the results so it's still visible
        if (selectedEmployeeId) {
          const foundInResponse = transformed.find(emp => emp.id === selectedEmployeeId);
          if (!foundInResponse) {
            // Employee not in API response, try to find it in previous employees
            setEmployees((prevEmployees) => {
              const preservedFromPrev = prevEmployees.find(emp => emp.id === selectedEmployeeId);
              if (preservedFromPrev) {
                // Employee was in previous list, add it to new results
                return [preservedFromPrev, ...transformed];
              }
              // If not in previous list, return new results as-is
              // The preservedEmployee state will be used by filteredEmployees to show it
              return transformed;
            });
          } else {
            // Employee found in API response, clear preserved employee and use normal flow
            setPreservedEmployee(null);
            setEmployees(transformed);
          }
        } else {
          setEmployees(transformed);
        }
      } else {
        // Only clear employees if search value is empty
        // If searching but no API results, keep existing employees for client-side filtering
        if (!searchValue || !searchValue.trim()) {
          setEmployees([]);
        }
      }
    } catch (e) {
      setHasFetched(true); // Mark that we've fetched data even on error
      // On error, only clear if not searching
      if (!searchValue || !searchValue.trim()) {
        setEmployees([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create search data for SearchWithSuggestions
  const searchData = employees.map((employee) => ({
    id: employee.id,
    name: employee.name,
    code: employee.role,
  }));

  // Fetch role options from API
  const [roleOptions, setRoleOptions] = useState([]);

  useEffect(() => {
    const fetchRoleOptions = async () => {
      try {
        const response = await roleService.getRoles();
        if (response.success && response.code === 200 && response.data?.roles) {
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

  const exportOptions = [
    {
      group: "scope",
      title: "Scope",
      items: [
        { id: "employees", label: "All suspended employees", type: "radio" },
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
      items: [{ id: "activityLogs", label: "Activity logs", type: "checkbox" }],
    },
  ];

  const handleExportConfirm = async ({ scope, checked }) => {
    try {
      setExportListModal(false);

      const params = {
        status: "suspended", // Always set status to suspended for this page
      };

      // Handle scope
      if (scope === "employees" || !scope) {
        // All suspended employees
        params.fetch_all = true;
      } else if (scope === "filteredList") {
        // As per the filtered list
        if (searchValue && searchValue.trim()) {
          params.query = searchValue.trim();
        }
        if (selectedRole.length > 0) {
          // Use role ID from roleOptions
          const selectedRoleOption = roleOptions.find(ro => ro.label === selectedRole[0]);
          if (selectedRoleOption) {
            params.role = selectedRoleOption.id;
          }
        }
      }

      // Handle extra details
      if (checked["activityLogs"]) {
        params.include_activity_logs = true;
      }

      console.log("Export Suspended Employees with params:", params);
      console.log("Current searchValue:", searchValue);
      console.log("Current selectedRole:", selectedRole);
      console.log("Current filteredEmployees count:", filteredEmployees.length);

      const response = await employeeService.exportAdmins(params);

      console.log("Export response received:", response);

      if (response && typeof response === 'object' && response.blob) {
        const blob = response.blob;
        const filename = response.filename || `suspended_employees_export_${new Date().toISOString().split('T')[0]}.csv`;

        console.log("Export blob - size:", blob.size, "type:", blob.type);
        console.log("Export filename:", filename);

        if (blob.size === 0) {
          showError("Export file is empty. Please check your filters and try again.");
          return;
        }

        const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = finalFilename;
        link.style.display = 'none';

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
      const errorMessage = error.message || "Failed to export suspended employees. Please try again.";
      showError(errorMessage);
    }
  };

  // If we have a preserved employee that's not in employees list, add it for display
  const employeesWithPreserved = preservedEmployee && selectedEmployeeId && !employees.find(emp => emp.id === selectedEmployeeId)
    ? [preservedEmployee, ...employees]
    : employees;

  // Filter employees based on search and role (client-side; API already filters by query and role)
  // Also check if the selected item from suggestions matches exactly
  const filteredEmployees = employeesWithPreserved.filter((employee) => {
    // If a specific employee was selected from suggestions, prioritize showing that employee
    if (selectedEmployeeId) {
      return employee.id === selectedEmployeeId;
    }

    // Role filter first (client-side fallback, but API should handle this)
    if (selectedRole.length > 0) {
      const employeeRoleId = employee.originalData?.role_id || employee.originalData?.role?.id;
      // Normalize types to avoid number/string mismatch
      const selectedSet = new Set((selectedRole || []).map((id) => String(id)));
      if (!selectedSet.has(String(employeeRoleId))) return false;
    }

    // Search filter
    if (!searchValue || typeof searchValue !== "string") return true;

    const searchLower = searchValue.toLowerCase().trim();
    const employeeNameLower = (employee.name || "").toLowerCase().trim();
    const employeeEmailLower = (employee.email || "").toLowerCase().trim();

    // Exact match first (for when suggestion is clicked)
    if (employeeNameLower === searchLower || employeeEmailLower === searchLower) {
      return true;
    }

    // Partial match for other fields
    return (
      employeeNameLower.includes(searchLower) ||
      employeeEmailLower.includes(searchLower) ||
      (employee.empId || "").toLowerCase().includes(searchLower) ||
      (employee.phone || "").includes(searchValue) ||
      (employee.role || "").toLowerCase().includes(searchLower) ||
      (employee.location || "").toLowerCase().includes(searchLower)
    );
  });

  // Compute visible slice for flat (non-grouped) table
  const flatTotal = filteredEmployees.length;
  const flatStart = (currentPage - 1) * pageSize;
  const flatEnd = Math.min(flatStart + pageSize, flatTotal);
  const visibleFlatEmployees = filteredEmployees.slice(flatStart, flatEnd);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    // Clear selected employee ID when search changes manually (not from suggestion click)
    if (!searchValue || searchValue.trim() === "") {
      setSelectedEmployeeId(null);
      setPreservedEmployee(null);
    }
  }, [searchValue, selectedRole, groupByRole]);
  
  // Clear preserved employee if it's found in the current employees list
  useEffect(() => {
    if (preservedEmployee && selectedEmployeeId && employees.length > 0) {
      const found = employees.find(emp => emp.id === selectedEmployeeId);
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsActionModalOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch suspended employees on mount and when search value or role filter changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Always fetch from API when search value or role filter changes
    // Client-side filtering will handle showing exact matches from current list
    fetchSuspendedEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, selectedRole]);

  const handleSelectAll = (checked, subset = filteredEmployees) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedEmployees(new Set(subset.map((emp) => emp.id)));
    } else {
      setSelectedEmployees(new Set());
    }
  };
  const handleActivate = async () => {
    try {
      // Determine which IDs to reactivate
      let adminIds = [];
      if (singleEmployeeId) {
        adminIds = [singleEmployeeId];
      } else if (selectedEmployees.size > 0) {
        adminIds = Array.from(selectedEmployees);
      } else {
        adminIds = filteredEmployees.map((e) => e.id);
      }

      if (adminIds.length === 0) {
        setActivateEmployeeModal(false);
        return;
      }

      console.log("Activating employees - Count:", adminIds.length);
      console.log("Activating employees - IDs:", adminIds);
      console.log("API payload will be:", { admins: adminIds });

      // If a role was selected to reassign, first assign to those needing reassignment
      if (pendingReassignRole) {
        const idsNeedingReassign = adminIds.filter((id) => {
          const emp = filteredEmployees.find((e) => e.id === id) || employees.find((e) => e.id === id);
          const roleName = emp?.role;
          return isRoleDeleted(roleName) || roleName === "No role";
        });
        if (idsNeedingReassign.length > 0) {
          try {
            await employeeService.bulkAssignRole(pendingReassignRole.id, idsNeedingReassign);
          } catch (assignErr) {
            console.error("Bulk assign role before activation failed:", assignErr);
          }
        }
      }

      const res = await employeeService.reactivateAdmin(adminIds);
      if (res?.success && res.code === 200) {
        const count = adminIds.length;
        showSuccess(
          "Success!",
          `${count} ${count === 1 ? "employee has" : "employees have"} been reactivated.`
        );
        setSelectedEmployees(new Set());
        setSelectAll(false);
        setSingleEmployeeId(null);
        setActivateEmployeeModal(false);
        setPendingReassignRole(null);

        // Small delay to ensure backend has processed the status change
        await new Promise(resolve => setTimeout(resolve, 500));

        // Refresh the suspended employees list
        await fetchSuspendedEmployees();
      } else {
        const errorMsg = res?.error || res?.message || "Failed to reactivate employee(s).";
        showError(errorMsg);
      }
    } catch (e) {
      showError("Failed to reactivate employee(s). Please try again.");
    }
  };

  const handleActivateFinal = () => {
    if (singleEmployeeId) {
      // Handle single employee activation
      showSuccess("Success!", `${filteredEmployees.find(emp => emp.id === singleEmployeeId)?.name} has been activated.`);
      setSelectedEmployees(new Set()); // Clear selection
      setSelectAll(false);
    } else {
      // Handle batch activation
      showSuccess("Success!", `${selectedEmployees.size} employees have been activated.`);
      setSelectedEmployees(new Set()); // Clear selection
      setSelectAll(false);
    }
    setActivateEmployeeModal(false);
    setSingleEmployeeId(null);
  };
  const onOpenActivate = (employeeId = null) => {
    let idsToActOn = [];
    if (employeeId) {
      // Store the single employee ID without affecting selectedEmployees
      setSingleEmployeeId(employeeId);
      setSelectedEmployees(new Set()); // Clear existing selection
      idsToActOn = [employeeId];
    } else {
      // For "ACTIVATE ALL" or "ACTIVATE SELECTION" - ensure selected employees are set
      setSingleEmployeeId(null);
      // If employees are already selected, keep them; otherwise select all filtered employees
      const ids = selectedEmployees.size === 0 ? filteredEmployees.map((e) => e.id) : Array.from(selectedEmployees);
      if (selectedEmployees.size === 0) {
        setSelectedEmployees(new Set(ids));
      }
      idsToActOn = ids;
    }

    // Determine if any selected require reassignment (role missing or No role)
    const requiresReassign = idsToActOn.some((id) => {
      const emp = filteredEmployees.find((e) => e.id === id) || employees.find((e) => e.id === id);
      const roleName = emp?.role;
      return isRoleDeleted(roleName) || roleName === "No role";
    });

    if (requiresReassign) {
      setOpenReassignModal(true);
      setActivateEmployeeModal(false);
    } else {
      setOpenReassignModal(false);
      setActivateEmployeeModal(true);
    }
  };
  const onOpenDeleteModal = (employeeId = null) => {
    if (employeeId) {
      // Store the single employee ID without affecting selectedEmployees
      setSingleEmployeeId(employeeId);
      setSelectedEmployees(new Set()); // Clear existing selection
    } else {
      // For "DELETE" from action bar - ensure selected employees are set
      setSingleEmployeeId(null);
      // If employees are already selected, keep them; otherwise select all filtered employees
      if (selectedEmployees.size === 0) {
        setSelectedEmployees(new Set(filteredEmployees.map((e) => e.id)));
      }
    }
    setDeleteEmployeeModal(true);
  };
  const handleBack = () => {
    setOpenReassignModal(false);
    setActivateEmployeeModal(true);
  };
  const handleDeleteAccount = async () => {
    try {
      let adminIds = [];
      if (singleEmployeeId) {
        adminIds = [singleEmployeeId];
      } else if (selectedEmployees.size > 0) {
        adminIds = Array.from(selectedEmployees);
      } else {
        adminIds = filteredEmployees.map((e) => e.id);
      }

      if (adminIds.length === 0) {
        setDeleteEmployeeModal(false);
        showError("No employees selected for deletion.");
        return;
      }

      const count = adminIds.length;
      console.log("Deleting employees - Count:", count);
      console.log("Deleting employees - IDs:", adminIds);
      console.log("API payload will be:", { adminIds });

      const res = await employeeService.deleteAdmins({ adminIds });
      if (res?.success && res.code === 200) {
        showSuccess(
          "Success",
          `${count} ${count === 1 ? "employee has" : "employees have"} been deleted.`
        );
        setSelectedEmployees(new Set());
        setSelectAll(false);
        setDeleteEmployeeModal(false);
        setSingleEmployeeId(null);
        await fetchSuspendedEmployees();
      } else {
        const errorMsg = res?.error || res?.message || "Failed to delete employee(s).";
        showError(errorMsg);
      }
    } catch (e) {
      showError("Failed to delete employee(s). Please try again.");
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
    setSelectAll(newSelected.size === filteredEmployees.length);
  };
  const handleReassignConfirm = (selectedRole) => {
    setPendingReassignRole(selectedRole || null);
    setOpenReassignModal(false);
    setActivateEmployeeModal(true);
  };

  // Helper function to count permissions from permissions_json
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

  // Check if role exists in roleOptions (dynamic check instead of hardcoded "Admin")
  const isRoleDeleted = (roleName) => {
    if (!roleName || roleName === "No role") return false;
    // Check if role exists in roleOptions from API
    const roleExists = roleOptions.some(role => role.label === roleName);
    return !roleExists;
  };

  const handleViewDetails = (employee) => {
    if (employee && employee.originalData && employee.originalData.role) {
      setSelectedRoleForPermissions(employee.originalData.role);
      setRolePermissionsModal(true);
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

      const nameParts = updatedEmployeeData.name ? updatedEmployeeData.name.split(' ').filter(p => p.trim()) : [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      if (!firstName || firstName.trim().length === 0) {
        showError("Please fill the First name field.");
        return;
      }
      if (!lastName || lastName.trim().length === 0) {
        showError("Please fill the Last name field.");
        return;
      }
      if (!updatedEmployeeData.email || updatedEmployeeData.email.trim().length === 0) {
        showError("Please fill the Email field.");
        return;
      }

      let countryCode = originalAdmin.country_code || '+91';
      let mobileNumber = originalAdmin.mobile_number || '';

      if (updatedEmployeeData.phone && updatedEmployeeData.phone !== selectedEmployeeForEdit.phone) {
        const phoneStr = updatedEmployeeData.phone.trim();

        if (phoneStr.startsWith('+91')) {
          countryCode = '+91';
          mobileNumber = phoneStr.substring(3).replace(/\D/g, '');
        } else if (phoneStr.startsWith('91') && phoneStr.length > 2) {
          countryCode = '+91';
          mobileNumber = phoneStr.substring(2).replace(/\D/g, '');
        } else {
          const phoneMatch = phoneStr.match(/^(\+?\d{1,3})\s*(.+)$/);
          if (phoneMatch) {
            countryCode = phoneMatch[1].startsWith('+') ? phoneMatch[1] : `+${phoneMatch[1]}`;
            mobileNumber = phoneMatch[2].replace(/\s/g, '').replace(/\D/g, '');
          } else {
            countryCode = '+91';
            mobileNumber = phoneStr.replace(/\D/g, '');
          }
        }
      }

      let roleId = originalAdmin.role_id;

      if (updatedEmployeeData.role_id) {
        roleId = updatedEmployeeData.role_id;
      } else if (updatedEmployeeData.role && updatedEmployeeData.role !== selectedEmployeeForEdit.role) {
        const roleName = updatedEmployeeData.role;
        const roleOption = roleOptions.find(ro => ro.label === roleName);
        if (roleOption) {
          roleId = roleOption.id;
        } else {
          console.warn(`Role "${roleName}" not found. Keeping existing role_id: ${roleId}`);
        }
      }

      let joiningDateISO = originalAdmin.joining_date;
      if (updatedEmployeeData.joinDate && updatedEmployeeData.joinDate !== selectedEmployeeForEdit.joinDate) {
        const dateStr = updatedEmployeeData.joinDate;
        if (dateStr.includes('T') || dateStr.includes('Z')) {
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

      if (updatedEmployeeData.location !== undefined) {
        payload.location = updatedEmployeeData.location || originalAdmin.location || '';
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

      const response = await employeeService.updateAdmin(payload);

      if (response.success && response.code === 200) {
        const fullName = updatedEmployeeData.name || `${originalAdmin.first_name} ${originalAdmin.last_name}`.trim();
        showSuccess('Success!', `${fullName || 'Employee'} details updated successfully.`);

        setEditEmployeeModal(false);
        setSelectedEmployeeForEdit(null);

        await fetchSuspendedEmployees();
      } else {
        const errorMsg = response.error || response.message || "Failed to update employee. Please try again.";
        showError(errorMsg);
      }
    } catch (error) {
      console.error("Error updating employee:", error);

      let errorMessage = "Failed to update employee. Please try again.";

      if (error.response?.data) {
        const errorData = error.response.data;

        if (errorData.errors) {
          const fieldErrors = Object.keys(errorData.errors).map(field => {
            const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return `${fieldName}: ${Array.isArray(errorData.errors[field]) ? errorData.errors[field][0] : errorData.errors[field]}`;
          });
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join(', ');
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }

      showError(errorMessage);
    }
  };

  // Derive page selection state for header checkbox
  const pageEmployeeIds = visibleFlatEmployees.map((e) => e.id);
  const allPageSelected = pageEmployeeIds.length > 0 && pageEmployeeIds.every((id) => selectedEmployees.has(id));
  const somePageSelected = pageEmployeeIds.some((id) => selectedEmployees.has(id));

  // Group employees by role - same as list page
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

    // Get all role names from API (roleOptions)
    const allRoleNames = new Set();

    // Add roles from roleOptions
    roleOptions.forEach(role => {
      if (role.label) {
        allRoleNames.add(role.label);
      }
    });

    // Add roles from actual employees
    Object.keys(groupedEmployees).forEach(roleName => {
      if (roleName) {
        allRoleNames.add(roleName);
      }
    });

    // Create groups for all roles - include empty ones too (sorted alphabetically)
    const allRoles = Array.from(allRoleNames).sort((a, b) => {
      return a.localeCompare(b);
    });

    return allRoles.map((roleName) => {
      const roleEmployees = groupedEmployees[roleName] || [];
      // Get permissions count from first employee's role (all employees in group have same role)
      const permissionsCount = roleEmployees.length > 0 && roleEmployees[0]?.originalData?.role?.permissions_json
        ? (() => {
          const permissionsJson = roleEmployees[0].originalData.role.permissions_json;
          let totalCount = 0;
          Object.keys(permissionsJson).forEach((sectionKey) => {
            const permissionList = permissionsJson[sectionKey] || [];
            totalCount += permissionList.length;
          });
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
                    if (roleEmployees.length > 0 && roleEmployees[0].originalData?.role) {
                      handleViewDetails({
                        originalData: {
                          role: roleEmployees[0].originalData.role
                        }
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
  const renderGroupTable = (group) => (
    <div className="">
      <Table className="min-w-full">
        <TableHead>
          <TableRow>
            <TableCell className="w-12 p-4">
              <TableCheckbox
                checked={
                  group.items.length > 0 &&
                  group.items.every((emp) => selectedEmployees.has(emp.id))
                }
                indeterminate={
                  group.items.some((emp) => selectedEmployees.has(emp.id)) &&
                  !group.items.every((emp) => selectedEmployees.has(emp.id))
                }
                onChange={(e) => {
                  const groupIds = group.items.map((emp) => emp.id);
                  const newSelected = new Set(selectedEmployees);
                  if (e.target.checked) {
                    groupIds.forEach((id) => newSelected.add(id));
                  } else {
                    groupIds.forEach((id) => newSelected.delete(id));
                  }
                  setSelectedEmployees(newSelected);
                }}
              />
            </TableCell>
            <TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
              Name
            </TableCell>
            <TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
              Contact info
            </TableCell>
            <TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
              Suspended
            </TableCell>
            <TableCell className="w-12 p-4"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {group.items.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="w-12 p-4">
                <TableCheckbox
                  checked={selectedEmployees.has(employee.id)}
                  onChange={(e) =>
                    handleSelectEmployee(employee.id, e.target.checked)
                  }
                />
              </TableCell>
              <TableCell className="p-4">
                <div>
                  <div className="font-semibold pb-1 text-base text-[var(--color-neutral-secondary)]">
                    {employee.name}
                  </div>
                  <div className="text-sm text-[var(--color-stroke-brand)]">
                    {employee.empId} | Joined {employee.joinDate} |{" "}
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
              <TableCell className="p-4 text-[var(--color-neutral-secondary)] text-base">
                <BoxCountBadge
                  asText
                  tooltipSide="bottom"
                  tooltipAlign="end"
                  tooltipContent={
                    <div className="space-y-2">
                      <div className="text-[var(--color-stroke-brand)] text-right text-sm font-normal">
                        Suspended by You
                      </div>
                      <div className="text-[var(--color-stroke-brand)] text-right text-sm font-normal">
                        Added on {employee.joinDate} (You)
                      </div>
                    </div>
                  }
                >
                  <span className="cursor-default hover:underline">
                    {employee.suspended}
                  </span>
                </BoxCountBadge>
              </TableCell>
              <TableCell className="w-12 p-4">
                <button className="p-1 hover:bg-[var(--color-neutral-secondary-bg)] rounded">
                  <BsThreeDotsVertical className="w-5 h-5 text-[var(--color-stroke-brand)]" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // Show InfoPanel only when there are truly no suspended employees (no search, no role filter, and API returned empty)
  // Show only InfoPanel without any search, filters, or buttons
  const shouldShowInfoPanel = !loading && hasFetched && (!searchValue || !searchValue.trim()) && selectedRole.length === 0 && employees.length === 0;
  
  if (shouldShowInfoPanel) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="cancel"
            onClick={() => router.push("/employees/list")}
            className="p-2 rounded-lg transition-colors"
          >
            <IoChevronBack className="w-4 h-4 text-[var(--color-stroke-brand)]" />
          </Button>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-primary)]">
            Suspended employees
          </h1>
        </div>

        <InfoPanel
          title=""
          name="No suspended employees"
          description="All employees are active and ready to work. Suspended accounts will appear here when deactivated."
        />
      </div>
    );
  }

  if (!canViewSuspended) return null;

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
            Suspended employees
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {canActivateEmployees && (
            <Button
              onClick={() => {
                // Collect all filtered employees for "ACTIVATE ALL"
                onOpenActivate();
              }}
              variant="secondary"
              className="btn-size-md-sm !px-3 font-medium"
            >
              ACTIVATE ALL
            </Button>
          )}
          {canExportEmployees && (
            <Button
              variant="cancel"
              size="sm"
              onClick={() => setExportListModal(true)}
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
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSelect={(item) => {
                // When clicking a suggestion, immediately show that employee
                // Preserve the employee data so it stays visible even if API doesn't return it
                setPreservedEmployee(item);
                setSelectedEmployeeId(item.id);
                const exactSearchTerm = item.name || item.email || "";
                setCurrentPage(1);
                setSearchValue(exactSearchTerm);
                // The useEffect will trigger fetchSuspendedEmployees automatically
                // The preserved employee will be added to results if not found in API response
              }}
              data={searchData}
              placeholder="Search employees"
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
            Showing {visibleFlatEmployees.length} of {filteredEmployees.length}
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
          <div className="text-[var(--color-neutral-secondary)]">Loading employees...</div>
        </div>
      ) : filteredEmployees.length === 0 ? (
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
                <TableCell className="w-12 p-4">
                  <TableCheckbox
                    checked={allPageSelected}
                    onChange={(e) => handleSelectAll(e.target.checked, visibleFlatEmployees)}
                    indeterminate={somePageSelected && !allPageSelected}
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
                  Suspended
                </TableCell>
                <TableCell className="w-12 p-4"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="p-8 text-center text-[var(--color-stroke-brand)]">
                  {(searchValue && searchValue.trim()) || selectedRole.length > 0 ? 'No results found' : 'No suspended employees'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ) : groupByRole ? (
        <>
          <GroupCollapseTable
            groups={groupEmployeesByRole()}
            openIndex={openGroupIndex}
            setOpenIndex={setOpenGroupIndex}
            renderTable={renderGroupTable}
            noResultsMessage="No suspended employees found."
            tableContainerClass="w-full"
          />
          <TableActionBar
            selectedCount={selectedEmployees.size}
            onClearSelection={() => {
              setSelectedEmployees(new Set());
              setSelectAll(false);
            }}
            suspended={true}
            onActivate={canActivateEmployees ? () => {
              if (selectedEmployees.size === 0) {
                setSelectedEmployees(new Set(filteredEmployees.map((e) => e.id)));
              }
              setSingleEmployeeId(null);
              setActivateEmployeeModal(true);
            } : undefined}
            onDelete={canDeleteEmployees ? () => {
              if (selectedEmployees.size === 0) {
                setSelectedEmployees(new Set(filteredEmployees.map((e) => e.id)));
              }
              setSingleEmployeeId(null);
              setDeleteEmployeeModal(true);
            } : undefined}
            allowActivate={canActivateEmployees}
            allowDelete={canDeleteEmployees}
          />
        </>
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
                <TableCell className="w-12 p-4">
                  <TableCheckbox
                    checked={allPageSelected}
                    onChange={(e) => handleSelectAll(e.target.checked, visibleFlatEmployees)}
                    indeterminate={somePageSelected && !allPageSelected}
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
                  Suspended
                </TableCell>
                <TableCell className="w-12 p-4"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleFlatEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="p-4">
                    <TableCheckbox
                      checked={selectedEmployees.has(employee.id)}
                      onChange={(e) =>
                        handleSelectEmployee(employee.id, e.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="p-4">
                    <div>
                      <div className="font-semibold pb-1 text-base text-[var(--color-neutral-secondary)]">
                        {employee.name}
                      </div>
                      <div className="text-sm text-[var(--color-stroke-brand)]">
                        {employee.empId} | Joined {employee.joinDate} |{" "}
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
                        isRoleDeleted(employee.role) ? (
                          <div className="text-[var(--color-stroke-brand)] text-sm">
                            Role no longer exists
                          </div>
                        ) : (
                          <div>
                            <div className="text-[var(--color-stroke-brand)] text-sm ">
                              {getPermissionsCount(employee)} permissions
                            </div>
                            <div
                              className="text-[var(--info-panel-view-bg)] text-sm font-semibold cursor-pointer hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(employee);
                              }}
                            >
                              <i>View details &gt;&gt;</i>
                            </div>
                          </div>
                        )
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
                          <div className="text-[var(--color-stroke-brand)] text-right text-sm font-normal">
                            Suspended by You
                          </div>
                          <div className="text-[var(--color-stroke-brand)] text-right text-sm">
                            Added on {employee.joinDate} (You)
                          </div>
                        </div>
                      }
                    >
                      <span className="cursor-default hover:underline">
                        {employee.suspended}
                      </span>
                    </BoxCountBadge>
                  </TableCell>
                  <TableCell className="p-4">
                    <button
                      ref={(el) => (buttonRefs.current[employee.id] = el)}
                      onClick={() =>
                        setMenuOpen(
                          menuOpen === employee.id ? null : employee.id
                        )
                      }
                      className={`p-2 hover:bg-[var(--color-neutral-secondary-bg)] rounded-lg ${menuOpen === employee.id ? "bg-[var(--color-neutral-secondary-bg)] shadow-[0_0_0_2px_var(--color-shadow-actionmenu)] rounded-lg" : ""}`}
                    >
                      <BsThreeDotsVertical className="w-5 h-5 text-[var(--color-stroke-brand)]" />
                    </button>
                    <DropdownPortal
                      targetRef={
                        buttonRefs.current[employee.id]
                          ? { current: buttonRefs.current[employee.id] }
                          : null
                      }
                      open={menuOpen === employee.id}
                      onClose={() => setMenuOpen(null)}
                    >
                      <div className="w-56 bg-white border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] rounded-lg shadow-[4px_4px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)] z-50">
                        {can('active employees', 'employees') && (
                          <Button
                            variant="profile"
                            onClick={() => { onOpenActivate(employee.id); setMenuOpen(null) }}
                            className="w-full !rounded-b-none text-left btn-size-md-sm px-4 py-2 flex items-center gap-2 text-[var(--color-neutral-secondary)] text-sm"
                          >
                            <Icon
                              name="user_check"
                              className="w-5 h-5 !text-[var(--notif-success)]"
                            />{" "}
                            Activate employee
                          </Button>
                        )}
                        {can('edit employees', 'employees') && (
                          <Button
                            variant="profile"
                            onClick={() => {
                              setSelectedEmployeeForEdit(employee);
                              setEditEmployeeModal(true);
                              setMenuOpen(null);
                            }}
                            className="w-full !rounded-none text-left btn-size-md-sm px-4 py-2 flex items-center gap-2 text-[var(--color-neutral-secondary)] text-sm">
                            <PencilLine className="w-5 h-5 text-[var(--color-neutral-light)]" />{" "}
                            Edit employee details
                          </Button>
                        )}
                        <Link href="/employees/suspendedlogs" className="block">
                          <Button
                            variant="profile"
                            className="w-full text-left !rounded-none btn-size-md-sm px-4 py-2 flex items-center gap-2 text-[var(--color-neutral-secondary)] text-sm"
                            onClick={() => setMenuOpen(null)}
                          >
                            <Icon
                              name="note"
                              className="w-5 h-5 text-[var(--color-neutral-light)]"
                            />{" "}
                            View logs
                          </Button>
                        </Link>
                        {can('delete employees', 'employees') && (
                          <Button
                            variant="profile"
                            onClick={() => { onOpenDeleteModal(employee.id); setMenuOpen(null) }}
                            className="w-full text-left !rounded-t-none btn-size-md-sm px-4 py-2 flex items-center gap-2 text-[var(--color-neutral-secondary)] text-sm"
                          >
                            <Trash2
                              name="note"
                              className="w-5 h-5 text-[var(--notif-error)]"
                            />{" "}
                            Delete employee
                          </Button>
                        )}
                      </div>
                    </DropdownPortal>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TableActionBar
            selectedCount={selectedEmployees.size}
            onClearSelection={() => {
              setSelectedEmployees(new Set());
              setSelectAll(false);
            }}
            suspended={true}
            onActivate={() => {
              // Ensure selected employees are set before opening modal
              if (selectedEmployees.size === 0) {
                setSelectedEmployees(new Set(filteredEmployees.map((e) => e.id)));
              }
              setSingleEmployeeId(null);
              setActivateEmployeeModal(true);
            }}
            onDelete={() => {
              // Ensure selected employees are set before opening modal
              if (selectedEmployees.size === 0) {
                setSelectedEmployees(new Set(filteredEmployees.map((e) => e.id)));
              }
              setSingleEmployeeId(null);
              setDeleteEmployeeModal(true);
            }}
            allowActivate={can('active employees', 'employees')}
            allowDelete={can('delete employees', 'employees')}
          />
        </div>
      )}
      <ActivateEmployeeModal
        open={activateEmployeeModal}
        onClose={() => {
          setActivateEmployeeModal(false);
          setSingleEmployeeId(null);
        }}
        onActivate={handleActivate}
        selectedCount={singleEmployeeId ? 1 : (selectedEmployees.size > 0 ? selectedEmployees.size : filteredEmployees.length)}
        firstSelectedName={
          singleEmployeeId
            ? filteredEmployees.find(emp => emp.id === singleEmployeeId)?.name || ""
            : filteredEmployees.find(emp => selectedEmployees.has(emp.id))?.name || filteredEmployees[0]?.name || ""
        }
      />
      <ReassignRoleModal
        open={openReassignModal}
        onClose={() => setOpenReassignModal(false)}
        title={`Tying to activate ${filteredEmployees.length} employees?`}
        description="Some employees’ previous roles no longer exist. Please assign them a new role before reactivation. Others will be restored to their existing roles."
        onConfirm={handleReassignConfirm}
        onBack={handleBack}
      />
      <ExportListModal
        open={exportListModal}
        onClose={() => setExportListModal(false)}
        options={exportOptions}
        title="Customise your export"
        description="Select the scope, and details you'd like to include in the exportfile."
        onConfirm={handleExportConfirm}
      />
      <DeleteEmployeeModal
        open={deleteEmployeeModal}
        onClose={() => {
          setDeleteEmployeeModal(false);
          setSingleEmployeeId(null);
        }}
        onDelete={handleDeleteAccount}
        selectedCount={singleEmployeeId ? 1 : (selectedEmployees.size > 0 ? selectedEmployees.size : filteredEmployees.length)}
        firstSelectedName={
          singleEmployeeId
            ? filteredEmployees.find(emp => emp.id === singleEmployeeId)?.name || ""
            : filteredEmployees.find(emp => selectedEmployees.has(emp.id))?.name || filteredEmployees[0]?.name || ""
        }
      />
      <RolePermissionsModal
        open={rolePermissionsModal}
        onClose={() => {
          setRolePermissionsModal(false);
          setSelectedRoleForPermissions(null);
        }}
        roleData={selectedRoleForPermissions ? { role: selectedRoleForPermissions } : {}}
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
    </div>
  );
};

export default SuspendedEmployees;
