import { useState, useRef } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { MdClose } from "react-icons/md";

export default function HelpSearchBar({
  value,
  onChange,
  placeholder = "Search FAQs, guidelines, etc.",
  className = "",
  clearable,
  onClear,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  return (
    <div className={`relative bg-white flex items-center transition-colors duration-150 ${className}`}>
      <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-7 h-6 text-[var(--color-neutral-light)] pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="form-input h-12 placeholder:text-[var(--color-neutral-light)] text-[var(--color-neutral-secondary)] text-base font-normal pl-12 pr-10 bg-transparent border-0 border-b border-b-[var(--color-box-border)] hover:border-b hover:border-[var(--color-box-border)] focus:border focus:border-[var(--info-panel-view-bg)] border-solid focus:ring-0 focus:outline-none rounded-none hover:bg-[var(--color-neutral-secondary-bg)] focus:shadow-[0_0_0_4px_var(--color-shadow-select)]"
        style={{ width: '-webkit-fill-available' }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {value && value.length > 0 && (
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-0.5 rounded-none hover:bg-[var(--color-neutral-secondary-bg)] focus:bg-[var(--color-neutral-secondary-bg)]"
          onClick={() => {
            if (onClear) onClear();
            inputRef.current && inputRef.current.focus();
          }}
          tabIndex={-1}
        >
          <MdClose className="w-5 h-5 text-[var(--info-panel-view-bg)]" />
        </button>
      )}
    </div>
  );
}
