"use client";
import React, { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
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
import Icon from "@/components/ui/Icon";
import BoxCountBadge from "@/components/ui/BoxCountBadge";
import GroupCollapseTable from "@/components/shared/GroupCollapseTable";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoChevronBack } from "react-icons/io5";
import { LuPlus } from "react-icons/lu";
import CreateNewRole from "@/components/pages/employees/CreateNewRole";
import CreateNewRoleFullPage from "@/components/pages/employees/CreateNewRoleFullPage";
import { showSuccess } from "@/components/ui/toast";
import ExportListModal from "@/components/pages/employees/ExportListModal";
import TableActionBar from "@/components/ui/TableActionBar";
import DeleteRoleModal from "@/components/pages/employees/DeleteRoleModal";
import { PencilLine, Trash2 } from "lucide-react";
import ManagerList from "@/components/pages/employees/ManagerList";
import SelectEmplyeesReassign from "@/components/pages/employees/SelectEmployeesReassign";
import ReassignRoleModal from "@/components/pages/employees/ReassignRoleModal";
import ReassignConfirmModal from "@/components/pages/employees/ReassignConfirmModal";
import { root } from "postcss";
import CheckBox from "@/components/ui/CheckBox";
import CustomTooltip from "@/components/ui/CustomTooltip";
import DropdownPortal from "@/components/ui/DropdownPortal";
import { commonService } from "@/api/services/commonService";
import { customerService } from "@/api/services/customerService";
import { roleService } from "@/api/services/roleService";
import { employeeService } from "@/api/services/employeeService";
import { showError } from "@/components/ui/toast";
import Link from "next/link";
import { usePermissions } from "@/context/PermissionContext";
import Pagination from "@/components/ui/Pagination";

