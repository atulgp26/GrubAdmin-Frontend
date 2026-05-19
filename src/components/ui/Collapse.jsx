import { useRef, useEffect } from "react";
import Switch from "@/components/ui/Switch";
import Icon from "./Icon";
import Button from "./Button";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
export default function Collapse({ title, titleColor, isSettings, icon, children, align, open, onClick, details_accordian, restaurantTable, pagination }) {
  const contentRef = useRef(null);
  useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    // Reset height to 0 first to force recalc
    el.style.maxHeight = "0px";
    // Wait for next frame to allow DOM to settle, then set height again
    requestAnimationFrame(() => {
      if (open) {
        el.style.maxHeight = el.scrollHeight + "px";
      }
    });
  }, [open, children]);
  return (
    <div className={`${details_accordian ? "" : "bg-[var(--very-light-gray)]"} mb-6`}>
      <button
        className={`w-full flex ${align} justify-between items-center px-4 py-4 text-left font-normal text-base text-[var(--color-neutral-secondary)] bg-[var(--color-neutral-secondary-bg)] hover:bg-[var(--color-neutral-secondary-bg)] transition focus:outline-none`}
        onClick={onClick}
        aria-expanded={open}
        type="button"
      >
        {icon ?
          <div className="flex items-center gap-2">
            <Icon name={icon} />
            <span className={`${details_accordian ? "text-[var(--color-stroke-brand)] font-semibold" : "text-[var(--color-stroke-brand)] font-normal"} ${titleColor} text-sm hover:underline`}>{title}</span>
          </div> :
          <span className={`${details_accordian ? "text-[var(--color-stroke-brand)] font-semibold" : "text-[var(--color-stroke-brand)] font-normal"} ${titleColor} text-sm hover:underline`}>{title}</span>
        }
        {isSettings ?
          <div className="flex items-center gap-2">
            <span onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
              <Switch /> ON
            </span>
            <svg
              className={`w-6 h-6 text-[var(--color-neutral-primary)] transform transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div> :
          <div className="flex items-center gap-10">
            {pagination ? (
              <div className="flex items-center gap-3" onClick={(e)=> e.stopPropagation()}>
                <span className="text-sm text-[var(--color-stroke-brand)]">{pagination?.rangeText ?? ""}</span>
                <Button
                  variant="grayOutline"
                  className="flex !px-2 items-center justify-center"
                  onClick={(e)=>{ e.stopPropagation(); pagination?.onPrev && pagination.onPrev(); }}
                  disabled={pagination?.disablePrev}
                >
                  <FaAngleLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="grayOutline"
                  className="flex !px-2 items-center justify-center"
                  onClick={(e)=>{ e.stopPropagation(); pagination?.onNext && pagination.onNext(); }}
                  disabled={pagination?.disableNext}
                >
                  <FaAngleRight className="w-4 h-4" />
                </Button>
              </div>
            ) : null}
            <svg
              className={`w-4 h-4 text-[var(--color-neutral-light)] transform transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        }
      </button>
      <div
        ref={contentRef}
        className={` transition-all duration-300 bg-white `}
        style={{ maxHeight: open ? undefined : 0 }}
      >
        <div className="px-0 pb-2 pt-1 overflow-visible">{children}</div>
      </div>
    </div>
  );
}