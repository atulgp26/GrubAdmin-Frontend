"use client";

import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";

export const defaultClientSidebarEntries = [
  {
    id: "1",
    name: "Ravi Kumar",
    code: "#DL12345",
    role: "Brookstone Foods",
    status: "camping",
  },
  {
    id: "2",
    name: "Neha Sharma",
    code: "#DL12378",
    role: "Harvest Delight",
    status: "medical",
  },
  {
    id: "3",
    name: "Arjun Patel",
    code: "#DL12402",
    role: "Bluewave Catering",
    status: "delivery",
  },
  {
    id: "4",
    name: "Meera Joshi",
    code: "#DL12426",
    role: "Summit Supplies",
    status: "medical",
  },
  {
    id: "5",
    name: "Kunal Verma",
    code: "#DL12451",
    role: "Urban Taste Collective",
    status: "hospitality",
  },
  {
    id: "6",
    name: "Priya Singh",
    code: "#DL12478",
    role: "Greenfield Organics",
    status: "medical",
  },
  {
    id: "7",
    name: "Dev Mehta",
    code: "#DL12504",
    role: "Metro Meal Services",
    status: "medical",
  },
  {
    id: "8",
    name: "Ananya Iyer",
    code: "#DL12532",
    role: "Coastal Comfort Kitchens",
    status: "medical",
  },
];

export default function ClientLogsSidebar({
  clients = defaultClientSidebarEntries,
  currentId,
  onSelect,
}) {
  const getIconColor = (vertical) => {
    switch (vertical.toLowerCase()) {
      case "medical":
        return "text-[var(--color-icon-medical)]";
      case "delivery":
        return "text-[var(--info-panel-view-bg)]";
      case "hospitality":
        return "text-[var(--color-brand-default)]";
      case "camping":
        return "text-[var(--color-icon-camping)]";
      default:
        return "text-[var(--info-panel-view-bg)]"; // fallback
    }
  };

  return (
    <div className="w-60 bg-white flex flex-col h-full">
    
      <div className="flex-1 overflow-y-auto border-r border-[var(--color-stroke-neutral)]">
        {clients.map((b) => {
          const isActive = b.id === currentId;
          return (
            <button
              type="button"
              key={b.id}
              onClick={() => onSelect?.(b.id)}
              className={`flex w-full items-center px-4 border-b border-[var(--color-stroke-neutral)] transition-all text-left ${
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
                    {b.code} | <br /> {b.role}
                  </div>
                </div>
                <div>
                  <Badge
                    color={`${b.status.toLowerCase()}`}
                    className="leading-none flex items-center space-x-2 w-max cursor-pointer"
                  >
                    <Icon
                      name="inventory"
                      className={`w-4 h-4 ${getIconColor(b.status)}`}
                    />
                  </Badge>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
