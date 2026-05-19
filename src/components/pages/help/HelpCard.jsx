import React from "react";
import Link from "next/link";

export default function HelpCard({
  onClick,
  href,
  className = "",
  children,
  protocol
}) {
  const content = (
    <div className={`w-full ${protocol?"":"flex flex-col items-center justify-center"} border border-[var(--color-stroke-neutral)] rounded-lg bg-white hover:shadow-md transition h-[calc(50vh-174px)] ${className}`}>
      {children}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="w-full">
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="w-full" type="button">
      {content}
    </button>
  );
}
