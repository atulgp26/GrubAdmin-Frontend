import React from 'react'

const CheckBoxDisable = ({ checked, onChange, indeterminate = false, disabled = false, ...props }) => {
  return (
    <label className={`inline-flex items-center justify-center w-6 h-6 ${disabled ? "cursor-not-allowed" : "cursor-default"} relative`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={disabled ? () => {} : onChange}
        disabled={disabled}
        className="absolute opacity-0 w-0 h-0 peer"
        {...props}
      />
      <span
        className={`w-5 h-5 flex items-center justify-center rounded border border-[var(--color-stroke-neutral)] peer-active:scale-95 ${(checked || indeterminate) ? "bg-[var(--color-neutral-secondary-bg)]" : "bg-[var(--color-neutral-secondary-bg)]"}`}
      >
        {checked && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 10.5L9 14L15 7"
              stroke="var(--color-neutral-light)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </label>
  )
}

export default CheckBoxDisable
