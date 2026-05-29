"use client";
import { Suspense } from "react";
import SystemLogs from "@/components/pages/system/SystemLogs";

const Page = () => {
  return (
    <div className="flex">
      <Suspense fallback={null}>
        <SystemLogs />
      </Suspense>
    </div>
  );
};

export default Page;