import React from "react";
import Button from "@/components/ui/Button";

export default function EmptyState({
  title,
  description,
  buttonLabel,
  onButtonClick,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col md:flex-row items-center justify-between ${className}`}
    >
      <div className="flex-1 text-left">
        <div className="font-normal text-base !text-[var(--color-neutral-primary)]">{title}</div>
        <div className="text-gray-600 text-sm">{description}</div>
      </div>
      {buttonLabel && (
        <Button
          className="border border-[var(--primary)] text-[var(--primary)] bg-white hover:bg-orange-50 hover:text-[var(--primary-hover)] font-medium px-6 py-2 rounded-lg text-sm"
          onClick={onButtonClick}
        >
          {buttonLabel}
        </Button>
      )}
    </div>
  );
}
