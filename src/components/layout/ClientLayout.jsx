"use client";
import { useState } from "react";
import Sidebar from "./sidebar";
import Header from "@/components/layout/Header";
import { usePathname } from "next/navigation";

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
  if (pathname.startsWith("/support/") && !pathname.startsWith("/support/categories") && pathname !== "/support/suspended") return true;
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
      <div className="flex">
        <div className="flex-1 flex flex-col">
          <div className="sticky top-0 z-50">
            <Header
              onToggleSidebar={toggleSidebar}
              collapsed={sidebarCollapsed}
            />
          </div>
          <main className="flex-1 p-6 overflow-x-auto">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={sidebarCollapsed} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <div className="sticky top-0 z-50">
          <Header
            onToggleSidebar={toggleSidebar}
            collapsed={sidebarCollapsed}
          />
        </div>
        <main className="flex-1 p-6 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}