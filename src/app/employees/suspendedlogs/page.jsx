"use client";
import EmployeeLogs from "@/components/pages/employees/EmployeeLogs";
import LogsSidebar from "@/components/pages/employees/LogsSidebar";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const SuspendedLogsContent = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const employeeIdFromUrl = searchParams.get("id");
	const [selectedEmployee, setSelectedEmployee] = useState(null);
	const [preSelectId, setPreSelectId] = useState(employeeIdFromUrl);

	const handleEmployeeSelect = (employee) => {
		setSelectedEmployee(employee);
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
					currentId={selectedEmployee?.id}
					preSelectId={preSelectId}
					onSelect={handleEmployeeSelect}
				/>
				<EmployeeLogs employee={selectedEmployee} />
			</div>
		</div>
	);
};

const Page = () => {
	return (
		<Suspense fallback={null}>
			<SuspendedLogsContent />
		</Suspense>
	);
};

export default Page;