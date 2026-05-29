"use client";
import { useState, useEffect } from "react";
import EmployeeLogs from "@/components/pages/employees/EmployeeLogs";
import LogsSidebar from "@/components/pages/employees/LogsSidebar";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

const page = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const employeeIdFromUrl = searchParams.get("id");
	const [selectedEmployee, setSelectedEmployee] = useState(null);
	const [preSelectId, setPreSelectId] = useState(employeeIdFromUrl);
	const [updatedEmployee, setUpdatedEmployee] = useState(null);
	const [sidebarKey, setSidebarKey] = useState(0);

const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setPreSelectId(null);
};

const handleEmployeeRemoved = () => {
    setSelectedEmployee(null);
    setPreSelectId(null);
};

	return (
		<div className="flex flex-col">
			<div className="flex items-center border-b px-6 py-3 border-[var(--color-stroke-neutral)]">
				<Button
					variant="grayOutline"
					className="flex gap-2 w-fit items-center btn-size-md-sm"
					onClick={() => router.back()}
				>
					<ArrowLeft className="w-4 h-4" />
					GO BACK
				</Button>
			</div>
			<div className="flex">
			<LogsSidebar
    key={sidebarKey}
    currentId={selectedEmployee?.id}
    preSelectId={preSelectId}
    onSelect={handleEmployeeSelect}
    updatedEmployee={updatedEmployee}
/>
<EmployeeLogs
    employee={selectedEmployee}
    onSelect={(emp) => {
        handleEmployeeSelect(emp);
        setUpdatedEmployee(emp);
    }}
    onRemoved={() => {
        setSelectedEmployee(null);
        setSidebarKey((k) => k + 1);  // forces LogsSidebar to re-fetch
    }}
/>
			</div>
		</div>
	);
};

export default page;
