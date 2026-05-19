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
import Input from "@/components/ui/Input";
import { MdCalendarToday } from "react-icons/md";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import SystemLogsFilterModal from "@/components/pages/system/SystemLogsFilterModal";

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

export const employeeLogProfiles = [
  {
    id: "1",
    name: "Ravi Kumar",
    empId: "#DL12345",
    role: "Manager",
    status: "Active",
    phone: "+91 98000 00000",
    email: "ravikr@gmail.com",
    location: "North India",
    joinDate: "12 June '25",
    logs: [
      {
        id: 1,
        type: "Employee - List",
        subtype: "Deletion",
        action: "Employee deleted",
        timestamp: "02 Jun '25, 10:23:10",
        category: "system",
        icon: <GrUserExpert className="w-6 h-6 text-[var(--color-neutral-light)]" />,
      },
      {
        id: 2,
        type: "Client - Platform",
        subtype: "Creation",
        action: "20 employees created",
        timestamp: "02 Jun '25, 10:23:10",
        category: "action",
        icon: <FaRegPlusSquare className="w-6 h-6 text-[var(--color-neutral-light)]" />,
      },
      {
        id: 3,
        type: "Support - FAQ",
        subtype: "Updation",
        action: "FAQs published",
        timestamp: "02 Jun '25, 10:23:10",
        category: "system",
        icon: <LuPlug2 className="w-6 h-6 text-[var(--color-neutral-light)]" />,
      },
      {
        id: 4,
        type: "Export",
        subtype: "Summary",
        action: "Employee list exported",
        timestamp: "02 Jun '25, 10:23:10",
        category: "action",
        icon: <MdOutlineDone className="w-6 h-6 text-[var(--color-neutral-light)]" />,
      },
      {
        id: 5,
        type: "Login",
        subtype: "Authentication",
        action: "Employee logged in",
        timestamp: "02 Jun '25, 10:23:10",
        category: "action",
        icon: <LuPlug2 className="w-6 h-6 text-[var(--color-neutral-light)]" />,
      },
      {
        id: 6,
        type: "Employee - List",
        subtype: "Deletion",
        action: "Employee deleted",
        timestamp: "02 Jun '25, 10:23:10",
        category: "system",
        icon: <GrUserExpert className="w-6 h-6 text-[var(--color-neutral-light)]" />,
      },
    ],
  },
  {
    id: "2",
    name: "Anita Sharma",
    empId: "#DL12346",
    role: "Supervisor",
    status: "Suspended",
    phone: "+91 98000 00001",
    email: "anita@grubpac.com",
    location: "South India",
    joinDate: "18 June '25",
    logs: [
      {
        id: 7,
        type: "Employee - List",
        subtype: "Suspension",
        action: "Employee suspended",
        timestamp: "03 Jun '25, 09:10:04",
        category: "system",
        icon: <GrUserExpert className="w-6 h-6 text-[var(--color-neutral-light)]" />,
      },
      {
        id: 8,
        type: "Support - FAQ",
        subtype: "Updation",
        action: "FAQ edited",
        timestamp: "01 Jun '25, 18:23:51",
        category: "action",
        icon: <LuPlug2 className="w-6 h-6 text-[var(--color-neutral-light)]" />,
      },
      {
        id: 9,
        type: "Login",
        subtype: "Authentication",
        action: "Employee logged out",
        timestamp: "01 Jun '25, 17:56:20",
        category: "action",
        icon: <LuPlug2 className="w-6 h-6 text-[var(--color-neutral-light)]" />,
      },
    ],
  },
  {
    id: "3",
    name: "Arjun Patel",
    empId: "#DL12347",
    role: "Executive",
    status: "Dismissed",
    phone: "+91 98000 00002",
    email: "arjun@grubpac.com",
    location: "West India",
    joinDate: "22 May '25",
    logs: [
      {
        id: 10,
        type: "Employee - List",
        subtype: "Deletion",
        action: "Employee dismissed",
        timestamp: "30 May '25, 14:45:30",
        category: "system",
        icon: <GrUserExpert className="w-6 h-6 text-[var(--color-neutral-light)]" />,
      },
      {
        id: 11,
        type: "Export",
        subtype: "Summary",
        action: "Employee summary exported",
        timestamp: "29 May '25, 16:12:45",
        category: "action",
        icon: <MdOutlineDone className="w-6 h-6 text-[var(--color-neutral-light)]" />,
      },
    ],
  },
];

