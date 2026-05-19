"use client";
import React, { useState, useEffect } from "react";
import InfoPanel from "@/components/common/InfoPanel";
import AddNewEmployee from "@/components/pages/employees/AddNewEmployee";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { employeeService } from "@/api/services/employeeService";

const Employees = () => {
  const router = useRouter();
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasEmployees, setHasEmployees] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await employeeService.getAdmins();
        if (res?.success && res?.code === 200) {
          const list = res.data?.admins || [];
          const has = Array.isArray(list) && list.length > 0;
          setHasEmployees(has);
          if (has) {
            router.replace("/employees/list");
            return;
          }
        }
      } catch (_) { }
      setLoading(false);
    };
    load();
  }, [router]);

  useEffect(() => {
    if (!loading && hasEmployees) {
      router.replace("/employees/list");
    }
  }, [loading, hasEmployees, router]);

  const handleAddEmployeeClick = () => {
    setIsAddEmployeeModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddEmployeeModalOpen(false);
  };

  const handleConfirmEmployee = async (employeeData) => {
    setIsAddEmployeeModalOpen(false);
    // Refresh check for employees after adding
    try {
      const res = await employeeService.getAdmins();
      if (res?.success && res?.code === 200) {
        const list = res.data?.admins || [];
        const has = Array.isArray(list) && list.length > 0;
        if (has) {
          router.replace("/employees/list");
        }
      }
    } catch (_) { }
  };

  if (loading || hasEmployees) return null;

  return (
    <div>
      <InfoPanel
        title="Employees"
        description="Add employees to manage GrubPac operations, assign roles like Admin"
        subdescription="Support, or Technician to give them the right level of access"
        image={null}
        name="Ready to build your team?"
        topRight={
          <Link
            href="/employees/list"
            className="text-[var(--info-panel-view-bg)] font-medium cursor-pointer"
          >
            <Button variant="infoPanel">
              KNOW MORE
            </Button>
          </Link>
        }
        buttons={[
          {
            text: "ADD EMPLOYEE",
            icon: "plus",
            className: "!px-4 !py-2 rounded-lg font-medium !text-base flex items-center justify-center uppercase",
            variant: "primary",
            onClick: handleAddEmployeeClick,
          },
          {
            href: "/employees/roles",
            text: "MANAGE ROLES",
            className: "font-medium flex items-center justify-center uppercase",
            variant: "secondary",
          },
        ]}
      />

      <AddNewEmployee
        isOpen={isAddEmployeeModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmEmployee}
      />
    </div>
  );
};

export default Employees; 