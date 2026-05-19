export default function Badge({
  children,
  className = "",
  color = "orange",
  ...props
}) {
  const colorMap = {
    orange: "border-[var(--color-alert-warm)] bg-[var(--color-alert-warm-bg)] text-[var(--color-alert-warm)]",
    red: "border-[var(--color-alert-warm)] bg-[var(--toast-error-bg)] text-[var(--notif-error)]",
    green: "border-[var(--notif-success)] bg-[var(--toast-success-bg)] text-[var(--notif-success)]",
    gray: "border border-[var(--color-box-border)] bg-transparent text-[var(--color-neutral-secondary)] text-sm",
    medical: "border border-[var(--color-help-icon)] text-[var(--color-neutral-secondary)] hover:bg-[var(--color-help-icon)] hover:border-[var(--color-icon-medical)] transition-all duration-200",
    delivery: "border border-[var(--color-admin-profile-border)] text-[var(--color-neutral-secondary)] hover:bg-[var(--color-admin-profile-border)] hover:border-[var(--info-panel-view-bg)] transition-all duration-200",
    hospitality: "border border-[var(--color-brand-icon)] text-[var(--color-neutral-secondary)] hover:bg-[var(--color-brand-icon)] hover:border-[var(--color-brand-default)] transition-all duration-200",
    camping: "border border-[var(--color-badge-camping)] text-[var(--color-neutral-secondary)] hover:bg-[var(--color-badge-camping)] hover:border-[var(--color-icon-camping)] transition-all duration-200",
  };

  return (
    <span
      className={`text-center items-center gap-x-1 rounded-full border px-3 py-1.5 text-sm font-medium ${colorMap[color] || ""} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
} 
