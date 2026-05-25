"use client";

import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import Link from "next/link";

const getIconColor = (vertical) => {
  switch ((vertical || "").toLowerCase()) {
    case "medical":
      return "text-[var(--color-icon-medical)]";
    case "delivery":
      return "text-[var(--info-panel-view-bg)]";
    case "hospitality":
      return "text-[var(--color-brand-default)]";
    case "camping":
      return "text-[var(--color-icon-camping)]";
    default:
      return "text-[var(--info-panel-view-bg)]";
  }
};

export default function ClientLogsSidebar({
  clients = [],
  currentId,
  onSelect,
  loading,
}) {
  return (
    <div className="w-60 bg-white flex flex-col h-full">
      <div className="flex-1 overflow-y-auto border-r border-[var(--color-stroke-neutral)]">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-[var(--color-stroke-brand)]">
            Loading clients...
          </div>
        ) : clients.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[var(--color-stroke-brand)]">
            No clients found.
          </div>
        ) : (
          clients.map((b) => {
            const isActive = String(b.id) === String(currentId);
            const verticalName = b.vertical?.name || "";
            return (
              <Link
                key={b.id}
                href={`/clients/clientlogs?clientId=${encodeURIComponent(b.id)}&name=${encodeURIComponent(b.name)}&vertical=${encodeURIComponent(verticalName)}`}
                onClick={() => {
                  if (onSelect) onSelect(b.id);
                }}
                className={`flex w-full items-center px-4 border-b border-[var(--color-stroke-neutral)] transition-all text-left no-underline ${
                  isActive
                    ? "py-4 bg-[var(--sidebar-active-bg)]"
                    : "py-4 hover:bg-[var(--color-alert-warm-bg)]"
                }`}
              >
                <div className="flex justify-between w-full">
                  <div className="leading-tight flex-1">
                    <div className="flex items-center font-semibold text-base text-[var(--color-neutral-secondary)]">
                      {b.name}
                    </div>
                    <div className="flex text-sm text-[var(--color-stroke-brand)] font-normal pt-1">
                      {b.client_id || ""} | {b.organization_name || ""}
                    </div>
                  </div>
                  <div>
                    <Badge
                      color={verticalName.toLowerCase()}
                      className="leading-none flex items-center space-x-2 w-max cursor-pointer"
                    >
                      <Icon
                        name="inventory"
                        className={`w-4 h-4 ${getIconColor(verticalName)}`}
                      />
                    </Badge>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}