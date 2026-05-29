"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { GrUserExpert } from "react-icons/gr";
import { LuPlug2 } from "react-icons/lu";
import { MdOutlineDone } from "react-icons/md";
import { FaRegPlusSquare } from "react-icons/fa";
import SearchWithSuggestions from "@/components/ui/SearchWithSuggestions";
import { RiInformationLine } from "react-icons/ri";
import Button from "@/components/ui/Button";
import { PencilLine, Trash2 } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import EmployeeProfileDetails from "./EmployeeProfileDetails";
import ExportListModal from "./ExportListModal";
import EditEmployeeModal from "./EditEmployeeModal";
import { usePathname } from "next/navigation";
import { RxCrossCircled } from "react-icons/rx";
import { employeeService } from "@/api/services/employeeService";
import Input from "@/components/ui/Input";
import { showSuccess, showError } from "@/components/ui/toast";
import { MdCalendarToday } from "react-icons/md";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import SuspendEmployeeModal from "./SuspendEmployeeModal";
import DeleteEmployeeModal from "./DeleteEmployeeModal";
import {
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
} from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import SystemLogsFilterModal from "@/components/pages/system/SystemLogsFilterModal";
import { logsService } from "@/api/services/logsService";
import LoadingDetails from "@/components/ui/LoadingDetails";

const midLevelData = [
	{ id: "delivery", label: "Delivery" },
	{ id: "hospitality", label: "Hospitality" },
	{ id: "medical", label: "Medical" },
	{ id: "camping", label: "Camping" },
];

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



const categoryOptions = [
	{ id: "system", label: "System log" },
	{ id: "action", label: "Action log" },
];

// Map category to icon
const getCategoryIcon = (category) => {
	switch ((category || "").toLowerCase()) {
		case "employee":
			return (
				<GrUserExpert className="w-6 h-6 text-[var(--color-neutral-light)]" />
			);
		case "profile":
			return (
				<LuPlug2 className="w-6 h-6 text-[var(--color-neutral-light)]" />
			);
		case "export":
			return (
				<MdOutlineDone className="w-6 h-6 text-[var(--color-neutral-light)]" />
			);
		case "restaurant":
			return (
				<FaRegPlusSquare className="w-6 h-6 text-[var(--color-neutral-light)]" />
			);
		default:
			return (
				<LuPlug2 className="w-6 h-6 text-[var(--color-neutral-light)]" />
			);
	}
};

// Format timestamp
const formatTimestamp = (isoString) => {
	if (!isoString) return "";
	const date = new Date(isoString);
	return date
		.toLocaleString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		})
		.replace(",", "");
};

// Format log description to make it more readable
const formatLogDescription = (description) => {
	if (!description) return "—";

	// Remove excessive IDs and clean up the description
	// Pattern: "[Name, ID] field updated from X to Y by [Admin, ID]"
	// -> "Name updated field from X to Y"

	let cleaned = description;

	// Extract names from [Name, ID] pattern
	const namePattern = /\[([^,]+),\s*[^\]]+\]/g;
	cleaned = cleaned.replace(namePattern, "$1");

	// Simplify "field updated from X to Y" to "field changed"
	cleaned = cleaned.replace(
		/field updated from .+ to .+ by/,
		"field updated by",
	);

	// Truncate if too long
	if (cleaned.length > 100) {
		cleaned = cleaned.substring(0, 97) + "...";
	}

	return cleaned;
};

const LogTableRow = ({ log }) => (
	<TableRow>
		<TableCell className="p-4 font-semibold text-[var(--color-neutral-secondary)] whitespace-nowrap align-top">
			{log.timestamp}
		</TableCell>
		<TableCell className="p-4 align-top">
			<div className="flex gap-4">
				{log.icon}
				<div className="flex flex-col gap-1">
					<div className="font-medium text-[var(--color-neutral-secondary)]">
						{log.type}
					</div>
					<div className="text-sm text-[var(--color-stroke-brand)]">
						({log.subtype})
					</div>
				</div>
			</div>
		</TableCell>
		<TableCell className="p-4 align-top">
			<p className="text-[var(--color-neutral-secondary)]">
				{log.action}
			</p>
		</TableCell>
	</TableRow>
);




