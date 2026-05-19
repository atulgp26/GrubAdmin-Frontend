"use client";
import EmployeeLogs from "@/components/pages/employees/EmployeeLogs";
import LogsSidebar from "@/components/pages/employees/LogsSidebar";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
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
        <LogsSidebar />
        <EmployeeLogs />
      </div>
    </div>
  )
}

export default page
