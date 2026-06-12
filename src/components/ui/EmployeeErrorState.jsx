"use client";
import React from "react";

export default function EmployeeErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[var(--color-neutral-secondary)]">
      <div className="w-12 h-12 mb-4 text-[var(--notif-error)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-full h-full"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <div className="text-base font-medium mb-2 text-[var(--color-neutral-primary)]">
        Failed to load employees
      </div>
      <div className="text-sm text-[var(--color-stroke-brand)] mb-6 text-center max-w-md">
        {message || "Something went wrong while loading the employee list. Please try again."}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[var(--color-brand-primary-btn)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
        >
          Try again
        </button>
      )}
    </div>
  );
}
