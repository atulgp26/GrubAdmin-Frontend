"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import SearchWithSuggestions from "@/components/ui/SearchWithSuggestions";
import { RiInformationLine } from "react-icons/ri";
import Button from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import FilterButton from "@/components/ui/FilterButton";
import { usePathname } from "next/navigation";
import { RxCrossCircled } from "react-icons/rx";
import EmployeeProfileDetails from "../employees/EmployeeProfileDetails";
import ExportListModal from "../employees/ExportListModal";
import EditEmployeeModal from "../employees/EditEmployeeModal";
import Badge from "@/components/ui/Badge";
import { defaultClientSidebarEntries } from "./ClientLogsSidebar";

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

const defaultLogs = [
  {
    type: "Employees",
    action: "Suspended Handler: John D.",
    timestamp: "06 Jun '25, 10:45:10",
    name: "Ravi Kumar",
    role: "Support",
    icon: <Icon name="users" className="w-6 h-6 text-[var(--color-neutral-light)]" />,
  },
  {
    type: "Employees",
    action: "Suspended Handler: John D.",
    timestamp: "06 Jun '25, 10:45:10",
    name: "Ravi Kumar",
    role: "Support",
    icon: <Icon name="users" className="w-6 h-6 text-[var(--color-neutral-light)]" />,
  },
  {
    type: "GrubPacs",
    action: "Changed temperature range for Box #2456",
    timestamp: "06 Jun '25, 10:45:10",
    name: "Ravi Kumar",
    role: "Support",
    icon: <Icon name="inventory" className="w-6 h-6 text-[var(--color-neutral-light)]" />,
  },
  {
    type: "Employees",
    action: "Suspended Handler: John D.",
    timestamp: "06 Jun '25, 10:45:10",
    name: "Ravi Kumar",
    role: "Support",
    icon: <Icon name="users" className="w-6 h-6 text-[var(--color-neutral-light)]" />,
  },
  {
    type: "Employees",
    action: "Suspended Handler: John D.",
    timestamp: "06 Jun '25, 10:45:10",
    name: "Ravi Kumar",
    role: "Support",
    icon: <Icon name="users" className="w-6 h-6 text-[var(--color-neutral-light)]" />,
  },
  {
    type: "GrubPacs",
    action: "Changed temperature range for Box #2456",
    timestamp: "06 Jun '25, 10:45:10",
    name: "Ravi Kumar",
    role: "Support",
    icon: <Icon name="inventory" className="w-6 h-6 text-[var(--color-neutral-light)]" />,
  },
];

// Search suggestions data
const searchSuggestions = [
  { id: 1, name: "Account suspended", code: "account-suspended" },
  { id: 2, name: "Account created", code: "account-created" },
  { id: 3, name: "Role updated", code: "role-updated" },
  { id: 4, name: "Boxes assigned", code: "boxes-assigned" },
  { id: 5, name: "Employee activated", code: "employee-activated" },
  { id: 6, name: "Employee dismissed", code: "employee-dismissed" },
  { id: 7, name: "System log", code: "system-log" },
  { id: 8, name: "Action log", code: "action-log" },
];

const LogItem = ({ log }) => (
  <tr className="border-b border-[var(--color-stroke-neutral)] last:border-b-0">
    <td className="px-4 py-4 font-semibold text-[var(--color-neutral-secondary)] align-top">
      {log.timestamp}
    </td>
    <td className="px-4 py-4 align-top">
      <div className="flex gap-4">
        {log.icon}
        <div className="flex flex-col gap-1">
          <div className="font-medium text-[var(--color-neutral-secondary)]">
            {log.type}
          </div>
        </div>
      </div>
    </td>
    <td className="px-4 py-4 align-top">
      <p className="text-[var(--color-neutral-secondary)]">{log.action}</p>
    </td>
  </tr>
);

const verticalIconClassMap = {
  medical: "text-[var(--color-icon-medical)]",
  delivery: "text-[var(--info-panel-view-bg)]",
  hospitality: "text-[var(--color-brand-default)]",
  camping: "text-[var(--color-icon-camping)]",
};