const categoryOptions = [
  { id: "system", label: "System log" },
  { id: "action", label: "Action log" },
];

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
      <p className="text-[var(--color-neutral-secondary)]">{log.action}</p>
    </TableCell>
  </TableRow>
);

export default function EmployeeLogs({ employee }) {
  const activeEmployee = employee || employeeLogProfiles[0];
  const logs = activeEmployee.logs || [];

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(
    categoryOptions.map((opt) => opt.id)
  );
  const [filteredLogs, setFilteredLogs] = useState(logs);
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
  const [dateRange, setDateRange] = useState("01 Jan - 21 Jan '25");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const pathname = usePathname();

  let status = activeEmployee?.status || "Active";
  if (pathname === "/employees/suspendedlogs") status = "Suspended";
  if (pathname === "/employees/dismissedlogs") status = "Dismissed";


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

  const searchSuggestions = useMemo(
    () =>
      logs.map((log) => ({
        id: log.id,
        name: log.action,
        code: `${log.type} (${log.subtype})`,
      })),
    [logs]
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

  const currentLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    (currentPage - 1) * pageSize + pageSize
  );

  useEffect(() => {
    setSelectedCategories(categoryOptions.map((opt) => opt.id));
    setSearch("");
    setCurrentPage(1);
  }, [activeEmployee?.id]);

const handleEditDetails=()=>{
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
    id: activeEmployee?.id,
    name: activeEmployee?.name,
    phone: activeEmployee?.phone,
    email: activeEmployee?.email,
    role: activeEmployee?.role,
    location: activeEmployee?.location,
    empId: activeEmployee?.empId,
    joinDate: activeEmployee?.joinDate,
    status: status,
  };

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
            <RiInformationLine onClick={()=>setEmployeeProfileModal(true)} className="cursor-pointer w-6 h-6 text-[var(--color-stroke-brand)]" />
            {activeEmployee?.name || "Employee name"}
          </h1>
          <div className={`flex gap-4 ${isDismissPage?"hidden":""} `}>
            <Button 
              variant="grayOutline"
              onClick={handleEditEmployee}
              className="flex gap-3 border border-[var(--color-stroke-brand)] text-[var(--color-stroke-brand)] leading-none rounded-lg w-fit items-center !py-2 !px-4"
            >
              <PencilLine className="w-4 h-4" />
              EDIT
            </Button>
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`p-2 cursor-pointer ${open?"bg-[var(--color-neutral-secondary-bg)] shadow-[0_0_0_2px_var(--color-shadow-actionmenu)] rounded-lg":""}`}
      >
        <BsThreeDotsVertical className="w-5 h-5 text-[var(--color-stroke-brand)]" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] rounded-lg shadow-[4px_4px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)] z-50">
          <button
            className="w-full text-left px-4 py-2 flex items-center gap-2 text-[var(--color-neutral-secondary)] text-sm"
          >
            <RxCrossCircled
              className="w-5 h-5 !text-[var(--color-neutral-light)]"
            />
            Suspend employee
          </button>
          <button
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
            placeholder="Account"
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
           onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
           onNext={() =>
             setCurrentPage((prev) => Math.min(totalPages, prev + 1))
           }
         />

        <div className="flex-grow">
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
          {filteredLogs.length === 0 && (
            <div className="text-center text-[var(--color-neutral-light)] py-8">
              No logs found for your filters.
            </div>
          )}
        </div>
        <EmployeeProfileDetails 
        open={employeeProfileModal} 
        onClose={()=>setEmployeeProfileModal(false)}
        onEdit={handleEditDetails}
        status={status}
        />
        <ExportListModal
        open={exportModal}
        onClose={()=>setExportModal(false)}
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
      </div>
    </>
  );
}
