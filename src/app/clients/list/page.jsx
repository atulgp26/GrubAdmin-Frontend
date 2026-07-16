"use client";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
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
import { formatDate } from "@/utils/formatDate";
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
import ExportListModal from "@/components/pages/employees/ExportListModal";
import SuspendEmployeeModal from "@/components/pages/employees/SuspendEmployeeModal";
import { showSuccess, showError } from "@/components/ui/toast";
import DeleteEmployeeModal from "@/components/pages/employees/DeleteEmployeeModal";
import { useRouter } from "next/navigation";
import CustomTooltip from "@/components/ui/CustomTooltip";
import Link from "next/link";
import { customerService } from "@/api/services/customerService";
import LoadingDetails from "@/components/ui/LoadingDetails";
import EmptyState from "@/components/ui/EmptyState";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import InfoPanel from "@/components/common/InfoPanel";
import { usePermissions } from "@/context/PermissionContext";
import { useAuth } from "@/context/AuthContext";
import { useImpersonation } from "@/context/ImpersonationContext";
import AddNewClient from "@/components/pages/clients/AddNewClient";
import { useDebounce } from "use-debounce";
import {
	DEBOUNCE_TIME,
	DEFAULT_PAGE_NUMBER,
	DEFAULT_PAGE_SIZE,
} from "@/constants/config";
import CollapseTable from "@/components/shared/CollapseTable";
import ClientBoxesModal from "@/components/pages/clients/ClientBoxesModal";

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
			{
				id: "activateemployees",
				label: "Activate employees",
				type: "checkbox",
				disabled: true,
			},
			{
				id: "exportemployees",
				label: "Export employees",
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
			{ id: "allClients", label: "All clients", type: "radio" },
			{
				id: "filteredList",
				label: "As per the filtered list",
				type: "radio",
			},
			{ id: "onlyMedical", label: "Only Medical", type: "radio" },
			{ id: "onlyDelivery", label: "Only Delivery", type: "radio" },
			{ id: "onlyHospitality", label: "Only Hospitality", type: "radio" },
			{ id: "onlyCamping", label: "Only Camping", type: "radio" },
		],
	},
	{
		group: "details",
		title: "Extra details",
		items: [
			{ id: "activityLogs", label: "Activity logs", type: "checkbox" },
		],
	},
];

