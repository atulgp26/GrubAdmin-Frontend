import { useState, useRef, useEffect } from "react";
import { FaAngleDown } from "react-icons/fa6";
import SearchWithSuggestions from "./SearchWithSuggestions";
import SearchInput from "./SearchInput";
import { IoMdSearch } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";

export default function MultiSelectDropdown({
  options = [],
  selected = [],
  setSelected,
  placeholder = "Select box",
  className = "",
  style = {},
  hideComponent,
  notificationIcon,
  padding = "",
  placeholderColor = "",
  fontsize = "",
  dropdownwidth = "",
  closeSignal,
  onOpenChange,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Notify parent when open state changes
  // Notify parent only when `open` changes; avoid depending on callback identity
  const cbRef = useRef(onOpenChange);
  useEffect(() => { cbRef.current = onOpenChange; }, [onOpenChange]);
  useEffect(() => {
    if (typeof cbRef.current === 'function') cbRef.current(open);
  }, [open]);

  // External close trigger - incrementing signal closes dropdown
  useEffect(() => {
    if (closeSignal !== undefined) {
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeSignal]);

  // Improved search: case-insensitive, space-insensitive, ignores '#'
  const normalize = str => str?.toLowerCase().replace(/\s+/g, '').replace('#', '');

  const filteredOptions = options.filter(opt => {
    const searchNorm = normalize(search);
    const labelNorm = normalize(opt.label);
    const codeNorm = opt.code ? normalize(opt.code) : '';
    return labelNorm.includes(searchNorm) || codeNorm.includes(searchNorm);
  });

  const handleToggle = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((sid) => sid !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  let buttonLabel = placeholder;
  if (selected.length === 1) {
    const sel = options.find((o) => o.id === selected[0]);
    buttonLabel = sel ? sel.label : placeholder;
  } else if (selected.length > 1) {
    const sel = options.find((o) => o.id === selected[0]);
    buttonLabel = sel ? `${sel.label} (+${selected.length - 1})` : `${selected.length} selected`;
  }
  if (selected.length === options.length && options.length > 0) {
    buttonLabel = placeholder;
  }

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Dropdown Button */}
      <button
        type="button"
        className={`rounded-lg ${padding} px-3 py-1.5 flex items-center justify-between bg-white  hover:bg-[var(--color-neutral-secondary-bg)] focus:outline-none text-[var(--color-neutral-secondary)] ${placeholderColor} text-sm font-normal transition-colors ${!style.width ? 'w-[200px]' : ''} ${!style.height ? 'h-8' : ''} ${open ? 'border border-[var(--info-panel-view-bg)] !text-[var(--color-neutral-secondary)] focus:ring-0 focus:shadow-[0_0_0_2px_var(--color-shadow-select)]' : 'border border-[var(--color-box-border)]'}`}
        style={style}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`truncate select-none text-sm ${fontsize} leading-tight font-normal`}>{buttonLabel}</span>
        <span
          className={`ml-2 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
        >
          <FaAngleDown className={`w-4 h-4 ${open ? "text-[var(--info-panel-view-bg)]" : notificationIcon ? "text-[var(--color-stroke-brand)]" : "text-[var(--info-panel-view-bg)]"}`} />
        </span>
      </button>

      {/* Dropdown Content */}
      {open && (
        <div
          className={`absolute z-20 mt-2 ${dropdownwidth} border border-[var(--color-stroke-neutral)] text-[var(--color-neutral-secondary)] bg-white shadow-[4px_4px_8px_0px_var(--color-notif-shadow-soft),0px_0px_4px_0px_var(--color-notif-shadow-strong)] rounded-lg overflow-hidden animate-fadein`}
          style={{ width: style.width || '200px' }}
        >
          {/* Search */}

          <SearchInput
            type="text"
            value={search}
            icon={<><IoSearchOutline className="w-5 h-5 text-[var(--color-neutral-light)] absolute left-6 top-[24px] -translate-y-1/2 pointer-events-none" /></>}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            clearable={true}
            placeholder="Search"
            className={`${hideComponent ? "hidden" : ""} w-full !py-2 !px-3 border-b !rounded-b-none border-[var(--color-stroke-neutral)]`}
          />


          {/* Options */}
          <div className="max-h-60 overflow-y-auto divide-y divide-[var(--color-stroke-neutral)]">
            {filteredOptions.length === 0 && (
              <div className="px-4 py-2 text-[var(--color-neutral-light)] text-sm">No results found.</div>
            )}
            {filteredOptions.map((opt, idx) => {
              const isChecked = selected.includes(opt.id);
              const isLast = idx === filteredOptions.length - 1;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`flex items-center w-full px-3 py-2 text-sm font-normal gap-2 ${isChecked
                    ? "bg-[var(--sidebar-active-bg)] "
                    : "hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)] text-[var(--color-neutral-secondary)]"
                    }`}
                  onClick={() => handleToggle(opt.id)}
                >
                  {/* Checkbox */}
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded border mr-2 ${isChecked
                      ? "bg-[var(--color-brand-primary-btn)] !border-none"
                      : "bg-white border-[var(--color-brand-primary-btn)] hover:border-[var(--color-filter-text)] active:shadow-[0px_0px_0px_2px_var(--select-checkbox-shadow)]"
                      }`}
                  >
                    {isChecked && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>

                  {/* Label and sublabel */}
                  <div className="flex flex-col gap-2  justify-center text-left">
                    <span className={` font-normal text-sm leading-tight${isChecked ? " text-[var(--color-neutral-primary)]" : " text-[var(--color-neutral-secondary)]"}`}>{opt.label}</span>
                    {opt.code && (
                      <span className={`text-xs${isChecked ? " text-[var(--color-neutral-secondary)]" : " text-[var(--color-neutral-light)]"} leading-tight`}>
                        {opt.code}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Select All + Count Footer (merged) */}
          <div
            className={`${hideComponent ? "hidden" : ""} flex items-center px-3 py-2 border-t border-[var(--color-box-border)] bg-[var(--color-neutral-secondary-bg)] cursor-pointer select-none`}
            onClick={() => {
              const allIds = filteredOptions.map(opt => opt.id);
              const allSelected = allIds.length > 0 && allIds.every(id => selected.includes(id));
              if (allSelected) {
                setSelected(selected.filter(id => !allIds.includes(id)));
              } else {
                setSelected(Array.from(new Set([...selected, ...allIds])));
              }
            }}
          >
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded border mr-2 ${filteredOptions.length > 0 && (filteredOptions.every(opt => selected.includes(opt.id)) || filteredOptions.some(opt => selected.includes(opt.id)))
                ? "bg-[var(--color-checkbox-bg)] !border-none"
                : "bg-white border-[var(--color-brand-primary-btn)]"
                }`}
            >
              {/* Show minus for partial, check for all, nothing for none */}
              {filteredOptions.length > 0 && filteredOptions.every(opt => selected.includes(opt.id)) && (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {filteredOptions.length > 0 && !filteredOptions.every(opt => selected.includes(opt.id)) && filteredOptions.some(opt => selected.includes(opt.id)) && (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="white"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <line x1="6" y1="12" x2="18" y2="12" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
            </span>
            <span className="pl-2 font-normal text-base text-[var(--color-neutral-secondary)]">
              {filteredOptions.length === 0
                ? "Select All"
                : filteredOptions.every(opt => selected.includes(opt.id))
                  ? `${filteredOptions.length} selected`
                  : selected.filter(id => filteredOptions.some(opt => opt.id === id)).length > 0
                    ? `${selected.filter(id => filteredOptions.some(opt => opt.id === id)).length} selected`
                    : "Select All"
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
