"use client";
import { useMemo, useState } from "react";
import EmployeeLogs, {
  employeeLogProfiles,
} from "@/components/pages/employees/EmployeeLogs";
import LogsSidebar from "@/components/pages/employees/LogsSidebar";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    employeeLogProfiles[0]?.id
  );

  const selectedEmployee = useMemo(
    () =>
      employeeLogProfiles.find((emp) => emp.id === selectedEmployeeId) ||
      employeeLogProfiles[0],
    [selectedEmployeeId]
  );

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
          employees={employeeLogProfiles}
          currentId={selectedEmployeeId}
          onSelect={setSelectedEmployeeId}
        />
        <EmployeeLogs employee={selectedEmployee} />
      </div>
    </div>
  );
};

export default page;