export default function EmployeeLogs({ client }) {
  const [search, setSearch] = useState("");
  const [filteredLogs, setFilteredLogs] = useState(defaultLogs);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [employeeProfileModal, setEmployeeProfileModal] = useState(false)
  const [exportModal, setExportModal] = useState(false)
  const [editEmployeeModal, setEditEmployeeModal] = useState(false)
  const [options, setOptions] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [footer, setFooter] = useState("");
  const pathname = usePathname();

  const activeClient = useMemo(() => {
    if (client) return client;
    return defaultClientSidebarEntries[0] ?? null;
  }, [client]);

  const activeLogs = useMemo(() => {
    if (client?.logs?.length) return client.logs;
    const fallbackName =
      client?.name ?? defaultClientSidebarEntries[0]?.name ?? "Ravi Kumar";
    return defaultLogs.map((log) => ({
      ...log,
      name: fallbackName,
    }));
  }, [client]);

  let status = "Active";
  if (pathname === "/employees/suspendedlogs") status = "Suspended";
  if (pathname === "/employees/dismissedlogs") status = "Dismissed";


  if (activeClient?.statusLabel) {
    status = activeClient.statusLabel;
  }

  const isDismissPage = pathname === "/employees/dismissedlogs" || pathname === "/employees/suspendedlogs";

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSearch("");
  }, [activeClient]);

  useEffect(() => {
    setFilteredLogs(activeLogs);
  }, [activeLogs]);

  // Filter logs based on search term
  useEffect(() => {
    if (!search.trim()) {
      setFilteredLogs(activeLogs);
      return;
    }

    const filtered = activeLogs.filter(log =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.logType?.toLowerCase().includes(search.toLowerCase()) ||
      log.type.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredLogs(filtered);
  }, [search, activeLogs]);

  const handleEditDetails = () => {
    setTitle("Mid-level admin");
    setDescription(null);
    setOptions(actionOptions);
    setExportModal(true)
    setFooter("23 of 52 permissions")
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearch(suggestion.name);
  };

  const handleSearchClear = () => {
    setSearch("");
  };

  // Employee data for the edit modal
  const employeeData = {
    id: activeClient?.id ?? "1",
    name: activeClient?.name ?? "Ravi Kumar",
    phone: "+91 98000 00000",
    email: "ravikr@gmail.com",
    role: activeClient?.role ?? "Manager",
    location: activeClient?.location ?? "North India",
    empId: activeClient?.code ?? "#DL12345",
    joinDate: "12 June '25",
    status: status
  };

  const clientVertical = (activeClient?.status ?? "medical").toLowerCase();
  const formattedVertical =
    clientVertical.charAt(0).toUpperCase() + clientVertical.slice(1);
  const badgeIconClass =
    verticalIconClassMap[clientVertical] ?? "text-[var(--color-icon-medical)]";

  const handleEditEmployee = () => {
    setEditEmployeeModal(true);
  };

  const handleEditConfirm = (updatedData) => {
    // Here you would typically update the employee data in your state/API
    console.log("Employee updated:", updatedData);
    setEditEmployeeModal(false);
  };

  return (
    <>
      <div className="flex flex-col gap-6 p-6 w-full">
        <div className="flex justify-between">
          <h1 className="flex items-center gap-2 text-[var(--color-neutral-primary)] font-semibold text-2xl">
            <RiInformationLine onClick={() => setEmployeeProfileModal(true)} className="cursor-pointer w-6 h-6 text-[var(--color-stroke-brand)]" />
            {activeClient?.name ?? "Ravi Kumar"}
          </h1>
          <div className={`flex gap-4 ${isDismissPage ? "hidden" : ""} `}>
            <Badge
              color={clientVertical}
              className="leading-none flex items-center space-x-2 w-max cursor-pointer"
            >
              <Icon
                name="inventory"
                className={`w-4 h-4 ${badgeIconClass}`}
              />
              {`${formattedVertical} (12)`}
            </Badge>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen((prev) => !prev)}
                className={`p-2 cursor-pointer ${open ? "bg-[var(--color-neutral-secondary-bg)] shadow-[0_0_0_2px_var(--color-shadow-actionmenu)] rounded-lg" : ""}`}
              >
                <BsThreeDotsVertical className="w-5 h-5 text-[var(--color-stroke-brand)]" />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] rounded-lg shadow-[4px_4px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)] z-50">
                  <Button
                    variant="profile"
                    className="w-full text-left px-4 py-2 flex items-center gap-2 text-[var(--color-neutral-secondary)] !text-sm"
                  >
                    <RxCrossCircled
                      className="w-5 h-5 !text-[var(--color-neutral-light)]"
                    />
                    Suspend employee
                  </Button>
                  <Button
                    variant="profile"
                    className="w-full text-left px-4 py-2 flex items-center gap-2 text-[var(--color-neutral-secondary)] !text-sm"
                  >
                    <Trash2 className="w-5 h-5 text-[var(--notif-error)]" />
                    Delete employee
                  </Button>
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
            placeholder="Search log"
            clearable={true}
            className="!w-64"
            getLabel={(item) => item.name}
            getSubLabel={(item) => item.code}
            openOnFocus={false}
            minChars={1}
          />
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-stroke-brand)]">
              Showing {filteredLogs.length} of {activeLogs.length}
            </span>
            <input
              type="date"
              defaultValue="2025-06-06"
              className="border cursor-pointer border-[var(--color-stroke-neutral)] hover:bg-[var(--color-neutral-secondary-bg)] rounded-md text-sm p-2 text-[var(--color-neutral-secondary)]"
            />
            <FilterButton open={showFilterModal} handleFilterClick={() => setShowFilterModal(true)} />
          </div>
        </div>

        <div className="flex-grow bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-sm text-[var(--color-stroke-brand)] border-b border-[var(--color-stroke-neutral)]">
                  <th scope="col" className="px-4 py-3 text-left font-medium">
                    Time stamp
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => (
                  <LogItem key={index} log={log} />
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-12 text-center text-[var(--color-neutral-secondary)] text-sm"
                    >
                      No logs match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <EmployeeProfileDetails
          open={employeeProfileModal}
          onClose={() => setEmployeeProfileModal(false)}
          onEdit={handleEditDetails}
          status={status}
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
      </div>
    </>
  );
}
