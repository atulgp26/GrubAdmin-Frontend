"use client"
import Icon from "@/components/ui/Icon"

export default function NavItem({ icon, label, isActive, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      suppressHydrationWarning
      className={`group w-full flex items-center text-base font-semibold space-x-3 px-4 py-2 my-4 rounded-lg text-left transition-colors border-2
        ${disabled
          ? "bg-transparent text-[var(--color-neutral-primary)] border-transparent cursor-not-allowed opacity-60"
          : isActive
            ? "bg-[var(--sidebar-active-bg)] border-[var(--color-filter-text)] active:border-[var(--info-panel-view-bg)] active:shadow-[0_0_0_2px_var(--color-sidebar-shadow)] active:bg-[var(--color-admin-profile-border)]"
            : "bg-transparent text-[var(--color-neutral-secondary)] border-transparent hover:bg-[var(--sidebar-active-bg)] hover:border-[var(--color-filter-text)] active:border-[var(--info-panel-view-bg)] active:shadow-[0_0_0_2px_var(--color-sidebar-shadow)] active:bg-[var(--color-admin-profile-border)]"
        }`}
    >
      <Icon name={icon} className={`w-5 h-5 ${isActive ? "text-[var(--color-filter-text)]" : "text-[var(--color-neutral-light)] group-hover:text-[var(--info-panel-view-bg)] group-active:text-[var(--color-filter-text)]"}`} />
      <span className={`text-base font-semibold ${isActive ? "text-[var(--color-neutral-secondary)]" : disabled ? "text-[var(--color-neutral-light)]" : "text-[var(--color-neutral-secondary)]"}`}>{label}</span>
    </button>
  )
}