const ManageRoles = () => {
  const [searchValue, setSearchValue] = useState("");
  const { can } = usePermissions();
  const canViewRoles = can('view roles', 'roles') || can('view roles');
  const canAddRoles = can('add roles', 'roles') || can('add roles');
  const canEditRoles = can('edit roles', 'roles') || can('edit roles');
  const canDeleteRoles = can('delete roles', 'roles') || can('delete roles');
  const [hideRolesWithAssignment, setHideRolesWithAssignment] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [groupAsPerRole, setGroupAsPerRole] = useState(false);
  const [openGroupIndex, setOpenGroupIndex] = useState(null);
  const [createNewRole, setCreateNewRole] = useState(null);
  const [createNewRoleFullPage, setCreateNewRoleFullPage] = useState(null);
  const [options, setOptions] = useState([]);
  const [title, setTitle] = useState("");
  const [assignees, setAssignees] = useState("");
  const [description, setDescription] = useState("");
  const [exportListModal, setExportListModal] = useState(false);
  const [footer, setFooter] = useState("");
  const [deleteRole, setDeleteRole] = useState(false);
  const [roleTitle, setRoleTitle] = useState("");
  const [roleDescription, setRoledescription] = useState("");
  const [reassignModal, setReassignModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [employeesReassignModal, setEmployeesReassignModal] = useState(null);
  const [reassignConfirmModal, setReassignConfirmModal] = useState(null);
  const [managerList, setManagerList] = useState(false);
  const [managerListData, setManagerListData] = useState([]);
  const [managerListTitle, setManagerListTitle] = useState("");
  const [allEmployeesForReassign, setAllEmployeesForReassign] = useState([]);
  const [selectedEmployeesForReassign, setSelectedEmployeesForReassign] = useState([]);
  const [isDirectReassign, setIsDirectReassign] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null);
  const [confirmRolesData, setConfirmRolesData] = useState([]);
  const [confirmTitle, setConfirmTitle] = useState("Hold on, updating the role?");
  const [confirmDescription, setConfirmDescription] = useState("");
  const [midLevelData, setMidLevelData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  const menuRef = useRef(null);
  const buttonRefs = useRef({});

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Check if it's today
    if (dateOnly.getTime() === today.getTime()) {
      return "Today";
    }

    // Format as "DD MMM 'YY"
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);

    return `${day} ${month} '${year}`;
  };

  // Format joining date helper for ManagerList
  const formatJoiningDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear().toString().slice(-2);
      return `${day} ${month} '${year}`;
    } catch (e) {
      return "";
    }
  };

  // Calculate permissions count from permissions_json
  const calculatePermissionsCount = (permissionsJson) => {
    if (!permissionsJson || typeof permissionsJson !== 'object') return 0;

    return Object.values(permissionsJson).reduce((total, permissions) => {
      return total + (Array.isArray(permissions) ? permissions.length : 0);
    }, 0);
  };

  // Load roles and compute assignment counts from employees
  const loadRolesWithAssignments = async (params = {}) => {
    try {
      setLoading(true);

      // Add pagination parameters
      const requestParams = {
        ...params,
        page_number: currentPage,
        page_size: pageSize,
      };

      const [rolesResponse] = await Promise.all([
        roleService.getRoles(requestParams)
      ]);

      if (rolesResponse?.success && rolesResponse?.code === 200 && Array.isArray(rolesResponse?.data?.roles)) {
        const transformedRoles = rolesResponse.data.roles.map((role, index) => {
          const roleId = role.id || `role-${index}`;
          return {
            id: roleId,
            name: role.name || "Unnamed Role",
            permissions: calculatePermissionsCount(role.permissions_json),
            assignment: role._count?.admins || 0,
            updated: formatDate(role.updated_at),
            created: formatDate(role.created_at),
            originalData: role,
          };
        });
        setRoles(transformedRoles);

        // Extract total count from API response
        const apiTotal = rolesResponse.data?.total ||
          rolesResponse.data?.meta?.total ||
          rolesResponse.data?.count ||
          rolesResponse.data?.roles_total ||
          rolesResponse.data?.pagination?.total ||
          rolesResponse.total ||
          rolesResponse.meta?.total;

        if (typeof apiTotal === 'number' && apiTotal >= 0) {
          setTotalCount(apiTotal);
        } else {
          // Fallback: if no total provided, use current page length
          console.warn('API did not return total count for roles, using current page length as fallback');
          setTotalCount(transformedRoles.length);
        }
      } else {
        setRoles([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Error loading roles with assignments:', err);
      setRoles([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Refetch when filters or pagination change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = {};
    if (searchValue && typeof searchValue === 'string' && searchValue.trim()) {
      params.query = searchValue.trim();
    }
    if (hideRolesWithAssignment) {
      params.hide_assigned = 'true';
    }
    loadRolesWithAssignments(params);
  }, [hideRolesWithAssignment, searchValue, currentPage, pageSize]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, hideRolesWithAssignment]);

  // Clear selections on page change
  useEffect(() => {
    setSelectedRoles(new Set());
    setSelectAll(false);
  }, [currentPage]);


  const reassignRoles = [
    { name: "Entry-level admin", count: 2, permissions: 12, type: "old" },
    { name: "Mid-level admin", count: 1, permissions: 20, type: "new" },
  ]

  // Create search suggestions based on roles data (only role names)
  const searchSuggestions = roles.length > 0
    ? Array.from(new Set(roles.map((role) => role.name))).map((name) => ({
      id: `role-${name.toLowerCase()}`,
      name: name,
      type: "Role",
    }))
    : [];

  // Click outside handling is now managed by DropdownPortal


  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedRoles(new Set(roles.map((role) => role.id)));
    } else {
      setSelectedRoles(new Set());
    }
  };

  const handleSelectRole = (roleId, checked) => {
    const newSelected = new Set(selectedRoles);
    if (checked) {
      newSelected.add(roleId);
    } else {
      newSelected.delete(roleId);
    }
    setSelectedRoles(newSelected);
    setSelectAll(newSelected.size === roles.length);
  };

  // Handle search suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSearchValue(suggestion.name);
  };
  const handleSave = async (summary) => {
    if (roleDescription && roleDescription.trim() !== "") {
      // This is edit mode - show confirmation modal with dynamic data
      try {
        const roleId = editingRole?.id || editingRole?.originalData?.id;
        const current = roles.find(r => r.id === roleId) || editingRole;
        const assignedCount = current?.assignment || 0;
        const oldPermissionsCount = calculatePermissionsCount(editingRole?.originalData?.permissions_json || {});
        const newPermissionsCount = summary?.permissionsCount ?? oldPermissionsCount;
        const roleNameForMsg = summary?.roleName || editingRole?.name || "Role";

        // Optimistically update permissions count in list immediately
        if (roleId && typeof newPermissionsCount === 'number') {
          setRoles((prev) => prev.map(r => r.id === roleId ? { ...r, permissions: newPermissionsCount, updated: 'Today' } : r));
        }

        setConfirmRolesData([
          { name: `${roleNameForMsg}`, count: assignedCount, permissions: oldPermissionsCount, type: "old" },
          { name: `${roleNameForMsg}`, count: assignedCount, permissions: newPermissionsCount, type: "new" },
        ]);
        setConfirmTitle("Hold on, updating the role?");
        setConfirmDescription(`This change will immediately affect all ${assignedCount} employees currently assigned to this role.`);
      } catch (e) {
        // Fallback
        setConfirmRolesData([]);
        setConfirmTitle("Hold on, updating the role?");
        setConfirmDescription("");
      }
      setReassignConfirmModal(true);
      setCreateNewRoleFullPage(false); // Close the edit modal
    } else {
      // This is create mode - refresh roles list after creation
      try {
        const params = {};
        if (searchValue && searchValue.trim()) params.query = searchValue.trim();
        if (hideRolesWithAssignment) params.hide_assigned = 'true';
        // Keep current page when refreshing after create
        await loadRolesWithAssignments(params);
      } catch (error) {
        console.error("Error refreshing roles:", error);
      }

      setCreateNewRoleFullPage(false);
    }
  };
  const handlePermissions = async (role) => {
    // Get the latest role data from the roles list to ensure we have the most up-to-date permissions_json
    // This is important because after updating permissions, the roles list is refreshed
    const latestRole = roles.find(r => r.id === role.id) || role;

    // Use actual role name or fallback
    const roleName = latestRole?.name || role?.name || "Role";
    setTitle(roleName);
    setDescription(" ");
    setSelectedRoleForPermissions(latestRole);

    // Get role's permissions from originalData (use latest role data)
    const rolePermissionsJson = latestRole?.originalData?.permissions_json || role?.originalData?.permissions_json || {};

    // Debug: Log the full role data to see verticals structure
    console.log('Full role data (latest from state):', latestRole);
    console.log('Role originalData:', latestRole?.originalData);
    console.log('Role permissions_json:', rolePermissionsJson);

    // Fetch permissions and verticals from API
    try {
      const [permissionsResponse, verticalsResponse] = await Promise.all([
        commonService.getPermissions(),
        customerService.getVerticals()
      ]);

      // Process permissions
      if (permissionsResponse.success && permissionsResponse.data?.permissions) {
        // Transform API response to match ExportListMod  al format
        const permissionsData = permissionsResponse.data.permissions;

        // Calculate total permissions
        const totalPermissions = Object.values(permissionsData).reduce(
          (sum, permissions) => sum + permissions.length,
          0
        );

        // Calculate selected permissions count from role's permissions_json
        const selectedCount = calculatePermissionsCount(rolePermissionsJson);

        const transformedOptions = Object.keys(permissionsData).map((moduleKey) => {
          const moduleName = moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1);
          // Get role's permissions for this module
          const roleModulePermissions = rolePermissionsJson[moduleKey] || [];

          return {
            group: moduleKey,
            title: moduleName,
            items: permissionsData[moduleKey].map((permission) => {
              // Check if this permission is selected in the role
              const isChecked = Array.isArray(roleModulePermissions) && roleModulePermissions.includes(permission);

              return {
                id: permission.toLowerCase().replace(/\s+/g, ''),
                label: permission,
                type: "checkbox",
                // make interactive in modal
                disabled: false,
                checked: isChecked,
              };
            }),
          };
        });

        setOptions(transformedOptions);
        setFooter(`${selectedCount} of ${totalPermissions} permissions`);
      }

      // Process verticals for midLevelData
      if (verticalsResponse.success && verticalsResponse.code === 200) {
        const apiVerticals = verticalsResponse.data?.verticals || verticalsResponse.data?.data?.verticals || [];

        // Get role's verticals - check multiple possible field names
        // IMPORTANT: Verticals are stored inside permissions_json.verticals (array of vertical names)
        const roleVerticals = rolePermissionsJson?.verticals ||  // Check inside permissions_json first
          role?.originalData?.verticals ||
          role?.originalData?.vertical_ids ||
          role?.originalData?.verticals_json ||
          [];

        // Normalize role verticals to array of IDs (strings)
        // Verticals from permissions_json are already strings (vertical names)
        const roleVerticalIds = Array.isArray(roleVerticals)
          ? roleVerticals.map(v => {
            if (typeof v === 'string') return v.toLowerCase();
            return (v?.id || v?.name || v)?.toString().toLowerCase();
          })
          : [];

        console.log('Role verticals from API:', roleVerticals);
        console.log('Normalized vertical IDs:', roleVerticalIds);

        const verticalsDataForModal = apiVerticals.map((v) => {
          const id = typeof v === 'string' ? v : v?.id || v?.name;
          const normalizedId = id.toString().toLowerCase();
          const label = typeof v === 'string'
            ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
            : v?.name || id;
          const normalizedLabel = label.toString().toLowerCase();

          // Check if this vertical is selected in the role
          // Compare both by ID and by label (since verticals might be stored as names in permissions_json)
          const isChecked = roleVerticalIds.includes(normalizedId) ||
            roleVerticalIds.includes(normalizedLabel);

          return {
            id: normalizedId,
            label: label,
            checked: isChecked, // allow toggling in modal
          };
        });

        console.log('Verticals data for modal:', verticalsDataForModal);
        setMidLevelData(verticalsDataForModal);
      } else {
        setMidLevelData([]);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      setOptions([]);
      setFooter("0 of 0 permissions");
    }

    setExportListModal(true);
  };

  // Open ManagerList modal with employees assigned to the clicked role
  const handleOpenManagers = async (role) => {
    try {
      const roleId = role?.id || role?.originalData?.id;
      if (!roleId) {
        setManagerListTitle(role?.name || "Employees");
        setManagerListData([]);
        setManagerList(true);
        return;
      }

      // Fetch employees for the role
      const response = await employeeService.getAdmins({ role: roleId });
      let rows = [];
      if (response?.success && response?.code === 200 && Array.isArray(response?.data?.admins)) {
        rows = response.data.admins.map((admin, index) => {
          const firstName = admin.first_name || "";
          const lastName = admin.last_name || "";
          const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Unnamed Employee";

          let phoneFormatted = "";
          if (admin.mobile_number && admin.country_code) {
            phoneFormatted = `${admin.country_code} ${admin.mobile_number}`;
          } else if (admin.mobile_number) {
            phoneFormatted = admin.mobile_number;
          }

          const joinStr = formatJoiningDate(admin.joining_date);
          const idShort = admin.id ? `#${admin.id.slice(-8)}` : "";

          return {
            id: admin.id || `emp-${index}`,
            name: fullName,
            idNumber: idShort,
            joinDate: joinStr ? `Joined ${joinStr}` : "",
            location: admin.location || "Not specified",
            phone: phoneFormatted || "Not provided",
            email: admin.email || "Not provided",
            updated: formatDate(admin.updated_at),
          };
        });
      }

      setManagerListTitle(role?.name || "Employees");
      setManagerListData(rows);
      setManagerList(true);

      // Optionally update assignment count for this role (non-breaking)
      if (rows.length >= 0) {
        setRoles((prev) => prev.map((r) => (r.id === roleId ? { ...r, assignment: rows.length } : r)));
      }
    } catch (error) {
      console.error("Error loading managers for role:", error);
      setManagerListTitle(role?.name || "Employees");
      setManagerListData([]);
      setManagerList(true);
    }
  };

  const handleDelete = () => {
    const selectedCount = selectedRoles.size;
    const firstRoleName = selectedCount > 0 ? filteredRoles.find(role => selectedRoles.has(role.id))?.name || "selected roles" : "selected roles";
    const otherCount = selectedCount - 1;

    if (selectedCount === 0) {
      setTitle("No roles selected");
      setDescription("Please select roles to delete.");
    } else if (selectedCount === 1) {
      setTitle(`Delete "${firstRoleName}" role?`);
      setDescription("This role currently has employees assigned. Reassign them to a new role before deletion.");
    } else {
      setTitle(`Delete "${firstRoleName}" and ${otherCount} other roles?`);
      setDescription("Some of the selected roles have employees assigned. Reassign them to new roles before deletion. Roles without assignees will be deleted immediately.");
    }
    setDeleteRole(true)
    setAssignees(otherCount)
  };

  const handleDeleteRole = async () => {
    try {
      const selectedCount = selectedRoles.size;

      if (selectedCount === 0) {
        showError("No roles selected for deletion");
        return;
      }

      // Delete all selected roles
      const roleIds = Array.from(selectedRoles);
      const deletePromises = roleIds.map(roleId => roleService.deleteRole(roleId));

      const results = await Promise.allSettled(deletePromises);

      // Check if all deletions were successful
      const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success && r.value?.code === 200);
      const failed = results.filter(r => r.status === 'rejected' || !r.value?.success || r.value?.code !== 200);

      if (successful.length > 0) {
        showSuccess("Success", `${successful.length} role${successful.length !== 1 ? 's' : ''} have been deleted.`);

        // Refresh roles list (reset to page 1 after deletion)
        setCurrentPage(1);
        try {
          const params = {};
          if (searchValue && searchValue.trim()) params.query = searchValue.trim();
          if (hideRolesWithAssignment) params.hide_assigned = 'true';
          await loadRolesWithAssignments(params);
        } catch (error) {
          console.error("Error refreshing roles:", error);
        }
      }

      if (failed.length > 0) {
        const errorMessages = failed.map((f, index) => {
          if (f.status === 'rejected') {
            return f.reason?.response?.data?.error || f.reason?.response?.data?.message || f.reason?.message || "Unknown error";
          }
          return f.value?.error || f.value?.message || "Failed to delete role";
        });
        showError(`${failed.length} role${failed.length !== 1 ? 's' : ''} could not be deleted: ${errorMessages.join(", ")}`);
      }

      setDeleteRole(false);
      setSelectedRoles(new Set());
      setSelectAll(false);
    } catch (error) {
      console.error("Error deleting roles:", error);
      showError("Failed to delete roles. Please try again.");
    }
  };

  const onDeleteRole = (roleId) => {
    const role = filteredRoles.find(r => r.id === roleId);
    console.log('Role ID:', roleId, 'Found role:', role); // Debug log
    const roleName = role ? role.name : "selected role";
    setTitle(`Delete "${roleName}" role?`)
    setDescription(`This role currently has ${role?.assignment || 0} employees assigned. Reassign them to a new role before deletion.`)

    // Set this single role as selected
    setSelectedRoles(new Set([roleId]));
    setDeleteRole(true)
    setAssignees(role?.assignment || 0)
  }

  // Handle single role deletion (called when user confirms in DeleteRoleModal)
  const handleSingleRoleDelete = async (roleId) => {
    try {
      const response = await roleService.deleteRole(roleId);

      if (response.success && response.code === 200) {
        const role = roles.find(r => r.id === roleId);
        const roleName = role ? role.name : "role";
        showSuccess("Success", `"${roleName}" role has been deleted.`);

        // Refresh roles list (reset to page 1 after deletion)
        setCurrentPage(1);
        try {
          const params = {};
          if (searchValue && searchValue.trim()) params.query = searchValue.trim();
          if (hideRolesWithAssignment) params.hide_assigned = 'true';
          await loadRolesWithAssignments(params);
        } catch (error) {
          console.error("Error refreshing roles:", error);
        }

        setDeleteRole(false);
        setSelectedRoles(new Set());
        setSelectAll(false);
      } else {
        const errorMsg = response.error || response.message || "Failed to delete role";
        showError(errorMsg);
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      let errorMessage = "Failed to delete role. Please try again.";

      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      showError(errorMessage);
    }
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleTitle("Edit created role")
    setRoledescription("Any changes made will take effect immediately.")
    setCreateNewRoleFullPage(true)
  }
  const handleCreateRole = () => {
    setRoleTitle("")
    setRoledescription("")
    setCreateNewRoleFullPage(true)
  }
  const handleReassign = () => {
    setManagerList(false)
    setIsDirectReassign(true)
      ; (async () => {
        try {
          const response = await employeeService.getAdmins({});
          if (response?.success && response?.code === 200 && Array.isArray(response?.data?.admins)) {
            const rows = response.data.admins.map((admin, index) => {
              const firstName = admin.first_name || "";
              const lastName = admin.last_name || "";
              const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Unnamed Employee";

              let phoneFormatted = "";
              if (admin.mobile_number && admin.country_code) {
                phoneFormatted = `${admin.country_code} ${admin.mobile_number}`;
              } else if (admin.mobile_number) {
                phoneFormatted = admin.mobile_number;
              }

              const joinStr = formatJoiningDate(admin.joining_date);
              const idShort = admin.id ? `#${admin.id.slice(-8)}` : "";

              return {
                id: admin.id || `emp-${index}`,
                name: fullName,
                idNumber: idShort,
                joinDate: joinStr ? `Joined ${joinStr}` : "",
                location: admin.location || "Not specified",
                phone: phoneFormatted || "Not provided",
                email: admin.email || "Not provided",
                updated: formatDate(admin.updated_at),
              };
            });
            setAllEmployeesForReassign(rows);
          } else {
            setAllEmployeesForReassign([]);
          }
        } catch (e) {
          console.error('Failed to fetch employees for reassign:', e);
          setAllEmployeesForReassign([]);
        } finally {
          setEmployeesReassignModal(true)
        }
      })();
  }
  const handleNext = (selectedEmployeeIds) => {
    setSelectedEmployeesForReassign(Array.isArray(selectedEmployeeIds) ? selectedEmployeeIds : [])
    setEmployeesReassignModal(false)
    setReassignModal(true)
  }
  const onDeleteNext = () => {
    setDeleteRole(false)
    setIsDirectReassign(false)
    setReassignModal(true)
  }
  const handleConfirmRoleAssign = async (selectedRole) => {
    try {
      if (!selectedRole?.id || !Array.isArray(selectedEmployeesForReassign) || selectedEmployeesForReassign.length === 0) {
        showError("Please select a role and employees.");
        return;
      }

      const response = await employeeService.bulkAssignRole(selectedRole.id, selectedEmployeesForReassign);
      if (response?.success && response?.code === 200) {
        showSuccess("Success", `${selectedEmployeesForReassign.length} employee(s) reassigned to ${selectedRole.name}.`);
        setReassignModal(false);
        setSelectedEmployeesForReassign([]);
        // Refresh roles with new assignment counts
        await loadRolesWithAssignments();
      } else {
        const errorMsg = response?.error || response?.message || "Failed to reassign role.";
        showError(errorMsg);
      }
    } catch (error) {
      console.error("Error reassigning employees:", error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Failed to reassign role.";
      showError(errorMessage);
    }
  }
  const handleConfirm = async () => {
    // After reassigning employees, proceed with role deletion
    try {
      const selectedCount = selectedRoles.size;

      if (selectedCount === 0) {
        showError("No roles selected for deletion");
        setReassignModal(false);
        return;
      }

      // Delete all selected roles after reassignment
      const roleIds = Array.from(selectedRoles);
      const deletePromises = roleIds.map(roleId => roleService.deleteRole(roleId));

      const results = await Promise.allSettled(deletePromises);

      // Check if all deletions were successful
      const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success && r.value?.code === 200);
      const failed = results.filter(r => r.status === 'rejected' || !r.value?.success || r.value?.code !== 200);

      if (successful.length > 0) {
        showSuccess("Success", `${successful.length} role${successful.length !== 1 ? 's' : ''} have been deleted.`);

        // Refresh roles list (reset to page 1 after deletion)
        setCurrentPage(1);
        try {
          const params = {};
          if (searchValue && searchValue.trim()) params.query = searchValue.trim();
          if (hideRolesWithAssignment) params.hide_assigned = 'true';
          await loadRolesWithAssignments(params);
        } catch (error) {
          console.error("Error refreshing roles:", error);
        }
      }

      if (failed.length > 0) {
        const errorMessages = failed.map((f) => {
          if (f.status === 'rejected') {
            return f.reason?.response?.data?.error || f.reason?.response?.data?.message || f.reason?.message || "Unknown error";
          }
          return f.value?.error || f.value?.message || "Failed to delete role";
        });
        showError(`${failed.length} role${failed.length !== 1 ? 's' : ''} could not be deleted: ${errorMessages.join(", ")}`);
      }

      setReassignModal(false);
      setSelectedRoles(new Set());
      setSelectAll(false);
    } catch (error) {
      console.error("Error deleting roles after reassignment:", error);
      showError("Failed to delete roles. Please try again.");
      setReassignModal(false);
    }
  }

  const handleConfirmChanges = () => {
    setReassignConfirmModal(false);
    try {
      const updatedRoleName = confirmRolesData?.[1]?.name || confirmRolesData?.[0]?.name || "Role";
      const affected = confirmRolesData?.[0]?.count ?? 0;
      showSuccess("Success", `${updatedRoleName} role has been updated. ${affected} ${affected === 1 ? 'employee' : 'employees'} now have the new permissions.`);
    } catch (e) {
      showSuccess("Success", "Role has been updated.");
    }
    // Reset the role description to clear edit mode
    setRoledescription("");
  }

  // Filter roles based on hide roles with assignment (client-side only, since assignment counts come from separate API)
  // Search filtering is handled by API via query parameter
  const filteredRoles = roles.filter((role) => {
    // Filter by hideRolesWithAssignment checkbox (client-side since assignment counts are computed separately)
    if (hideRolesWithAssignment && role.assignment > 0) {
      return false;
    }
    return true;
  });

  // Group roles by role name
  const groupRolesByName = () => {
    const groupedRoles = {};
    filteredRoles.forEach((role) => {
      if (!groupedRoles[role.name]) {
        groupedRoles[role.name] = [];
      }
      groupedRoles[role.name].push(role);
    });

    return Object.keys(groupedRoles).map((roleName) => ({
      name: roleName.toUpperCase(),
      items: groupedRoles[roleName],
    }));
  };

  // Render table content for each group
  const renderGroupTable = (group) => (
    <div className="">
      <Table className="min-w-full">
        <TableHead>
          <TableRow>
            <TableCell className="w-12 px-3 py-3">
              <TableCheckbox checked={false} onChange={() => { }} />
            </TableCell>
            <TableCell className="px-3 py-3 text-sm font-medium text-[var(--color-stroke-brand)]">
              Role
            </TableCell>
            <TableCell className="px-3 py-3 text-sm font-medium text-[var(--color-stroke-brand)] w-32">
              Assignment
            </TableCell>
            <TableCell className="px-2 py-3 text-sm font-medium text-[var(--color-stroke-brand)] w-28">
              Updated
            </TableCell>
            <TableCell className="px-2 py-3 text-sm font-medium text-[var(--color-stroke-brand)] w-32">
              Created
            </TableCell>
            <TableCell className="px-3 py-3 w-40"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {group.items.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="w-12 px-3 py-3">
                <TableCheckbox
                  checked={selectedRoles.has(role.id)}
                  onChange={(e) => handleSelectRole(role.id, e.target.checked)}
                />
              </TableCell>
              <TableCell className="px-3 py-3">
                <div className="flex flex-col gap-1">
                  <div className="font-semibold text-base text-[var(--color-neutral-secondary)]">
                    {role.name}
                  </div>
                  <div className="text-sm text-[var(--color-stroke-brand)]">
                    {role.permissions} permissions
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-3 py-3 w-32">
                <CustomTooltip
                  title="View list"
                  placement="bottom"
                  arrowPosition="left"
                >
                  <button
                    type="button"
                    className={`group transition-all duration-200 outline-none border ${role.assignment > 0 ? "border-[var(--color-admin-profile-border)]" : "border-[var(--color-box-border)]"} hover:border-[var(--info-panel-view-bg)] bg-white hover:bg-[var(--color-admin-profile-border)] rounded-full px-4 py-2 flex items-center gap-2 text-base font-normal select-none focus:ring-2 focus:ring-[var(--color-brand-default)] w-fit`}
                    style={{ minWidth: 64 }}
                    onClick={() => handleOpenManagers(role)}
                  >
                    <Icon name="two_users" className={`w-5 h-5 ${role.assignment > 0 ? "text-[var(--info-panel-view-bg)]" : "text-[var(--color-neutral-light)] group-hover:text-[var(--color-brand-default)]"} transition-colors`} />
                    <span className="text-[var(--color-neutral-secondary)] text-sm font-normal">{role.assignment}</span>
                  </button>
                </CustomTooltip>
              </TableCell>
              <TableCell className="px-2 py-3 text-[var(--color-neutral-secondary)] text-base w-28 whitespace-nowrap">
                {role.updated}
              </TableCell>
              <TableCell className="px-2 py-3 text-[var(--color-neutral-secondary)] text-base w-32 whitespace-nowrap">
                {role.created}
              </TableCell>
              <TableCell className="px-3 py-3 w-40">
                <div className="flex items-center gap-2">
                  {canEditRoles && (
                    <Button
                      variant="grayOutline"
                      className="text-xs px-2 py-1 h-auto font-medium whitespace-nowrap"
                      onClick={() => handlePermissions(role)}
                    >
                      PERMISSIONS
                    </Button>
                  )}
                  {(canEditRoles || canDeleteRoles) && (
                    <button className="p-1 hover:bg-[var(--color-neutral-secondary-bg)] rounded flex-shrink-0">
                      <BsThreeDotsVertical className="w-4 h-4 text-[var(--color-stroke-brand)]" />
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (!canViewRoles) return null;

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-start gap-4">
          <Link href="/employees/list">
            <Button variant="cancel" className="!p-2 pt-1">
              <IoChevronBack className="w-4 h-4 text-[var(--color-stroke-brand)]" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-[var(--color-neutral-primary)]">
              Manage roles
            </h1>
            <p className="text-base text-[var(--color-stroke-brand)] ">
              Roles define what employees can and cannot do inside the platform.
            </p>
          </div>
        </div>
        {canAddRoles && (
          <Button
            variant="secondary"
            onClick={handleCreateRole}
            className="flex gap-2 items-center font-medium btn-size-md-sm"
          >
            <LuPlus className="w-4 h-4 text-center" />
            CREATE NEW
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-64 pl-1">
            <SearchWithSuggestions
              data={searchSuggestions}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSelect={handleSuggestionSelect}
              getLabel={(item) => item.name}
              getSubLabel={(item) => item.type}
              placeholder="Search role"
              clearable={true}
              onClear={() => setSearchValue("")}
              className="[&_input]:!h-8 [&_input]:!py-1"
              minChars={1}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--color-stroke-brand)]">
            Showing {roles.length} of {totalCount}
          </span>
          <label className="flex items-center gap-2 text-lg text-[var(--color-neutral-secondary)]">
            <CheckBox
              checked={hideRolesWithAssignment}
              onChange={(e) => setHideRolesWithAssignment(e.target.checked)}
            />
            Hide roles with assignment
          </label>
        </div>
      </div>
      {/* {hideRolesWithAssignment ? (
        <GroupCollapseTable
          groups={groupRolesByName()}
          openIndex={openGroupIndex}
          setOpenIndex={setOpenGroupIndex}
          renderTable={renderGroupTable}
          noResultsMessage="No roles found."
          tableContainerClass="w-full"
        />
      ) : ( */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[var(--color-neutral-secondary)]">Loading roles...</div>
        </div>
      ) : (
        <div className="">
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalCount}
            onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onNext={() => {
              const totalPages = Math.ceil(totalCount / pageSize);
              if (currentPage < totalPages) {
                setCurrentPage((p) => p + 1);
              }
            }}
          />
          <Table className="min-w-full">
            <TableHead>
              <TableRow>
                <TableCell className="w-12 px-3 py-3">
                  <TableCheckbox
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    indeterminate={
                      selectedRoles.size > 0 &&
                      selectedRoles.size < filteredRoles.length &&
                      filteredRoles.length > 0
                    }
                  />
                </TableCell>
                <TableCell className="px-3 py-3 !text-sm font-medium text-[var(--color-stroke-brand)]">
                  Role
                </TableCell>
                <TableCell className="px-3 py-3 !text-sm font-medium text-[var(--color-stroke-brand)] w-32">
                  Assignment
                </TableCell>
                <TableCell className="px-2 py-3 !text-sm font-medium text-[var(--color-stroke-brand)] w-28">
                  Updated
                </TableCell>
                <TableCell className="px-2 py-3 !text-sm font-medium text-[var(--color-stroke-brand)] w-32">
                  Created
                </TableCell>
                <TableCell className="px-3 py-3 w-40"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-3 py-8 text-center text-[var(--color-stroke-brand)]">
                    No roles found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="px-3 py-3">
                      <TableCheckbox
                        checked={selectedRoles.has(role.id)}
                        onChange={(e) =>
                          handleSelectRole(role.id, e.target.checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="font-semibold text-base text-[var(--color-neutral-secondary)]">
                          {role.name}
                        </div>
                        <div className="text-sm text-[var(--color-stroke-brand)]">
                          {role.permissions} permissions
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <CustomTooltip
                        title="View list"
                        placement="bottom"
                        arrowPosition="left"
                        onClick={() => handleOpenManagers(role)}
                      >
                        <button
                          type="button"
                          className={`group transition-all duration-200 outline-none border ${role.assignment > 0 ? "border-[var(--color-admin-profile-border)]" : "border-[var(--color-box-border)]"} hover:border-[var(--info-panel-view-bg)] bg-white hover:bg-[var(--color-admin-profile-border)] rounded-full !px-3 !py-2 flex items-center gap-2 text-base font-normal select-none focus:ring-2 focus:ring-[var(--color-brand-default)]`}
                          style={{ minWidth: 64 }}
                        >
                          <Icon name="two_users" className={`w-5 h-5 ${role.assignment > 0 ? "text-[var(--info-panel-view-bg)]" : "text-[var(--color-neutral-light)] group-hover:text-[var(--color-brand-default)]"} transition-colors`} />
                          <span className="text-[var(--color-neutral-secondary)] text-sm font-normal leading-none">{role.assignment}</span>
                        </button>
                      </CustomTooltip>
                    </TableCell>
                    <TableCell className="px-2 py-3 text-[var(--color-neutral-secondary)] text-base whitespace-nowrap">
                      {role.updated}
                    </TableCell>
                    <TableCell className="px-2 py-3 text-[var(--color-neutral-secondary)] text-base whitespace-nowrap">
                      <BoxCountBadge
                        asText
                        tooltipSide="bottom"
                        tooltipAlign="end"
                        tooltipContent={
                          <div className="space-y-2">
                            <div className="text-[var(--color-stroke-brand)] text-xs text-right">
                              Created by You
                            </div>
                          </div>
                        }
                      >
                        <span className="cursor-default hover:underline">
                          {role.created}
                        </span>
                      </BoxCountBadge>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {canEditRoles && (
                          <Button
                            variant="grayOutline"
                            size="sm"
                            className="!text-sm !px-3 !py-2 leading-none h-auto font-medium whitespace-nowrap"
                            onClick={() => handlePermissions(role)}
                          >
                            PERMISSIONS
                          </Button>
                        )}
                        {(canEditRoles || canDeleteRoles) && (
                          <>
                            <button
                              ref={(el) => (buttonRefs.current[role.id] = el)}
                              onClick={() => setOpenMenuId(openMenuId === role.id ? null : role.id)}
                              className={`p-2 hover:bg-[var(--color-neutral-secondary-bg)] ${openMenuId === role.id ? "bg-[var(--color-neutral-secondary-bg)] shadow-[0_0_0_2px_var(--color-shadow-actionmenu)] rounded-lg" : ""} rounded flex-shrink-0`}
                            >
                              <BsThreeDotsVertical className="w-4 h-4 text-[var(--color-stroke-brand)]" />
                            </button>
                            <DropdownPortal
                              targetRef={
                                buttonRefs.current[role.id]
                                  ? { current: buttonRefs.current[role.id] }
                                  : null
                              }
                              open={openMenuId === role.id}
                              onClose={() => setOpenMenuId(null)}
                            >
                              <div className="w-52 bg-white border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] rounded-lg shadow-[4px_4px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)]">
                                {canEditRoles && (
                                  <button onClick={() => { handleEditRole(role); setOpenMenuId(null) }} className={`w-full text-left px-4 py-2 flex items-center gap-2 text-[var(--color-neutral-secondary)] text-sm hover:bg-[var(--color-neutral-secondary-bg)] transition-colors`}>
                                    <PencilLine
                                      className="w-5 h-5 !text-[var(--color-neutral-light)]"
                                    />
                                    Edit Role Details
                                  </button>
                                )}
                                {canDeleteRoles && (
                                  <button onClick={() => { onDeleteRole(role.id); setOpenMenuId(null) }} className="w-full text-left px-4 py-2 flex items-center gap-2 text-[var(--color-neutral-secondary)] text-sm hover:bg-[var(--color-neutral-secondary-bg)] transition-colors">
                                    <Trash2 className="w-5 h-5 text-[var(--notif-error)]" />
                                    Delete role
                                  </button>
                                )}
                              </div>
                            </DropdownPortal>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )))}
            </TableBody>
          </Table>
          <TableActionBar
            selectedCount={filteredRoles.filter(role => selectedRoles.has(role.id)).length}
            onClearSelection={() => {
              setSelectedRoles(new Set());
              setSelectAll(false);
            }}
            onRoles={true}
            onDelete={canDeleteRoles ? handleDelete : undefined}
            allowDelete={canDeleteRoles}
          />
        </div>
      )}
      {/* )} */}
      {/* <CreateNewRole
        open={createNewRole}
        onClose={() => setCreateNewRole(false)}
        onSave={handleSave}
        title={roleTitle}
        description={roleDescription}
      /> */}
      <CreateNewRoleFullPage
        open={createNewRoleFullPage}
        onClose={() => {
          setCreateNewRoleFullPage(false);
          setEditingRole(null);
        }}
        onSave={handleSave}
        title={roleTitle}
        description={roleDescription}
        editRole={editingRole}
      />
      <ExportListModal
        open={exportListModal}
        onClose={() => setExportListModal(false)}
        options={options}
        title={title}
        midLevelData={midLevelData}
        description={description}
        footer={footer}
        onConfirm={async ({ checked }) => {
          try {
            // Build permissions and verticals payload from checked map
            const permissionsPayload = {};
            (options || []).forEach((group) => {
              const selectedPerms = (group.items || [])
                .filter((opt) => opt.type === 'checkbox' && checked[opt.id])
                .map((opt) => opt.label);
              if (selectedPerms.length) {
                permissionsPayload[group.group] = selectedPerms;
              }
            });
            // Add verticals inside permissions object with their names
            const selectedVerticalNames = (midLevelData || [])
              .filter((v) => checked[v.id])
              .map((v) => v.label);
            if (selectedVerticalNames.length > 0) {
              permissionsPayload.verticals = selectedVerticalNames;
            }
            const roleId = selectedRoleForPermissions?.originalData?.id || selectedRoleForPermissions?.id;
            if (!roleId) {
              showError('Invalid role id');
              return;
            }

            // Ensure permissions object is not empty
            if (Object.keys(permissionsPayload).length === 0) {
              showError('Please select at least one permission');
              return;
            }

            // Convert roleId to string to ensure proper URL construction
            const roleIdString = String(roleId).trim();
            console.log('Updating role with:', { roleId: roleIdString, permissionsPayload, selectedRoleForPermissions });

            console.log("onConfirm - selectedRoleForPermissions:", selectedRoleForPermissions);
            console.log("onConfirm - roleId:", roleId);
            console.log("onConfirm - roleIdString:", roleIdString);
            console.log("onConfirm - permissionsPayload:", permissionsPayload);

            const response = await roleService.updateRole(roleIdString, {
              permissions: permissionsPayload,
              is_super_admin: selectedRoleForPermissions?.originalData?.is_super_admin ?? false,
            });

            console.log('Update role response:', response);
            if (response?.success && response?.code === 200) {
              // Update counts optimistically in list (exclude verticals from count)
              const newCount = Object.entries(permissionsPayload)
                .filter(([key]) => key !== 'verticals')
                .reduce((n, [, arr]) => n + (Array.isArray(arr) ? arr.length : 0), 0);

              // Update the role in the list with new permissions_json and counts
              setRoles((prev) => prev.map((r) => {
                if (r.id === roleId) {
                  return {
                    ...r,
                    permissions: newCount,
                    updated: 'Today',
                    originalData: {
                      ...(r.originalData || {}),
                      permissions_json: permissionsPayload, // Update permissions_json in the role
                    }
                  };
                }
                return r;
              }));

              // Also update selected role cache so reopening modal shows latest
              setSelectedRoleForPermissions((prev) => prev ? {
                ...prev,
                originalData: {
                  ...(prev.originalData || {}),
                  permissions_json: permissionsPayload,
                }
              } : prev);

              // Close modal first for better UX
              setExportListModal(false);

              // Refresh list from server to ensure full consistency (keep current page)
              // This ensures the next time modal opens, it has the latest data
              try {
                const params = {};
                if (searchValue && searchValue.trim()) params.query = searchValue.trim();
                if (hideRolesWithAssignment) params.hide_assigned = 'true';
                await loadRolesWithAssignments(params);
              } catch (error) {
                console.error('Error refreshing roles after update:', error);
              }

              showSuccess('Success', `${title} role has been updated.`);
            } else {
              showError(response?.error || response?.message || 'Failed to update role');
            }
          } catch (e) {
            console.error('Failed to update role from permissions modal:', e);
            showError(e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to update role');
          }
        }}
      />
      <DeleteRoleModal
        open={deleteRole}
        title={title}
        description={description}
        onClose={() => {
          setDeleteRole(false);
          // Don't clear selectedRoles here in case user cancels
        }}
        onDelete={handleDeleteRole}
        onNext={onDeleteNext}
        assignees={assignees}
      />
      <ManagerList
        open={managerList}
        onClose={() => setManagerList(false)}
        onReassign={handleReassign}
        managers={managerListData}
        title={managerListTitle}
      />
      <SelectEmplyeesReassign
        open={employeesReassignModal}
        onClose={() => setEmployeesReassignModal(false)}
        onNext={handleNext}
        employees={allEmployeesForReassign}
      />
      <ReassignRoleModal
        open={reassignModal}
        onClose={() => setReassignModal(false)}
        onConfirm={isDirectReassign ? handleConfirmRoleAssign : handleConfirm}
        title={isDirectReassign ? `Reassign role to ${selectedEmployeesForReassign.length} employees` : `Reassign role to ${selectedRoles.size} employees`}
        description="Their previous access will be updated with the new permissions. It won't remove their records, only their access changes."
      />
      <ReassignConfirmModal
        open={reassignConfirmModal}
        onClose={() => setReassignConfirmModal(false)}
        onConfirmChanges={handleConfirmChanges}
        title={confirmTitle}
        description={confirmDescription}
        roles={confirmRolesData}
      />
    </div>
  );
};

export default ManageRoles;
