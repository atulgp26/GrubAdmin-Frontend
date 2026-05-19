"use client";

const fallbackEmployees = [
  {
    id: "1",
    name: "Ravi Kumar",
    empId: "#DL12345",
    role: "Manager",
  },
];

export default function LogsSidebar({
  employees = fallbackEmployees,
  currentId,
  onSelect,
}) {
  return (
    <div className="w-60 bg-white flex flex-col h-full">
      <div className="flex-1 overflow-y-auto border-r border-[var(--color-stroke-neutral)]">
        {employees.map((employee) => {
          const isActive = employee.id === currentId;
          return (
            <button
              key={employee.id}
              type="button"
              onClick={() => onSelect?.(employee.id)}
              className={`flex w-full items-center px-4 border-b border-[var(--color-stroke-neutral)] text-left transition-all ${
                isActive
                  ? "py-4 bg-[var(--sidebar-active-bg)]"
                  : "py-4 hover:bg-[var(--color-alert-warm-bg)]"
              }`}
            >
              <div className="leading-tight flex-1">
                <div className="flex items-center font-semibold text-base text-[var(--color-neutral-secondary)]">
                  {employee.name}
                </div>
                <div className="flex text-sm text-[var(--color-stroke-brand)] font-normal pt-1">
                  {employee.empId} | {employee.role}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
