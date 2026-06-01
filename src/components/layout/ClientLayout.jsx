"use client";
import { useState } from "react";
import Sidebar from "./sidebar";
import Header from "@/components/layout/Header";
import { usePathname } from "next/navigation";
import ToastProvider from "@/components/ui/ToastProvider";

const VERTICAL_DASHBOARDS = [
  "/delivery/dashboard",
];

function isImpersonationRoute(pathname) {
  if (pathname === "/impersonate" || pathname.startsWith("/impersonate/")) return true;
  return VERTICAL_DASHBOARDS.includes(pathname);
}

function isBareRoute(pathname) {
  if (pathname === "/" || pathname === "/login") return true;
  if (pathname === "/employees/activelogs" || pathname === "/employees/suspendedlogs" || pathname === "/employees/dismissedlogs") return true;
  if (pathname.startsWith("/support/") && !pathname.startsWith("/support/categories")) return true;
  if (pathname === "/clients/clientlogs" || pathname === "/details" || pathname.startsWith("/details/")) return true;
  if (/^\/grublock\/[^/]+$/.test(pathname) && !["/grublock/list"].includes(pathname)) return true;
  return false;
}

export default function ClientLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const closeSidebar = () => setSidebarCollapsed(true);

  if (isBareRoute(pathname)) {
    return <>{children}</>;
  }

  if (isImpersonationRoute(pathname)) {
    return (
      <>
        <ToastProvider />
        <div className="flex">
          <div className="flex-1 flex flex-col">
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
