import React from "react";

export default function TableCheckbox({ checked, onChange, indeterminate = false, colorVar = "--color-checkbox-bg", ...props }) {
  // Compute the style for checked or indeterminate state
  const checkedStyle = (checked || indeterminate)
    ? {
        background: `var(${colorVar})`,
        borderColor: `var(${colorVar})`,
      }
    : {};

  return (
    <label className="inline-flex items-center justify-center w-6 h-6 cursor-pointer relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="absolute opacity-0 w-0 h-0 peer"
        {...props}
      />
      <span
        className={`w-5 h-5 flex items-center justify-center rounded border border-[var(--color-checkbox-bg)] peer-hover:border-[var(--notif-border)] peer-hover:bg-[var(--color-neutral-secondary-bg)] peer-active:shadow-[0_0_0_2px_var(--color-tablecheckbox-shadow)] peer-active:scale-95 ${(checked || indeterminate) ? "border border-none peer-hover:!bg-[var(--notif-border)] peer-active:!bg-[var(--color-checkbox-bg)] peer-active:!shadow-[0_0_0_2px_var(--color-tablecheckbox-shadow)]" : "bg-white"}`}
        style={checkedStyle}
      >
        {checked && !indeterminate && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 10.5L9 14L15 7"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {indeterminate && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 10H15"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </label>
  );
}