const ClientsList = () => {
	const [searchValue, setSearchValue] = useState("");
	const [forceRefetch, setForceRefetch] = useState(false);
	const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
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
	const [currentOpenVertical, setCurrentOpenVertical] = useState(null);
	const [addNewClient, setAddNewClient] = useState(false);
	const buttonRefs = useRef({});
	const [footer, setFooter] = useState("");
	const router = useRouter();
	const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE_NUMBER);
	const [totalItems, setTotalItems] = useState(0);
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const pageSize = DEFAULT_PAGE_SIZE;
	const { permissionsByModule, user, can } = usePermissions();
	const { startImpersonation } = useImpersonation();
	const [selectedBoxClient, setSelectedBoxClient] = useState(null);
	const canViewClients =
		can("view clients list", "clients") ||
		can("view entries", "clients") ||
		can("view clients list") ||
		can("view entries");
	// Clients module specific permissions from backend
	const canAddClient =
		can("add new entries", "clients") || can("add new entries");
	const canExportClients =
		can("export clients list", "clients") ||
		can("export entries", "clients") ||
		can("export clients list") ||
		can("export entries");
	const canDeleteClients =
		can("delete entries", "clients") || can("delete entries");

	const [debouncedSearchValue] = useDebounce(searchValue, DEBOUNCE_TIME);

	// API data states
	const [verticals, setVerticals] = useState([]);
	const [customers, setCustomers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searching, setSearching] = useState(false);
	const [error, setError] = useState(null);
	const isInitialMount = useRef(true);

	const onKeywordChange = (e) => {
		setSearchValue(e.target.value);
	};

	const handleOpenGmail = (email) => {
		const sanitizedEmail = (email || "").trim();
		if (!sanitizedEmail) {
			showError("Client email is not available.");
			return;
		}

		const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(sanitizedEmail)}`;
		window.open(gmailUrl, "_blank", "noopener,noreferrer");
	};

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/login");
		}
	}, [isAuthenticated, authLoading, router]);

	const fetchVerticals = useCallback(async () => {
		try {
			const response = await customerService.getVerticals();
			if (response?.success && response?.code === 200) {
				const apiVerticals = response.data?.verticals || [];
				setVerticals(apiVerticals);
			}
		} catch (error) {
			console.error("Failed to fetch verticals:", error);
		}
	}, []);

	const fetchCustomers = useCallback(async () => {
		try {
			if (isInitialMount.current) {
				setLoading(true);
			} else {
				setSearching(true);
			}
			const params = {};
			if (selectedRole.length > 0) {
				params.filter = selectedRole;
			}
			if (debouncedSearchValue) {
				params.query = debouncedSearchValue;
			}
			params.page_number = currentPage;
			params.page_size = pageSize;

			const response = await customerService.getCustomers(params);
			if (response?.success && response?.code === 200) {
				setCustomers(response.data?.customers || []);
				setTotalItems(
					response.pagination?.total_count ??
						response.data?.count ??
						0,
				);
				setError(null);
			} else {
				showError("Failed to load customers data");
				setError("Failed to load data");
			}
		} catch (error) {
			console.error("Data fetch error:", error);
			showError("Failed to load data");
			setError("Failed to load data");
		} finally {
			setLoading(false);
			setSearching(false);
		}
	}, [selectedRole, debouncedSearchValue, currentPage]);

	useEffect(() => {
		if (isAuthenticated && user && permissionsByModule) {
			fetchVerticals();
		}
	}, [fetchVerticals, isAuthenticated, user, permissionsByModule]);

	useEffect(() => {
		if (isAuthenticated) {
			fetchCustomers();
			isInitialMount.current = false;
		}
	}, [isAuthenticated, fetchCustomers]);

	useEffect(() => {
		if (isAuthenticated && forceRefetch) {
			fetchCustomers();
			setForceRefetch(false);
		}
	}, [isAuthenticated, forceRefetch, fetchCustomers]);

	const onCreateCustomer = useCallback(async (formData) => {
		setIsCreatingCustomer(true);
		try {
			const res = await customerService.createCustomer(formData);
			if (res?.success) {
				setForceRefetch(true);
				return {
					message:
						res.message ||
						res.data?.message ||
						"Client added successfully!",
				};
			} else {
				return {
					error:
						res?.error || res?.message || "Failed to create client",
				};
			}
		} catch (e) {
			return { error: "Failed to create client" };
		} finally {
			setIsCreatingCustomer(false);
		}
	}, []);

	// TODO: Implement auth checks to actually verify the user is authenticated not. If not then never call the api.

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuOpen && !event.target.closest(".menu-container")) {
				setMenuOpen(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [menuOpen]);

	// Use real customers data from API
	const processedCustomers = useMemo(
		() =>
			customers.map((customer) => {
				const verticalName = customer?.vertical?.name || "unknown";
				const verticalId = customer?.vertical?.id ?? null;
				const boxCount = customer?._count?.boxes ?? 0;

				return {
					id: customer.id,
					client_id: customer.client_id,
					name: customer.name,
					organization: customer.organization_name || "Not specified",
				region:
					customer.state
						? `${customer.state}, ${customer.country}`
						: customer.country || "Not specified",
					vertical: verticalName,
					verticalId: verticalId,
					updated: formatDate(customer.updated_at),
					email: customer.email,
					contact: customer.mobile_number,
					boxCount: boxCount,
				};
			}),
		[customers],
	);

	// Get role options from API data
	const roleOptions = useMemo(
		() =>
			verticals.map((vertical) => ({
				id: vertical.name.toLowerCase(),
				label:
					vertical.name.charAt(0).toUpperCase() +
					vertical.name.slice(1).toLowerCase(),
			})),
		[verticals],
	);

	// Create search suggestions based on API verticals
	const searchSuggestions = useMemo(() => {
		console.log({
			processedCustomers,
		});

		return [
			// Client names with their vertical as sub-label
			...processedCustomers.map((client) => ({
				id: `client-${client.id}`,
				name: client.name,
				type: client.vertical,
			})),
			// Vertical names from API
			...verticals.map((vertical) => ({
				id: `vertical-${vertical.name.toLowerCase()}`,
				name: vertical.name,
				type: "Vertical",
			})),
		];
	}, [processedCustomers, verticals]);

	// Filter clients based on search value and selected verticals
	const filteredClients = useMemo(
		() =>
			processedCustomers.filter((client) => {
				const matchesSearch =
					!searchValue ||
					client.name
						.toLowerCase()
						.includes(searchValue.toLowerCase()) ||
					client.vertical
						.toLowerCase()
						.includes(searchValue.toLowerCase()) ||
					client.client_id
						.toLowerCase()
						.includes(searchValue.toLowerCase()) ||
					client.organization
						.toLowerCase()
						.includes(searchValue.toLowerCase());

				const matchesVertical =
					selectedRole.length === 0 ||
					selectedRole.includes(client.vertical.toLowerCase());

				return matchesSearch && matchesVertical;
			}),
		[processedCustomers, searchValue, selectedRole],
	);

	// const totalItems = filteredClients.length;
	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(totalItems / pageSize)),
		[totalItems],
	);
	const startIndex = useMemo(
		() => (currentPage - 1) * pageSize,
		[currentPage],
	);
	const endIndexExclusive = useMemo(
		() => Math.min(startIndex + pageSize, totalItems),
		[startIndex, totalItems],
	);
	const pageStartDisplay = useMemo(
		() => (totalItems === 0 ? 0 : startIndex) + 1,
		[totalItems, startIndex],
	);
	const pageEndDisplay = endIndexExclusive;
	// const visibleClients = filteredClients.slice(startIndex, endIndexExclusive);

	const reassignRoles = [
		{ name: "Manager", count: 2, permissions: 12, type: "old" },
		{ name: "S. Manager", count: 1, permissions: 12, type: "old" },
		{ name: "Regional head", count: 3, permissions: 12, type: "old" },
		{ name: "Relation manager", count: 0, permissions: 20, type: "new" },
	];

	const actions = [
		{
			id: "account",
			icon: "computer_access",
			title: "Access complete account",
			description:
				"Open the client’s full account as they see it, to assist with onboarding and troubleshooting.",
		},
		{
			id: "logs",
			icon: "profile_note",
			title: "View logs",
			description: "Track all actions and changes made for this client.",
		},
	];
	const quickActions = [
		{
			id: "faqs",
			title: "Check FAQs",
			description:
				"View FAQs and guidelines most relevant to this client’s vertical.",
		},
		{
			id: "checkgrubpacs",
			title: "Check GrubPacs",
			description:
				"See all GrubPacs assigned to this client with status and details.",
		},
	];

	const handleRowAction = (action) => {
		console.log("Action selected:", action);
		switch (action) {
			case "edit":
				// handle edit logic
				break;
			case "reassign":
				setOpenReassignModal(true);
				break;
			case "suspend":
				setSuspendEmployeeModal(true);
				break;
			case "delete":
				setDeleteEmployeeModal(true);
				break;
			default:
				break;
		}
	};

	const handleSelectAll = (checked) => {
		setSelectAll(checked);
		if (checked) {
			setSelectedEmployees(
				new Set(processedCustomers.map((emp) => emp.id)),
			);
		} else {
			setSelectedEmployees(new Set());
		}
	};
	const handleReassignConfirm = () => {
		setReassignConfirmModal(true);
	};
	const handleSuspend = () => {
		showSuccess("Success", "[X employees] have been suspended.");
		setSuspendEmployeeModal(false);
	};
	const handleDelete = () => {
		const count = selectedEmployees.size;
		showSuccess(
			"Success!",
			`${count} ${count === 1 ? "client has" : "clients have"} been deleted.`,
		);
		setDeleteEmployeeModal(false);
		setSelectedEmployees(new Set());
		setSelectAll(false);
	};
	const handleActionClick = (id) => {
		switch (id) {
			case "transferownership":
				router.push("/transfer-ownership");
				break;
			case "deletesetup":
				setDeleteEmployeeModal(true);
				setMenuOpen(null);
				break;
			default:
				null;
		}
	};

	// Handle Check FAQs - navigate to FAQ page scoped to the client's vertical
	const handleCheckFAQs = (e, customer) => {
		e.stopPropagation();
		setMenuOpen(null);
		const verticalName = customer?.vertical;
		if (!verticalName || verticalName === "unknown") {
			showSuccess("Notice", "No vertical assigned, showing general FAQs.");
			router.push("/help/customer-faqs");
			return;
		}
		router.push(`/help/customer-faqs?vertical=${encodeURIComponent(verticalName.toLowerCase())}`);
	};

	// Handle Check GrubPacs - impersonate client and go to their GrubPacs module
	const handleCheckGrubPacs = async (e, customer) => {
		e.stopPropagation();
		setMenuOpen(null);
		if (!customer?.id) {
			showError("Client ID is missing");
			return;
		}
		try {
			showSuccess("Accessing...", "Initiating client GrubPacs access.");
			const response = await customerService.impersonateClient(customer.id, {
				return_url: "/delivery/grubpacs",
			});
			if (response?.success && response?.code === 200) {
				const { token, client, redirect_url } = response.data;

				startImpersonation(client, token);

				if (redirect_url) {
					window.open(redirect_url, "_blank", "noopener,noreferrer");
				}

				showSuccess(
					response.message_toast_title || "Access Granted",
					response.message_toast_description || "Client GrubPacs access granted. A new tab has been opened with the client's GrubPacs.",
				);
			} else {
				const errorMsg =
					response?.message ||
					response?.error ||
					response?.data?.error ||
					"Failed to access client GrubPacs";
				showError(errorMsg);
			}
		} catch (error) {
			console.error("[Check GrubPacs] Error:", error);
			const errorMsg =
				error?.response?.data?.message ||
				error?.message ||
				error?.data?.error ||
				"An unexpected error occurred. Please try again.";
			showError(errorMsg);
		}
	};

	const handleExportDetails = () => {
		setOptions(exportOptions);
		setExportListModal(true);
	};

	const handleExportConfirm = async ({ scope, checked }) => {
		try {
			setExportListModal(false);

			// Build export parameters based on selected options
			const params = {};

			// Handle scope (radio selection)
			if (scope === "allClients" || !scope) {
				// All clients (default if nothing selected)
				params.fetch_all = true;
			} else if (scope === "filteredList") {
				// As per the filtered list - use current filters
				params.fetch_all = false;
				if (selectedRole.length > 0) {
					// Send all selected verticals as array (will be serialized as filter=medical&filter=hospitality)
					// Filter out any invalid values like "admin"
					const validFilters = selectedRole
						.map((role) => role.toLowerCase())
						.filter((role) => role !== "admin");
					console.log(validFilters);
					if (validFilters.length > 0) {
						params.filter = validFilters; // Array will be serialized as repeated query params
					}
				}
			} else if (scope) {
				// Specific vertical (Only Medical, Only Delivery, etc.)
				const verticalMap = {
					onlyMedical: "medical",
					onlyDelivery: "delivery",
					onlyHospitality: "hospitality",
					onlyCamping: "camping",
				};
				const vertical = verticalMap[scope];
				if (vertical) {
					params.filter = [vertical]; // Send as array for consistency
					params.fetch_all = true;
				}
			} else {
				// Default to all if nothing selected
				params.fetch_all = true;
			}

			// Always include search query if provided (matches Postman behavior)
			if (searchValue && searchValue.trim()) {
				params.query = searchValue.trim();
			}

			// Handle extra details
			if (checked.activityLogs) {
				params.activity_logs = true;
			}

			console.log("Exporting with params:", params);

			// Call export API and download file
			const response = await customerService.exportCustomers(params);

			// Handle file download - response can be object with blob, blob directly, or JSON
			let blob = null;
			let filename = `customers_export_${new Date().toISOString().split("T")[0]}.csv`;

			if (response && typeof response === "object" && response.blob) {
				// Response is object with blob property
				blob = response.blob;
				filename = response.filename || filename;
			} else if (response instanceof Blob) {
				// Direct blob response
				blob = response;
			} else if (response && response.success) {
				// JSON response with download URL or file data
				// If API returns JSON with download URL
				if (response.data?.downloadUrl) {
					window.open(response.data.downloadUrl, "_blank");
					showSuccess("Success!", "Export file download started.");
				} else if (response.data?.file) {
					// If API returns file data as base64 or blob
					downloadFile(
						response.data.file,
						response.data.filename || "customers_export.csv",
					);
					showSuccess(
						"Success!",
						"Export file downloaded successfully.",
					);
				} else {
					showSuccess(
						"Success!",
						"Export request processed successfully.",
					);
				}
				return;
			}

			// If we have a blob, download it
			if (blob) {
				console.log(
					"Received blob, size:",
					blob.size,
					"type:",
					blob.type,
				);

				if (blob.size === 0) {
					showError(
						"Export file is empty. Please check your filters and try again.",
					);
					return;
				}

				// Trigger download immediately for faster response
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = filename;
				a.style.display = "none";
				document.body.appendChild(a);
				a.click();

				// Clean up after a short delay
				setTimeout(() => {
					window.URL.revokeObjectURL(url);
					document.body.removeChild(a);
				}, 100);

				showSuccess("Success!", "Export file downloaded successfully.");
			} else {
				// Check if response has error message
				const errorMsg =
					response?.message ||
					response?.error ||
					"Failed to export. Please try again.";
				showError(errorMsg);
			}
		} catch (error) {
			console.error("Export error:", error);
			const errorMessage =
				error.message ||
				"Failed to export customers. Please try again.";
			showError(errorMessage);
		}
	};

	// Handle Access Complete Account - impersonate client
	const handleAccessAccount = async (customer) => {
		setMenuOpen(null);
		try {
			showSuccess("Accessing...", "Initiating client account access.");
			const response = await customerService.impersonateClient(customer.id);
			if (response?.success && response?.code === 200) {
				const { token, client, redirect_url } = response.data;

				startImpersonation(client, token);

				if (redirect_url) {
					window.open(redirect_url, "_blank", "noopener,noreferrer");
				}

				showSuccess(
					response.message_toast_title || "Access Granted",
					response.message_toast_description || "Client account access granted. A new tab has been opened with the client's delivery account.",
				);
			} else {
				const errorMsg =
					response?.message ||
					response?.error ||
					response?.data?.error ||
					"Failed to access client account";
				showError(errorMsg);
			}
		} catch (error) {
			console.error("[Access Account] Error:", error);
			const errorMsg =
				error?.response?.data?.message ||
				error?.message ||
				error?.data?.error ||
				"An unexpected error occurred. Please try again.";
			showError(errorMsg);
		}
	};

	// Helper function to download file
	const downloadFile = (fileData, filename) => {
		try {
			// If fileData is base64
			if (typeof fileData === "string" && fileData.startsWith("data:")) {
				const link = document.createElement("a");
				link.href = fileData;
				link.download = filename;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			} else {
				// If fileData is blob URL or other format
				const blob = new Blob([fileData], { type: "text/csv" });
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = filename;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
			}
		} catch (error) {
			console.error("File download error:", error);
			showError("Failed to download file.");
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

	// Handle search suggestion selection
	const handleSuggestionSelect = (suggestion) => {
		setSearchValue(suggestion.name);
	};
	const onReassign = () => {
		setOpenReassignModal(true);
	};
	const handleConfirmChanges = () => {
		setReassignConfirmModal(false);
		showSuccess(
			"Success",
			"Roles updated: [X employees] now assigned as [New Role].",
		);
	};
	// helper function
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

	const getVerticalIcon = () => "inventory";

	const onVerticalGroupClick = (verticalName) => {
    setCurrentOpenVertical((prev) =>
        prev === verticalName ? null : verticalName
    );
};

const onVerticalGroupOpen = (verticalName) => {
    setCurrentOpenVertical(verticalName);
};

const onVerticalGroupClose = (verticalName) => {
    setCurrentOpenVertical((prev) =>
        prev === verticalName ? null : prev
    );
};

	// Group employees by vertical from API data (include empty verticals)
	const groupEmployeesByRole = () => {
		const groupedEmployees = {};
		filteredClients.forEach((employee) => {
			if (!groupedEmployees[employee.vertical]) {
				groupedEmployees[employee.vertical] = [];
			}
			groupedEmployees[employee.vertical].push(employee);
		});

		return verticals.map((vertical) => ({
			name: (
				<BoxCountBadge
					asText
					tooltipSide="bottom"
					tooltipAlign="start"
					tooltipTextColor="text-[var(--color-neutral-secondary)]"
					tooltipContent={
						<div className="space-y-2">
							<div className="text-[var(--color-stroke-brand)] text-sm">
								{groupedEmployees[vertical]?.length || 0}{" "}
								clients
							</div>

							<i>
								<div
									className="text-[var(--info-panel-view-bg)] text-sm font-semibold cursor-pointer hover:underline"
									onClick={(e) => {
										e.stopPropagation();
										// handleViewDetails();
									}}
								>
									View details &gt;&gt;
								</div>
							</i>
						</div>
					}
				>
					{vertical.name.toUpperCase()}
				</BoxCountBadge>
			),
			items: groupedEmployees[vertical] || [],
		}));
	};

	// Render table content for each group
	const renderGroupTable = (groupData) => {
		const data = groupData || processedCustomers;
		return (
			<div className="">
			{data.length === 0 ? (
				<div className="px-6 py-6">
					<EmptyState
						title="No customers in this vertical"
						description="Clients from this vertical will appear here once created."
						buttonLabel={null}
					/>
				</div>
			) : (
				<Table className="min-w-full">
				<TableHead className="sticky top-0 z-10 bg-[var(--color-bg-primary,white)]">
						<TableRow>
							<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
								Name
							</TableCell>
							<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
								Region
							</TableCell>
							<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
								Boxes
							</TableCell>
							<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
								Added
							</TableCell>
							<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]"></TableCell>
							<TableCell className="w-12 p-4"></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{data.map((customer) => (
							<TableRow
								key={customer.id}
							>
								<TableCell className="p-4">
									<div>
										<Link
											href={`/clients/clientlogs?clientId=${encodeURIComponent(customer.id)}&name=${encodeURIComponent(customer.name)}&vertical=${encodeURIComponent(customer.vertical)}`}
											className="font-semibold pb-1 text-base text-[var(--color-neutral-secondary)] hover:underline"
											onClick={(e) => e.stopPropagation()}
										>
											{customer.name}
										</Link>
										<div className="text-sm text-[var(--color-stroke-brand)]">
											{customer.client_id} |{" "}
											{customer.organization}
										</div>
									</div>
								</TableCell>
								<TableCell className="p-4">
									<div className=" text-[var(--color-neutral-secondary)]">
										{customer.region}
									</div>
								</TableCell>
								<TableCell className="p-4">
    <div className="w-max">
        <BoxCountBadge
            count={customer.boxCount || 0}
            label={customer.vertical}
            iconName={getVerticalIcon(customer.vertical)}
            iconColor={getIconColor(customer.vertical)}
            borderColor={getIconColor(customer.vertical)}
            tooltipSide="left"
            tooltipAlign="start"
            onClick={(e) => {
                e.stopPropagation();
                setSelectedBoxClient(customer);
            }}
            onViewList={() => setSelectedBoxClient(customer)}
        />
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
													Last updated by You
												</div>
												<div className="text-[var(--color-stroke-brand)] text-xs text-right">
													Added on {customer.updated}
												</div>
											</div>
										}
									>
										<span className="cursor-default hover:underline">
											{customer.updated}
										</span>
									</BoxCountBadge>
								</TableCell>
								<TableCell className="p-4">
									<BoxCountBadge
										asText
										tooltipSide="bottom"
										tooltipAlign="end"
										tooltipContent={
											<div className="space-y-2">
												<div className="text-[var(--color-stroke-brand)] text-sm text-right">
													{customer.email ||
														"Not provided"}
												</div>
												<div className="text-[var(--color-stroke-brand)] text-sm text-right">
													(
													{customer.contact ||
														"Not provided"}
													)
												</div>
											</div>
										}
									>
										<Button
											variant="messaging"
											type="button"
											className="group !p-2 hover:!border-[var(--notif-border)]"
											onClick={(e) => {
												e.stopPropagation();
												handleOpenGmail(customer.email);
											}}
										>
											<Icon
												name="messaging"
												className="group-hover:text-[var(--notif-border)] text-[var(--color-stroke-brand)]"
											/>
										</Button>
									</BoxCountBadge>
								</TableCell>
								<TableCell className="w-12 p-4">
									<div
										ref={(el) =>
											(buttonRefs.current[customer.id] =
												el)
										}
										className="menu-container relative inline-block"
									>
										<button
											onClick={(e) => {
												setMenuOpen(
													menuOpen === customer.id
														? null
														: customer.id,
												);
												e.stopPropagation();
											}}
											className={`p-2 hover:bg-[var(--color-neutral-secondary-bg)] rounded-lg ${
												menuOpen === customer.id
													? "bg-[var(--color-neutral-secondary-bg)] shadow-[0_0_0_2px_var(--color-shadow-actionmenu)] rounded-lg"
													: ""
											}`}
										>
											<BsThreeDotsVertical className="w-5 h-5 text-[var(--color-stroke-brand)]" />
										</button>
										{menuOpen === customer.id && (
											<div className="menu-container absolute right-full mr-2 z-60 w-[400px] p-3 top-1/2 -translate-y-1/2 ml-2  rounded-lg border border-[var(--color-stroke-neutral)] bg-white shadow-[4px_4px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)] divide-y divide-[var(--color-stroke-neutral)] ">
												{actions.map((item) =>
													item.id === "logs" ? (
														<Link
															key={item.id}
															href={`/clients/clientlogs?clientId=${encodeURIComponent(customer.id)}&name=${encodeURIComponent(customer.name)}&vertical=${encodeURIComponent(customer.vertical)}`}
															className="block"
														>
															<div
																className="border gap-1 border-[var(--color-stroke-neutral)] rounded-lg cursor-pointer group hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)]
                   flex items-center gap-3 px-4 py-3 mb-2"
															>
																<div className="flex gap-2 justify-center">
																	<Icon
																		name={
																			item.icon
																		}
																		className="w-5 h-5 text-[var(--color-neutral-light)] group-active:text-[var(--color-stroke-brand)]"
																	/>
																</div>
																<div className="flex-1">
																	<h3 className="text-sm text-[var(--color-neutral-secondary)] group-active:text-[--color-neutral-primary] mb-1">
																		{
																			item.title
																		}
																	</h3>
																	<p className="text-xs text-[var(--color-stroke-brand)] group-active:text-[var(--color-neutral-secondary)] leading-relaxed">
																		{
																			item.description
																		}
																	</p>
																</div>
															</div>
														</Link>
													) : item.id === "account" ? (
														<div
															key={item.id}
															onClick={() =>
																handleAccessAccount(customer)
															}
															className="border gap-1 border-[var(--color-stroke-neutral)] rounded-lg cursor-pointer group hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)]
                   flex items-center gap-3 px-4 py-3 mb-2"
														>
															<div className="flex gap-2 justify-center">
																<Icon
																	name={
																		item.icon
																	}
																	className="w-5 h-5 text-[var(--color-neutral-light)] group-active:text-[var(--color-stroke-brand)]"
																/>
															</div>
															<div className="flex-1">
																<h3 className="text-sm text-[var(--color-neutral-secondary)] group-active:text-[--color-neutral-primary] mb-1">
																	{
																		item.title
																	}
																</h3>
																<p className="text-xs text-[var(--color-stroke-brand)] group-active:text-[var(--color-neutral-secondary)] leading-relaxed">
																	{
																		item.description
																	}
																</p>
															</div>
														</div>
													) : (
														<div
															key={item.id}
															className="border gap-1 border-[var(--color-stroke-neutral)] rounded-lg cursor-pointer group hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)]
                   flex items-center gap-3 px-4 py-3 mb-2"
														>
															<div className="flex gap-2 justify-center">
																<Icon
																	name={
																		item.icon
																	}
																	className="w-5 h-5 text-[var(--color-neutral-light)] group-active:text-[var(--color-stroke-brand)]"
																/>
															</div>
															<div className="flex-1">
																<h3 className="text-sm text-[var(--color-neutral-secondary)] group-active:text-[--color-neutral-primary] mb-1">
																	{
																		item.title
																	}
																</h3>
																<p className="text-xs text-[var(--color-stroke-brand)] group-active:text-[var(--color-neutral-secondary)] leading-relaxed">
																	{
																		item.description
																	}
																</p>
															</div>
														</div>
													),
												)}
												<div>
													<h1 className="pt-3 pb-2 text-sm text-[var(--color-neutral-secondary)] font-semibold">
														Quick actions
													</h1>
													<div className="flex flex-col gap-2">
													{quickActions.map(
														(item) =>
															item.id ===
															"faqs" ? (
																<div
																	key={
																		item.id
																	}
																	onClick={(e) =>
																		handleCheckFAQs(
																			e,
																			customer,
																		)
																	}
																	className="w-full rounded-lg cursor-pointer group hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)]
                                        border gap-1 border-[var(--color-stroke-neutral)] py-3 px-4"
																>
																	<h3 className="text-sm text-[var(--color-neutral-secondary)] group-active:text-[--color-neutral-primary] mb-1">
																		{
																			item.title
																		}
																	</h3>
																	<p className="text-xs text-[var(--color-stroke-brand)] group-active:text-[var(--color-neutral-secondary)] leading-relaxed">
																		{
																			item.description
																		}
																	</p>
																</div>
															) : item.id ===
															  "checkgrubpacs" ? (
																<div
																	key={
																		item.id
																	}
																	onClick={(e) =>
																		handleCheckGrubPacs(
																			e,
																			customer,
																		)
																	}
																	className="w-full rounded-lg cursor-pointer group hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)]
                                        border gap-1 border-[var(--color-stroke-neutral)] py-3 px-4"
																>
																	<h3 className="text-sm text-[var(--color-neutral-secondary)] group-active:text-[--color-neutral-primary] mb-1">
																		{
																			item.title
																		}
																	</h3>
																	<p className="text-xs text-[var(--color-stroke-brand)] group-active:text-[var(--color-neutral-secondary)] leading-relaxed">
																		{
																			item.description
																		}
																	</p>
																</div>
															) : (
																<div
																	key={
																		item.id
																	}
																	onClick={() =>
																		handleActionClick(
																			item.id,
																		)
																	}
																	className="w-full rounded-lg cursor-pointer group hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)]
                                        border gap-1 border-[var(--color-stroke-neutral)] py-3 px-4"
																>
																	<h3 className="text-sm text-[var(--color-neutral-secondary)] group-active:text-[--color-neutral-primary] mb-1">
																		{
																			item.title
																		}
																	</h3>
																	<p className="text-xs text-[var(--color-stroke-brand)] group-active:text-[var(--color-neutral-secondary)] leading-relaxed">
																		{
																			item.description
																		}
																	</p>
																</div>
															),
													)}
													</div>
												</div>
											</div>
										)}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
		);
	};

	if (!canViewClients) {
		return null;
	}

	// Loading state
	if (loading) {
		return (
			<div className="min-h-[60vh]">
				<LoadingDetails entity="clients" />
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="flex justify-center items-center min-h-[60vh]">
				<div className="text-lg text-red-500">
					Failed to load verticals data
				</div>
			</div>
		);
	}

	// Empty state (no clients)
	// if ((customers || []).length === 0) {
	// 	return (
	// 		<div>
	// 			<div className="flex items-center justify-between mb-6">
	// 				<h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
	// 					Clients
	// 				</h1>
	// 				{canExportClients && (
	// 					<Button
	// 						variant="cancel"
	// 						className="btn-size-md-cancel font-medium text-[var(--color-stroke-brand)] !text-base"
	// 						onClick={handleExportDetails}
	// 					>
	// 						EXPORT LIST
	// 					</Button>
	// 				)}
	// 			</div>
	// 			<div className="flex items-center justify-between mb-6">
	// 				<div className="flex items-center gap-4">
	// 					<div className="w-64">
	// 						<SearchWithSuggestions
	// 							data={searchSuggestions}
	// 							value={searchValue}
	// 							onChange={onKeywordChange}
	// 							onSelect={handleSuggestionSelect}
	// 							getLabel={(item) => item.name}
	// 							getSubLabel={(item) => item.type}
	// 							placeholder="Search client"
	// 							className="[&_input]:!h-8 [&_input]:!py-1"
	// 							clearable={true}
	// 							onClear={() => setSearchValue("")}
	// 							minChars={1}
	// 						/>
	// 					</div>
	// 				</div>
	//
	// 				<div className="flex items-center gap-4">
	// 					<span className="text-sm text-[var(--color-stroke-brand)]">
	// 						Showing {filteredClients.length} of{" "}
	// 						{customers.length} customers
	// 					</span>
	// 					<div className="w-48">
	// 						<MultiSelectDropdown
	// 							options={roleOptions}
	// 							selected={selectedRole}
	// 							setSelected={setSelectedRole}
	// 							placeholder="All verticals"
	// 							hideComponent={true}
	// 							notificationIcon={true}
	// 						/>
	// 					</div>
	// 					<label className="flex items-center gap-2 text-lg text-[var(--color-neutral-secondary)]">
	// 						<CheckBox
	// 							checked={groupByRole}
	// 							onChange={(e) =>
	// 								setGroupByRole(e.target.checked)
	// 							}
	// 						/>
	// 						Group as per vertical
	// 					</label>
	// 				</div>
	// 			</div>
	// 			<InfoPanel
	// 				title=""
	// 				name="No clients added yet"
	// 				description="Clients will appear here once onboarded. You can track their boxes, assist them, and access their platform for guidance."
	// 				buttonLabel={canAddClient ? "ADD NEW CLIENT" : null}
	// 			/>
	// 		</div>
	// 	);
	// }

	return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
			<div className="flex items-center justify-between mb-6 flex-shrink-0">
				<h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
					Clients
				</h1>
				<div className="flex items-center gap-3 relative">
					{canExportClients && (
						<Button
							variant="cancel"
							className="btn-size-md-cancel font-medium text-[var(--color-stroke-brand)] !text-base"
							onClick={handleExportDetails}
						>
							EXPORT LIST
						</Button>
					)}
					<Button
						variant="primary"
						onClick={() => setAddNewClient(true)}
					>
						ADD NEW
					</Button>
				</div>
			</div>

			{/* Search and Filters */}
			<div className="flex items-center justify-between mb-6 flex-shrink-0">
			<div className="flex items-center gap-4">
				<div className="w-64">
						<SearchWithSuggestions
							data={searchSuggestions}
							value={searchValue}
							onChange={onKeywordChange}
							onSelect={handleSuggestionSelect}
							getLabel={(item) => item.name}
							getSubLabel={(item) => item.type}
							placeholder="Search client"
							className="[&_input]:!h-8 [&_input]:!py-1"
							clearable={true}
							onClear={() => setSearchValue("")}
							minChars={1}
						/>
					</div>
				</div>

				<div className="flex items-center gap-4">
					{!groupByRole && (
						<>
							<span className="text-sm text-[var(--color-stroke-brand)]">
								Showing {filteredClients.length} of{" "}
								{customers.length} customers
							</span>
							<div className="w-48">
								<MultiSelectDropdown
									options={roleOptions}
									selected={selectedRole}
									setSelected={setSelectedRole}
									placeholder="All verticals"
									hideComponent={true}
									notificationIcon={true}
								/>
							</div>
						</>
					)}
					<label className="flex items-center gap-2 text-lg text-[var(--color-neutral-secondary)]">
						<CheckBox
							checked={groupByRole}
							onChange={(e) => setGroupByRole(e.target.checked)}
						/>
						Group as per vertical
					</label>
				</div>
			</div>

			{/* Table or Grouped View */}
			{!loading &&
			customers.length === 0 &&
			!debouncedSearchValue &&
			selectedRole.length === 0 ? (
				<InfoPanel
					title=""
					name="No clients added yet"
					description="Clients will appear here once onboarded. You can track their boxes, assist them, and access their platform for guidance."
					buttonLabel={canAddClient ? "ADD NEW CLIENT" : null}
					onButtonClick={() => setAddNewClient(true)}
				/>
			) : groupByRole ? (
					<div className="flex-1 overflow-y-auto min-h-0">
					{verticals.map((vertical, index) => {
						const verticalClients = filteredClients.filter(
							(c) => c.verticalId === vertical.id,
						);
						return (
							<CollapseTable
								key={vertical.id}
								table={renderGroupTable}
								vertical={vertical}
								onClick={() => onVerticalGroupClick(vertical.name)}
								onOpen={() => onVerticalGroupOpen(vertical.name)}
								onClose={() => onVerticalGroupClose(vertical.name)}
								groupName={vertical.name}
								isOpen={currentOpenVertical === vertical.name}
								data={verticalClients}
								renderTable={renderGroupTable}
								emptyResult={
									"No Customers are available for this verticals"
								}
								pagination={
									currentOpenVertical === vertical.name &&
									verticalClients.length > 0
										? {
												rangeText: `Showing 1-${verticalClients.length}`,
												onPrev: () =>
													setCurrentPage((p) =>
														Math.max(1, p - 1),
													),
												onNext: () =>
													setCurrentPage((p) =>
														Math.min(totalPages, p + 1),
													),
												disablePrev: currentPage <= 1,
												disableNext:
													currentPage >=
													Math.ceil(
														totalItems / pageSize,
													),
											}
										: undefined
								}
							/>
						);
					})}
				</div>
			) : (
			<div className="flex-1 overflow-y-auto min-h-0">
				<div className="sticky top-0 z-10 mb-6 bg-[var(--color-neutral-secondary-bg)] flex justify-between items-center py-2 px-4">
						<span className="text-sm text-[var(--color-stroke-brand)]">{`Showing ${pageStartDisplay}-${pageEndDisplay}`}</span>
						<div className="flex gap-3">
							<Button
								variant="grayOutline"
								className="flex !px-2 items-center justify-center"
								onClick={() =>
									setCurrentPage((p) => Math.max(1, p - 1))
								}
								disabled={currentPage === 1}
							>
								<FaAngleLeft className="w-4 h-4" />
							</Button>
							<Button
								variant="grayOutline"
								className="flex !px-2 items-center justify-center"
								onClick={() =>
									setCurrentPage((p) =>
										Math.min(totalPages, p + 1),
									)
								}
								disabled={currentPage >= totalPages}
							>
								<FaAngleRight className="w-4 h-4" />
							</Button>
						</div>
					</div>
					<Table className="min-w-full">
						<TableHead className="sticky top-0 z-10 bg-[var(--color-bg-primary,white)]">
							<TableRow>
								<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
									Name
								</TableCell>
								<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
									Region
								</TableCell>
								<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
									Vertical
								</TableCell>
								<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
									Added
								</TableCell>
								<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]"></TableCell>
								<TableCell className="w-12 p-4"></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{processedCustomers.map((customer) => (
								<TableRow
									key={customer.id}
								>
									<TableCell className="p-4">
										<div>
											<Link
												href={`/clients/clientlogs?clientId=${encodeURIComponent(customer.id)}&name=${encodeURIComponent(customer.name)}&vertical=${encodeURIComponent(customer.vertical)}`}
												className="font-semibold text-base pb-1 text-[var(--color-neutral-secondary)] hover:underline"
												onClick={(e) => e.stopPropagation()}
											>
												{customer.name}
											</Link>
											<div className="text-sm text-[var(--color-stroke-brand)]">
												{customer.client_id} |{" "}
												{customer.organization}
											</div>
										</div>
									</TableCell>
									<TableCell className="p-4">
										<div className=" text-[var(--color-neutral-secondary)]">
											{customer.region}
										</div>
									</TableCell>
								<TableCell className="p-4">
    <div className="w-max">
        <BoxCountBadge
            count={customer.boxCount || 0}
            label={customer.vertical}
            iconName={getVerticalIcon(customer.vertical)}
            iconColor={getIconColor(customer.vertical)}
            borderColor={getIconColor(customer.vertical)}
            tooltipSide="left"
            tooltipAlign="start"
            onClick={(e) => {
                e.stopPropagation();
                setSelectedBoxClient(customer);
            }}
            onViewList={() => setSelectedBoxClient(customer)}
        />
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
														Last updated by You
													</div>
													<div className="text-[var(--color-stroke-brand)] text-xs text-right">
														Added on{" "}
														{customer.updated}
													</div>
												</div>
											}
										>
											<span className="cursor-default hover:underline">
												{customer.updated}
											</span>
										</BoxCountBadge>
									</TableCell>
									<TableCell className="p-4">
										<BoxCountBadge
											asText
											tooltipSide="bottom"
											tooltipAlign="end"
											tooltipContent={
												<div className="space-y-2">
													<div className="text-[var(--color-stroke-brand)] text-sm text-right">
														{customer.email ||
															"Not provided"}
													</div>
													<div className="text-[var(--color-stroke-brand)] text-sm text-right">
														(
														{customer.contact ||
															"Not provided"}
														)
													</div>
												</div>
											}
										>
											<Button
												type="button"
												variant="messaging"
												className="group !p-2"
												onClick={(e) => {
													e.stopPropagation();
													handleOpenGmail(
														customer.email,
													);
												}}
											>
												<Icon
													name="messaging"
													className="group-hover:text-[var(--notif-border)] text-[var(--color-stroke-brand)]"
												/>
											</Button>
										</BoxCountBadge>
									</TableCell>
									<TableCell className="p-4">
										<div
											ref={(el) =>
												(buttonRefs.current[
													customer.id
												] = el)
											}
											className="menu-container relative inline-block"
										>
											<button
												onClick={(e) => {
													setMenuOpen(
														menuOpen === customer.id
															? null
															: customer.id,
													);
													e.stopPropagation();
												}}
												className={`p-2 hover:bg-[var(--color-neutral-secondary-bg)] rounded-lg ${
													menuOpen === customer.id
														? "bg-[var(--color-neutral-secondary-bg)] shadow-[0_0_0_2px_var(--color-shadow-actionmenu)] rounded-lg"
														: ""
												}`}
											>
												<BsThreeDotsVertical className="w-5 h-5 text-[var(--color-stroke-brand)]" />
											</button>
											{menuOpen === customer.id && (
												<div className="menu-container absolute right-full mr-2 z-60 w-[400px] p-3 top-1/2 -translate-y-1/2 ml-2  rounded-lg border border-[var(--color-stroke-neutral)] bg-white shadow-[4px_4px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)] divide-y divide-[var(--color-stroke-neutral)] ">
													{actions.map((item) =>
														item.id === "logs" ? (
															<Link
																key={item.id}
																href={`/clients/clientlogs?clientId=${encodeURIComponent(customer.id)}&name=${encodeURIComponent(customer.name)}&vertical=${encodeURIComponent(customer.vertical)}`}
																className="block"
															>
																<div
																	className="border gap-1 border-[var(--color-stroke-neutral)] rounded-lg cursor-pointer group hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)]
                   flex items-center gap-3 px-4 py-3 mb-2"
																>
																	<div className="flex gap-2 justify-center">
																		<Icon
																			name={
																				item.icon
																			}
																			className="w-5 h-5 text-[var(--color-neutral-light)] group-active:text-[var(--color-stroke-brand)]"
																		/>
																	</div>
																	<div className="flex-1">
																		<h3 className="text-sm text-[var(--color-neutral-secondary)] group-active:text-[--color-neutral-primary] mb-1">
																			{
																				item.title
																			}
																		</h3>
																		<p className="text-xs text-[var(--color-stroke-brand)] group-active:text-[var(--color-neutral-secondary)] leading-relaxed">
																			{
																				item.description
																			}
																		</p>
																	</div>
																</div>
															</Link>
														) : item.id === "account" ? (
															<div
																key={item.id}
																onClick={() =>
																	handleAccessAccount(customer)
																}
																className="border gap-1 border-[var(--color-stroke-neutral)] rounded-lg cursor-pointer group hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)]
                   flex items-center gap-3 px-4 py-3 mb-2"
															>
																<div className="flex gap-2 justify-center">
																	<Icon
																		name={
																			item.icon
																		}
																		className="w-5 h-5 text-[var(--color-neutral-light)] group-active:text-[var(--color-stroke-brand)]"
																	/>
																</div>
																<div className="flex-1">
																	<h3 className="text-sm text-[var(--color-neutral-secondary)] group-active:text-[--color-neutral-primary] mb-1">
																		{
																			item.title
																		}
																	</h3>
																	<p className="text-xs text-[var(--color-stroke-brand)] group-active:text-[var(--color-neutral-secondary)] leading-relaxed">
																		{
																			item.description
																		}
																	</p>
																</div>
															</div>
														) : (
															<div
																key={item.id}
																className="border gap-1 border-[var(--color-stroke-neutral)] rounded-lg cursor-pointer group hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)]
                   flex items-center gap-3 px-4 py-3 mb-2"
															>
																<div className="flex gap-2 justify-center">
																	<Icon
																		name={
																			item.icon
																		}
																		className="w-5 h-5 text-[var(--color-neutral-light)] group-active:text-[var(--color-stroke-brand)]"
																	/>
																</div>
																<div className="flex-1">
																	<h3 className="text-sm text-[var(--color-neutral-secondary)] group-active:text-[--color-neutral-primary] mb-1">
																		{
																			item.title
																		}
																	</h3>
																	<p className="text-xs text-[var(--color-stroke-brand)] group-active:text-[var(--color-neutral-secondary)] leading-relaxed">
																		{
																			item.description
																		}
																	</p>
																</div>
															</div>
														),
													)}
													<div>
														<h1 className="pt-3 pb-2 text-sm text-[var(--color-neutral-secondary)] font-semibold">
															Quick actions
														</h1>
														<div className="flex flex-col gap-2">
														{quickActions.map(
															(item) =>
																item.id ===
																"faqs" ? (
																	<div
																		key={
																			item.id
																		}
																		onClick={(e) =>
																			handleCheckFAQs(
																				e,
																				customer,
																			)
																		}
																		className="w-full rounded-lg cursor-pointer group hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)]
                                        border gap-1 border-[var(--color-stroke-neutral)] py-3 px-4"
																	>
																		<h3 className="text-sm text-[var(--color-neutral-secondary)] group-active:text-[--color-neutral-primary] mb-1">
																			{
																				item.title
																			}
																		</h3>
																		<p className="text-xs text-[var(--color-stroke-brand)] group-active:text-[var(--color-neutral-secondary)] leading-relaxed">
																			{
																				item.description
																			}
																		</p>
																	</div>
																) : item.id ===
																  "checkgrubpacs" ? (
																	<div
																		key={
																			item.id
																		}
																		onClick={(e) =>
																			handleCheckGrubPacs(
																				e,
																				customer,
																			)
																		}
																		className="w-full rounded-lg cursor-pointer group hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)]
                                       border gap-1 border-[var(--color-stroke-neutral)] py-3 px-4"
																	>
																		<h3 className="text-sm text-[var(--color-neutral-secondary)] group-active:text-[--color-neutral-primary] mb-1">
																			{
																				item.title
																			}
																		</h3>
																		<p className="text-xs text-[var(--color-stroke-brand)] group-active:text-[var(--color-neutral-secondary)] leading-relaxed">
																			{
																				item.description
																			}
																		</p>
																	</div>
																) : (
																	<div
																		key={
																			item.id
																		}
																		onClick={() =>
																			handleActionClick(
																				item.id,
																			)
																		}
																		className="w-full rounded-lg cursor-pointer group hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)]
                                       border gap-1 border-[var(--color-stroke-neutral)] py-3 px-4"
																	>
																		<h3 className="text-sm text-[var(--color-neutral-secondary)] group-active:text-[--color-neutral-primary] mb-1">
																			{
																				item.title
																			}
																		</h3>
																		<p className="text-xs text-[var(--color-stroke-brand)] group-active:text-[var(--color-neutral-secondary)] leading-relaxed">
																			{
																				item.description
																			}
																		</p>
																	</div>
																),
														)}
														</div>
													</div>
												</div>
											)}
										</div>
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
						onReassignRole={undefined}
						onSuspend={undefined}
						onDelete={
							canDeleteClients
								? () => setDeleteEmployeeModal(true)
								: undefined
						}
						allowDelete={canDeleteClients}
						allowSuspend={false}
						allowReassign={false}
					/>
				</div>
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
				options={options}
				footer={footer}
				onConfirm={handleExportConfirm}
			/>
			<SuspendEmployeeModal
				open={suspendEmployeeModal}
				onClose={() => setSuspendEmployeeModal(false)}
				onSuspend={handleSuspend}
			/>
			<DeleteEmployeeModal
				open={deleteEmployeeModal}
				onDelete={handleDelete}
				onClose={() => setDeleteEmployeeModal(false)}
				deleteClientSetup={true}
				selectedCount={selectedEmployees.size}
				firstSelectedName={(() => {
					const firstId = [...selectedEmployees][0];
					const emp = processedCustomers.find(
						(e) => e.id === firstId,
					);
					return emp?.name || "selected account";
				})()}
			/>
			<AddNewClient
				open={addNewClient}
				onClose={() => setAddNewClient(false)}
				onConfirm={onCreateCustomer}
				isCreating={isCreatingCustomer}
			/>
			<ClientBoxesModal
    open={!!selectedBoxClient}
    onClose={() => setSelectedBoxClient(null)}
    clientId={selectedBoxClient?.id}
    clientName={selectedBoxClient?.name}
    vertical={selectedBoxClient?.vertical}
/>
		</div>
	);
};

export default ClientsList;
