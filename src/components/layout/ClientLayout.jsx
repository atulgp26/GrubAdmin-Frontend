"use client";
import { useState } from "react";
import Sidebar from "./sidebar";
import Header from "@/components/layout/Header";
import { usePathname } from "next/navigation";
import ToastProvider from "@/components/ui/ToastProvider";

export default function ClientLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const closeSidebar = () => setSidebarCollapsed(true);

  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/employees/activelogs" ||
    pathname === "/support/supportlogs" ||
    pathname === "/support/supportdefaultlogs" ||
    pathname === "/support/support-blank" ||
    pathname === "/employees/suspendedlogs" ||
    pathname === "/employees/dismissedlogs" ||
    pathname === "/clients/clientlogs" ||
    pathname === "/details" ||
    pathname.startsWith("/details/") ||
    (/^\/grublock\/[^/]+$/.test(pathname) &&
      !["/grublock/list"].includes(pathname))
  ) {
    return <>{children}</>;
  }

  return (
    <>
      <ToastProvider />
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} onClose={closeSidebar} />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarCollapsed ? "ml-0" : "ml-60"
          }`}
        >
          <Header
            onToggleSidebar={toggleSidebar}
            collapsed={sidebarCollapsed}
          />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </>
  );
}
