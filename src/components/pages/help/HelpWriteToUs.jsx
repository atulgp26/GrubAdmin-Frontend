import React from "react";
import Button from "@/components/ui/Button";
import { FiArrowUpRight } from "react-icons/fi";

export default function HelpWriteToUs({
  className = "",
  onClick,
  title = "Still having doubts?",
  body = "You can write to us at support@grubpac.com and we'll get back to you as soon as possible.",
  buttonLabel = "WRITE TO US",
}) {
  return (
    <div
      className={`bg-[var(--color-helpwrite-bg)] border border-[var(--notif-warning)] rounded-lg p-4 flex items-center justify-between ${className}`}
    >
      <div>
        <div className="font-semibold text-[var(--color-neutral-primary)] text-base mb-1">
          {title}
        </div>
        <div className="text-[var(--color-neutral-secondary)]">
          {body}
        </div>
      </div>
      <Button
        variant="primary"
        bgColor="var(--color-helpwrite-btn)"
        borderColor="var(--notif-warning)"
        className="font-medium px-6 py-2 btn-size-md-sm ml-4 text-white !rounded-lg flex items-center gap-2"
        style={{
          backgroundColor: 'var(--color-helpwrite-btn)',
          borderColor: 'var(--notif-warning)',
          color: 'white'
        }}
        onClick={onClick}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--color-success-dark)';
          e.target.style.textDecoration = 'underline';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'var(--color-helpwrite-btn)';
          e.target.style.textDecoration = 'none';
        }}
        onMouseDown={(e) => {
          e.target.style.backgroundColor = 'var(--color-helpwrite-border)';
          e.target.style.textDecoration = 'underline';
          e.target.style.boxShadow = '0 0 0 2px rgba(92,169,64,0.40)';
        }}
        onMouseUp={(e) => {
          e.target.style.backgroundColor = 'var(--color-success-dark)';
          e.target.style.textDecoration = 'underline';
          e.target.style.boxShadow = 'none';
        }}
      >
        <span>{buttonLabel}</span>
        <FiArrowUpRight className="w-4 h-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
