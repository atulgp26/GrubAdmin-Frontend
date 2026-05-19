"use client";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import SupportLogsSidebar from "@/components/pages/support/SupportLogsSidebar";
import SupportDefaultLogs from "@/components/pages/support/SupportDefaultLogs";
import { usePermissions } from "@/context/PermissionContext";

function SupportDefaultLogsWrapper() {
  return (
    <>
      <SupportLogsSidebar />
      <SupportDefaultLogs />
    </>
  );
}

const page = () => {
  const router = useRouter();
  const { can } = usePermissions();
  const canViewActive = can('view active resources', 'support') || can('view active resources');
  const canViewSuspended = can('view suspended categories', 'support') || can('view suspended categories');
  const canViewSupport = canViewActive || canViewSuspended;
  if (!canViewSupport) return null;
  
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
        {canViewSupport && (
          <Suspense fallback={<div className="flex justify-center items-center min-h-screen flex-1">Loading...</div>}>
            <SupportDefaultLogsWrapper />
          </Suspense>
        )}
      </div>
    </div>
  )
}

export default page
