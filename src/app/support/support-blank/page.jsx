"use client";
import React, { Suspense } from "react";
import SupportDefaultLogs from "@/components/pages/support/SupportDefaultLogs";

function SupportDefaultLogsWrapper() {
  return <SupportDefaultLogs />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <SupportDefaultLogsWrapper />
    </Suspense>
  );
}