export default function EmployeeLogs({ employee, onSelect, onRemoved }) {
	const [logs, setLogs] = useState([]);
	const [logsLoading, setLogsLoading] = useState(false);
	const [logsError, setLogsError] = useState(null);

	const [search, setSearch] = useState("");
	const [selectedCategories, setSelectedCategories] = useState(
		categoryOptions.map((opt) => opt.id),
	);
	const [filteredLogs, setFilteredLogs] = useState([]);
	const [open, setOpen] = useState(false);
	const menuRef = useRef(null);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [advancedFilters, setAdvancedFilters] = useState({});
	const [employeeProfileModal, setEmployeeProfileModal] = useState(false);
	const [exportModal, setExportModal] = useState(false);
	const [editEmployeeModal, setEditEmployeeModal] = useState(false);
	const [options, setOptions] = useState([]);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [footer, setFooter] = useState("");
	const [dateRange, setDateRange] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 50;
	const pathname = usePathname();

	let status = employee?.status || "Active";
	if (pathname === "/employees/suspendedlogs") status = "Suspended";
	if (pathname === "/employees/dismissedlogs") status = "Dismissed";

	const isDismissPage =
		pathname === "/employees/dismissedlogs" ||
		pathname === "/employees/suspendedlogs";

	// Fetch logs when selected employee changes
	useEffect(() => {
		if (!employee?.id) return;

		const fetchLogs = async () => {
			try {
				setLogsLoading(true);
				setLogsError(null);
				setLogs([]);

				const response = await logsService.getLogs({
					page: 1,
					limit: 20,
					admin_id: employee.id,
				});

				if (
					response.success &&
					response.code === 200 &&
					response.data?.logs
				) {
					const mapped = response.data.logs.map((log) => ({
						id: log.id,
						type: log.category || "—",
						subtype: log.type || "—",
						action: formatLogDescription(log.description),
						timestamp: formatTimestamp(log.createdAt),
						// Map category to system/action for filter
						category: ["profile", "employee"].includes(
							(log.category || "").toLowerCase(),
						)
							? "system"
							: "action",
						icon: getCategoryIcon(log.category),
					}));
					setLogs(mapped);
				} else {
					setLogsError("Failed to load logs.");
				}
			} catch (err) {
				console.error("Error fetching logs:", err);
				setLogsError("Failed to load logs.");
			} finally {
				setLogsLoading(false);
			}
		};

		fetchLogs();
	}, [employee?.id]);

	useEffect(() => {
		function handleClickOutside(event) {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const searchSuggestions = useMemo(
		() =>
			logs.map((log) => ({
				id: log.id,
				name: log.action,
				code: `${log.type} (${log.subtype})`,
			})),
		[logs],
	);

	const visibleLogs = useMemo(() => {
		const query = search.trim().toLowerCase();
		return logs.filter((log) => {
			const matchesCategory =
				selectedCategories.length === 0 ||
				selectedCategories.includes(log.category);
			if (!query) return matchesCategory;
			return (
				matchesCategory &&
				(log.action.toLowerCase().includes(query) ||
					log.type.toLowerCase().includes(query) ||
					log.subtype.toLowerCase().includes(query))
			);
		});
	}, [logs, search, selectedCategories]);

	useEffect(() => {
		setFilteredLogs(visibleLogs);
		setCurrentPage(1);
	}, [visibleLogs]);

	const totalItems = filteredLogs.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [totalPages, currentPage]);

	// Reset search/filter when employee changes
	useEffect(() => {
		setSelectedCategories(categoryOptions.map((opt) => opt.id));
		setSearch("");
		setCurrentPage(1);
	}, [employee?.id]);

	const currentLogs = filteredLogs.slice(
		(currentPage - 1) * pageSize,
		(currentPage - 1) * pageSize + pageSize,
	);

const handleEditDetails = () => {
    const role = employee?.originalData?.role;

    let permissionsCount = 0;
    if (role?.permissions_json) {
        Object.keys(role.permissions_json).forEach((sectionKey) => {
            const permissionList = role.permissions_json[sectionKey];
            if (Array.isArray(permissionList)) {
                permissionsCount += permissionList.length;
            }
        });
    }

    setTitle(role?.name || employee?.role || "Employee role");
    setFooter(permissionsCount > 0 ? `${permissionsCount} permissions` : "");
    setOptions(actionOptions);
    setExportModal(true);
};

	const handleSearchChange = (e) => setSearch(e.target.value);
	const handleSuggestionSelect = (suggestion) => setSearch(suggestion.name);
	const handleSearchClear = () => setSearch("");

	const [roleOptions, setRoleOptions] = useState([]);
	
const [suspendModal, setSuspendModal] = useState(false);
const [deleteModal, setDeleteModal] = useState(false);


const handleEditConfirm = async (updatedEmployeeData) => {
    if (!employee?.originalData) {
        showError("Employee data not found. Please try again.");
        return;
    }

    try {
        const originalAdmin = employee.originalData;
        const adminId = originalAdmin.id;

        const nameParts = updatedEmployeeData.name
            ? updatedEmployeeData.name.split(" ").filter((p) => p.trim())
            : [];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const payload = {
            id: adminId,
            email: updatedEmployeeData.email || originalAdmin.email,
            first_name: firstName,
            last_name: lastName,
        };

        if (updatedEmployeeData.location !== undefined) {
            payload.location = updatedEmployeeData.location || originalAdmin.location || "";
        }
        if (updatedEmployeeData.role_id) {
            payload.role = updatedEmployeeData.role_id;
        }
        if (updatedEmployeeData.joinDate) {
            const parsedDate = new Date(updatedEmployeeData.joinDate);
            if (!isNaN(parsedDate.getTime())) {
                payload.joining_date = parsedDate.toISOString();
            }
        }
        if (updatedEmployeeData.phone) {
            const phoneStr = updatedEmployeeData.phone.trim();
            let countryCode = originalAdmin.country_code || "+91";
            let mobileNumber = "";
            if (phoneStr.startsWith("+91")) {
                countryCode = "+91";
                mobileNumber = phoneStr.substring(3).replace(/\D/g, "");
            } else {
                mobileNumber = phoneStr.replace(/\D/g, "");
            }
            if (mobileNumber) {
                payload.mobile_number = mobileNumber;
                payload.country_code = countryCode;
            }
        }
        if (updatedEmployeeData.employee_id) {
            payload.employee_id = updatedEmployeeData.employee_id.replace(/^#\s*/, "");
        }

        const response = await employeeService.updateAdmin(payload);

        if (response.success && response.code === 200) {
            showSuccess("Success!", `${updatedEmployeeData.name || "Employee"} details updated successfully.`);
            setEditEmployeeModal(false);
      if (onSelect) {
    onSelect({
        ...employee,
        name: updatedEmployeeData.name,
        phone: updatedEmployeeData.phone,
        email: updatedEmployeeData.email,
        role: updatedEmployeeData.role,
        location: updatedEmployeeData.location,
        empId: updatedEmployeeData.empId,
        joinDate: updatedEmployeeData.joinDate,
        originalData: {
            ...employee.originalData,
            first_name: updatedEmployeeData.name?.split(" ")[0] || "",
            last_name: updatedEmployeeData.name?.split(" ").slice(1).join(" ") || "",
            email: updatedEmployeeData.email,
            location: updatedEmployeeData.location,
            joining_date: updatedEmployeeData.joinDate,
        }
    });
}
        } else {
            showError(response.error || response.message || "Failed to update employee.");
        }
    } catch (error) {
        console.error("Error updating employee:", error);
        showError("Failed to update employee. Please try again.");
    }
};

const handleSuspend = async () => {
    try {
        const response = await employeeService.suspendAdmin([employee.id]);
        if (response.success && response.code === 200) {
            showSuccess("Success!", `${employee.name} has been suspended.`);
            setSuspendModal(false);
			if (onRemoved) onRemoved();
        } else {
            showError(response.error || response.message || "Failed to suspend employee.");
        }
    } catch (error) {
        showError("Failed to suspend employee. Please try again.");
    }
};

const handleDelete = async () => {
    try {
        const res = await employeeService.deleteAdmins({ adminIds: [employee.id] });
        if (res?.success && res.code === 200) {
            showSuccess("Success!", `${employee.name} has been deleted.`);
            setDeleteModal(false);
			if (onRemoved) onRemoved();
        } else {
            showError(res?.error || res?.message || "Failed to delete employee.");
        }
    } catch (e) {
        showError("Failed to delete employee. Please try again.");
    }
};

const employeeData = {
    id: employee?.id,
    name: employee?.name,
    phone: employee?.phone,
    email: employee?.email,
    role: employee?.role,
    location: employee?.location,
    empId: employee?.empId,
    joinDate: employee?.joinDate,
    status,
    originalData: employee?.originalData,  
};

	return (
		<>
			<div className="flex flex-col gap-6 p-6 w-full">
				<div className="flex justify-between">
					<h1 className="flex items-center gap-2 text-[var(--color-neutral-primary)] font-semibold text-2xl">
						<RiInformationLine
							onClick={() => setEmployeeProfileModal(true)}
							className="cursor-pointer w-6 h-6 text-[var(--color-stroke-brand)]"
						/>
						{employee?.name || "Employee name"}
					</h1>
					<div
						className={`flex gap-4 ${isDismissPage ? "hidden" : ""}`}
					>
						<Button
							variant="grayOutline"
							onClick={() => setEditEmployeeModal(true)}
							className="flex gap-3 border border-[var(--color-stroke-brand)] text-[var(--color-stroke-brand)] leading-none rounded-lg w-fit items-center !py-2 !px-4"
						>
							<PencilLine className="w-4 h-4" />
							EDIT
						</Button>
						<div className="relative" ref={menuRef}>
							<button
								onClick={() => setOpen((prev) => !prev)}
								className={`p-2 cursor-pointer ${open ? "bg-[var(--color-neutral-secondary-bg)] shadow-[0_0_0_2px_var(--color-shadow-actionmenu)] rounded-lg" : ""}`}
							>
								<BsThreeDotsVertical className="w-5 h-5 text-[var(--color-stroke-brand)]" />
							</button>
							{open && (
								<div className="absolute right-0 mt-2 w-52 bg-white border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] rounded-lg shadow-[4px_4px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)] z-50">
									<button
    onClick={() => { setOpen(false); setSuspendModal(true); }}
    className="w-full text-left px-4 py-2 flex items-center gap-2 text-[var(--color-neutral-secondary)] text-sm"
>
    <RxCrossCircled className="w-5 h-5 !text-[var(--color-neutral-light)]" />
    Suspend employee
</button>
<button
    onClick={() => { setOpen(false); setDeleteModal(true); }}
    className="w-full text-left px-4 py-2 flex items-center gap-2 text-[var(--color-neutral-secondary)] text-sm"
>
    <Trash2 className="w-5 h-5 text-[var(--notif-error)]" />
    Delete employee
</button>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="flex-shrink-0 flex justify-between items-center rounded-lg">
					<SearchWithSuggestions
						data={searchSuggestions}
						value={search}
						onChange={handleSearchChange}
						onSelect={handleSuggestionSelect}
						onClear={handleSearchClear}
						placeholder="Search logs"
						clearable={true}
						className="!w-64 [&_input]:!h-8 [&_input]:!py-1"
						getLabel={(item) => item.name}
						getSubLabel={(item) => item.code}
						openOnFocus={false}
						minChars={1}
					/>
					<div className="flex items-center gap-4">
						<span className="text-sm text-[var(--color-stroke-brand)]">
							{logs.length} entries
						</span>
						<div className="relative">
							<Input
								type="text"
								placeholder="Date range"
								value={dateRange}
								onChange={(e) => setDateRange(e.target.value)}
								className="pr-10 !w-44 !h-8 !rounded-lg border border-[var(--color-stroke-neutral)] text-[var(--color-neutral-secondary)]"
							/>
							<MdCalendarToday className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF5A3C]" />
						</div>
						<MultiSelectDropdown
							options={categoryOptions}
							selected={selectedCategories}
							setSelected={setSelectedCategories}
							placeholder="All categories"
							className="min-w-[160px]"
							padding="!py-1.5 !px-3"
							fontsize="text-sm"
						/>
						<Button
							variant="grayOutline"
							size="md"
							className="h-8 flex items-center px-3 rounded-lg"
							onClick={() => setShowFilterModal(true)}
						>
							ADVANCED FILTER
						</Button>
					</div>
				</div>

				<Pagination
					className="rounded-[6px]"
					currentPage={currentPage}
					pageSize={pageSize}
					totalItems={filteredLogs.length}
					onPrev={() =>
						setCurrentPage((prev) => Math.max(1, prev - 1))
					}
					onNext={() =>
						setCurrentPage((prev) => Math.min(totalPages, prev + 1))
					}
				/>

				<div className="flex-grow">
					{logsLoading && (
						<div className="text-center text-[var(--color-neutral-light)] py-8">
							Loading logs...
						</div>
					)}
					{logsError && !logsLoading && (
						<div className="text-center text-red-500 py-8">
							{logsError}
						</div>
					)}
					{!logsLoading && !logsError && (
						<Table className="w-full">
							<TableHead>
								<TableRow>
									<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
										Time stamp
									</TableCell>
									<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
										Type
									</TableCell>
									<TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
										Action
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{currentLogs.map((log) => (
									<LogTableRow key={log.id} log={log} />
								))}
							</TableBody>
						</Table>
					)}
					{!logsLoading &&
						!logsError &&
						filteredLogs.length === 0 && (
							<div className="text-center text-[var(--color-neutral-light)] py-8">
								No logs found.
							</div>
						)}
				</div>

				<EmployeeProfileDetails
					open={employeeProfileModal}
					onClose={() => setEmployeeProfileModal(false)}
					onEdit={handleEditDetails}
					status={status}
					 employee={employeeData}
				/>
				<ExportListModal
					open={exportModal}
					onClose={() => setExportModal(false)}
					options={options}
					title={title}
					description={description}
					footer={footer}
					midLevelData={midLevelData}
				/>
				<EditEmployeeModal
					open={editEmployeeModal}
					onClose={() => setEditEmployeeModal(false)}
					employeeData={employeeData}
				  onConfirm={handleEditConfirm}
				/>
				<SystemLogsFilterModal
					open={showFilterModal}
					onClose={() => setShowFilterModal(false)}
					selectedFilters={advancedFilters}
					onChange={setAdvancedFilters}
					onApply={() => setShowFilterModal(false)}
				/>

				<SuspendEmployeeModal
    open={suspendModal}
    onClose={() => setSuspendModal(false)}
    onSuspend={handleSuspend}
    selectedCount={1}
    firstSelectedName={employee?.name || "selected employee"}
/>
<DeleteEmployeeModal
    open={deleteModal}
    onDelete={handleDelete}
    onClose={() => setDeleteModal(false)}
    onSuspend={() => { setDeleteModal(false); setSuspendModal(true); }}
    selectedCount={1}
    firstSelectedName={employee?.name || "selected account"}
/>
			</div>
		</>
	);
}
