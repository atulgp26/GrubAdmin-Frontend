// Add this comment at the top:
// Make sure to define --very-light-gray in your global CSS, e.g. :root { --very-light-gray: #F7F7F8; }
export function Table({ children, ...props }) {
  return <table className="table-fixed !w-full" {...props}>{children}</table>;
}

export function TableHead({ children, ...props }) {
  return <thead className="border-b border-[var(--color-stroke-neutral)]" {...props}>{children}</thead>;
}

export function TableBody({ children, ...props }) {
  return <tbody className="divide-y divide-[var(--color-stroke-neutral)]" {...props}>{children}</tbody>;
}

export function TableRow({ children, active = false, ...props }) {
  return (
    <tr
      className={
        active
          ? "w-full bg-[var(--color-neutral-secondary-bg)] hover:bg-[var(--color-neutral-secondary-bg)]"
          : "hover:bg-[var(--color-neutral-secondary-bg)]"
      }
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "", ...props }) {
  return <td className={`table-cell ${className}`} {...props}>{children}</td>;
} 