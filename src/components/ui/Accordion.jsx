import React, { useState } from "react";
export default function Accordion({ items,helpaccordian, className = "",escalation }) {
  const [open, setOpen] = useState(0);
  return (
    <div className={`border-t border-b border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] ${className}`}>
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="w-full flex items-center gap-3 py-4 px-2 focus:outline-none "
            onClick={() => setOpen(open === i ? -1 : i)}
            aria-expanded={open === i}
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-md bg-white text-[var(--color-brand-default)]">
              {item.icon}
            </span>
            <div className="flex items-center justify-between w-full">
            <span className={helpaccordian ? "font-semibold text-base text-[var(--color-neutral-secondary)]" : `font-medium text-sm text-[var(--color-neutral-primary)] flex-1 text-left`}>{item.question}</span>
            <span className={`ml-2 text-[var(--color-stroke-brand)] pr-5`}>
              <svg className={`w-5 h-5 transition-transform ${open === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </span>
            </div>
          </button>
          {
            escalation?
            <>
          {open === i && (
            <div className={`w-[600px] ${escalation?"grid grid-cols-6":""} ${helpaccordian? "px-2 pb-6 whitespace-pre-line text-[var(--color-neutral-secondary)] text-base" : `px-12 pb-6 text-sm text-gray-700 whitespace-pre-line`}`}>
              <div className="flex flex-col gap-6 col-span-1">
              <span className="text-[var(--color-stroke-brand)] text-sm leading-relaxed">Subject :</span>
              <span className="text-[var(--color-stroke-brand)] text-sm leading-relaxed">Body :</span>
              </div>
              <div className="flex flex-col gap-6 col-span-5">
              <span className="text-[var(--color-neutral-secondary)] ">{item.subject}</span>
              <span className="text-[var(--color-neutral-secondary)] leading-loose text-base pb-1">{item.body}</span>
              </div>
            </div>
          )}
            </>
            :
            <>
          {open === i && (
            <div className={helpaccordian? "px-12 pb-6 whitespace-pre-line text-[var(--color-neutral-secondary)] text-base" : `px-2 pb-6 text-sm text-gray-700 whitespace-pre-line`}>
              {item.answer}
            </div>
          )}
            </>
          }
        </div>
      ))}
    </div>
  );
}
