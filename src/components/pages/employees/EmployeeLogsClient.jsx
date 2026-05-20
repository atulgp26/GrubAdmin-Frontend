"use client";
import { useState, useEffect } from "react";
import EmployeeLogs from "./EmployeeLogs";
import LogsSidebar from "./LogsSidebar";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EmployeeLogsClient() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const employeeIdFromUrl = searchParams.get("id");
	const [selectedEmployee, setSelectedEmployee] = useState(null);
	const [preSelectId, setPreSelectId] = useState(employeeIdFromUrl);

	const handleEmployeeSelect = (employee) => {
		setSelectedEmployee(employee);
		// Clear preSelectId once we've selected
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
				currentId={selectedEmployee?.id}
				onSelect={handleEmployeeSelect}
				/>
				<EmployeeLogs employee={selectedEmployee} />
			</div>
		</div>
	);
}
