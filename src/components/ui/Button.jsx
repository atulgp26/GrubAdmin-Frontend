import { forwardRef } from "react";
const Button = forwardRef(({ children, variant = "primary", size = "md", disabled, className = "", bgColor, borderColor, style = {}, ...props }, ref) => {
  const baseClasses = "btn";
  const variants = {
    primary: "btn-primary hover:underline",
    secondary: "bg-white border hover:underline border-[var(--info-panel-view-bg)] text-[var(--info-panel-view-bg)] active:bg-[var(--color-admin-profile-border)] active:border-[var(--info-panel-view-bg)] active:shadow-[0_0_0_2px_var(--color-shadow-select)] hover:bg-[var(--sidebar-active-bg)] hover:border-[var(--color-filter-text)] hover:text-[var(--color-filter-text)] focus:bg-[var(--sidebar-active-bg)] focus:border-[var(--color-filter-text)] disabled:bg-[var(--color-neutral-secondary-bg)] disabled:border-[var(--color-stroke-neutral)] disabled:text-[var(--color-box-border)] disabled:cursor-not-allowed focus:shadow-[0_0_0_2px_var(--color-shadow-select)]",
    text: "bg-transparent hover:underline group border-none text-[var(--color-stroke-brand)] hover:bg-[var(--color-neutral-secondary-bg)]  hover:text-[var(--notif-border)] active:bg-[var(--color-stroke-neutral)] active:shadow-[0_0_0_2px_var(--color-tablecheckbox-shadow)] text-base",
    textSecondary: "bg-transparent hover:underline group border-none text-[var(--info-panel-view-bg)] hover:bg-[var(--sidebar-active-bg)]  hover:text-[var(--color-filter-text)] active:bg-[var(--color-admin-profile-border)] active:shadow-[0_0_0_2px_var(--color-shadow-select)] text-base",
    skip: "bg-transparent hover:underline group border-none text-[var(--color-stroke-brand)] hover:bg-[var(--color-neutral-secondary-bg)]  hover:text-[var(--notif-border)] active:bg-[var(--color-stroke-neutral)] text-xl",
    cancel: "bg-transparent hover:underline group border-none text-[var(--color-stroke-brand)] hover:bg-[var(--color-neutral-secondary-bg)]  hover:text-[var(--notif-border)] active:bg-[var(--color-stroke-neutral)] active:shadow-[0_0_0_2px_var(--color-tablecheckbox-shadow)] focus:bg-[var(--color-stroke-neutral)] focus:shadow-[0_0_0_2px_var(--color-tablecheckbox-shadow)] text-xl",
    sage: "bg-[var(--color-neutral-secondary)] text-white hover:bg-[var(--color-neutral-secondary)] focus:bg-[var(--color-neutral-secondary)]",
    lock: "bg-[var(--color-alert-warm-bg)] border border-[var(--color-alert-warm)] text-[var(--color-alert-warm)] !rounded-full hover:bg-[var(--color-alert-warm-bg)] hover:border-[var(--color-alert-warm-dark)] active:shadow-[0_0_0_2px_var(--color-filter-sbg-whitehadow)] focus:shadow-[0_0_0_4px_var(--color-success-bg)]",
    unlock: "bg-white border border-[var(--color-alert-warm)] text-[var(--color-alert-warm)] !rounded-full hover:bg-[var(--color-alert-warm-bg)] hover:border-[var(--color-alert-warm-dark)] active:shadow-[0_0_0_2px_var(--color-shadow-select)] focus:bg-[var(--color-alert-warm-bg)] focus:shadow-[0_0_0_4px_var(--color-success-bg)]",
    warmYellow: "bg-[var(--color-alert-warm-bg)] text-[var(--color-alert-warm)] hover:bg-[var(--color-alert-warm-bg)] focus:bg-[var(--color-alert-warm-bg)]",
    grayOutline: `bg-white hover:underline border border-[var(--color-stroke-brand)] text-[var(--color-stroke-brand)] font-medium
      hover:bg-[var(--color-neutral-secondary-bg)] hover:text-[var(--notif-border)] hover:border-[var(--notif-border)] active:!bg-[var(--color-stroke-neutral)] active:!border-[var(--color-stroke-brand)] active:!shadow-[0_0_0_2px_var(--color-tablecheckbox-shadow)]`,
    messaging: `bg-white border border-[var(--color-stroke-brand)] text-[var(--color-stroke-brand)] font-medium
      hover:bg-[var(--color-neutral-secondary-bg)] hover:border-[var(--notif-border)]`,
    alert: `bg-white border-2 border-transparent text-[var(--color-neutral-primary)] transition-colors
      hover:bg-[var(--color-alert-warm-bg)] hover:border-[var(--color-alert-warm)] hover:shadow-[0_0_0_4px_var(--color-success-bg)]
      active:bg-[var(--color-alert-warm-bg)] active:border-[var(--color-alert-warm-dark)] active:shadow-[0_0_0_2px_var(--color-shadow-select)]
      focus:bg-[var(--color-alert-warm-bg)] focus:border-[var(--color-alert-warm-dark)] focus:shadow-[0_0_0_4px_var(--color-success-bg)]`,
    profile:`bg-white group text-[var(--color-neutral-secondary)] active:text-[var(--color-neutral-primary)] transition-colors
      hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)]`,
    outline: "bg-white h-[56px] hover:underline border border-[var(--info-panel-view-bg)] text-[var(--info-panel-view-bg)] px-4 py-2 text-xl font-medium rounded-lg min-w-[110px] disabled:bg-[var(--color-neutral-secondary-bg)] disabled:border-[var(--color-stroke-neutral)] disabled:text-[var(--color-box-border)] hover:bg-[var(--sidebar-active-bg)] hover:border-[var(--color-filter-text)] hover:text-[var(--color-filter-text)] active:bg-[var(--color-admin-profile-border)] active:border-[var(--info-panel-view-bg)] active:shadow-[0_0_0_2px_var(--color-shadow-select)] focus:bg-[var(--color-neutral-secondary-bg)] focus:shadow-[0_0_0_4px_var(--color-success-bg)] focus:outline-none",
    disabledGray:"disabled:border disabled:bg-[var(--color-stroke-neutral)] disabled:border-[var(--color-stroke-neutral)] disabled:text-[var(--color-box-border)] border bg-[var(--color-brand-primary-btn)] border-[var(--color-brand-default)] text-white",
    actionText:"text-[var(--color-stroke-brand)] bg-transparent border-none",
    modal:"btn-primary focus:border-[var(--color-filter-text)] focus:underline focus:bg-[var(--color-filter-text)] focus:shadow-[0px_0px_0px_2px_var(--color-shadow-select)] focus:text-white",
    disabledPrimary:"bg-[var(--color-brand-primary-btn)] hover:underline text-white hover:bg-[var(--color-filter-text)] hover:border-[var(--color-filter-text)] active:bg-[var(--color-primary-btn-active)] active:border-[var(--info-panel-view-bg)] active:shadow-[0_0_0_4px_var(--color-shadow-select)] disabled:border disabled:bg-[var(--color-stroke-neutral)] disabled:border-[var(--color-stroke-neutral)] disabled:text-[var(--color-box-border)]",
    delete:"text-white hover:underline bg-[var(--color-stroke-brand)] hover:bg-[var(--notif-border)] hover:border-[var(--notif-border)] active:bg-[var(--color-neutral-secondary)] active:border-[var(--color-stroke-brand)] active:shadow-[0_0_0_4px_var(--color-tablecheckbox-shadow)] focus:bg-[var(--notif-border)] focus:border-[var(--notif-border)]",
    infoPanel:"text-[var(--info-panel-view-bg)] hover:underline hover:bg-[var(--sidebar-active-bg)] hover:text-[var(--color-filter-text)] active:bg-[var(--color-admin-profile-border)] active:shadow-[0_0_0_4px_var(--color-shadow-select)]",
    activateGreen:"text-[var(--notif-success)] hover:underline group !border cursor-pointer !border-[var(--notif-success)] bg-white hover:bg-[var(--color-success-hover)] hover:border active:border hover:text-[var(--color-success-dark)] hover:border-[var(--color-success-dark)] active:bg-[var(--toast-success-bg)] active:border-[var(--notif-success)] active:shadow-[0_0_0_4px_var(--color-success-shadow)]",
    icon:"bg-transparent hover:bg-[var(--sidebar-active-bg)] text-[var(--info-panel-view-bg)] hover:text-[var(--color-filter-text)] active:bg-[var(--color-admin-profile-border)] active:text-[var(--color-filter-text)]"
  };
  const sizes = {
    sm: "btn-size-sm",
    md: "btn-size-md",
    mdLg: "btn-size-md-lg",
    lg: "btn-size-lg",
    lgText: "btn-size-lg-text",
  };
  // Remove any hardcoded bg, border, or text color classes from className
  const filteredClassName = className
    .replace(/bg-[^\s]+/g, "")
    .replace(/border-[^\s]+/g, "")
    .replace(/text-[^\s]+/g, "")
    .replace(/hover:[^\s]+/g, "")
    .replace(/focus:[^\s]+/g, "")
    .replace(/!text-[^\s]+/g, "")
    .replace(/!bg-[^\s]+/g, "")
    .replace(/!border-[^\s]+/g, "");
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${filteredClassName} ${disabled ? "bg-[var(--color-neutral-secondary-bg)] text-[var(--color-box-border)]" : "disable:none"} rounded-lg`;
  const mergedStyle = { ...style };
  if (bgColor) mergedStyle.backgroundColor = bgColor;
  if (borderColor) mergedStyle.borderColor = borderColor;
  return (
    <button ref={ref} className={classes} style={mergedStyle} disabled={disabled} {...props}>
      {children}
    </button>
  );
});
Button.displayName = "Button";
export default Button;
