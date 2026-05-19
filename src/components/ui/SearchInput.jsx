import { MdSearch, MdClose } from "react-icons/md";
import { useState, useRef } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Button from "./Button";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className = "",
  clearable,
  onfocus,
  help,
  icon,
  height="",
  padding="",
  searchIconHidden,
  searchText="",
  onClear,
  borderType = "full", // NEW PROP
  showSuggestions, // Extract to prevent passing to DOM
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const showActive = focused || (value && value.length > 0);

  return (
    <div
      className={`relative bg-white rounded-lg flex items-center transition-colors duration-150 ${className}`}
    >
      {
        icon?icon:
        <IoSearchOutline className={`${searchIconHidden?"hidden":""} absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-4 text-[var(--color-neutral-light)] pointer-events-none`} />
      }
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-input ${height} h-8 placeholder:text-[var(--color-neutral-light)] text-[var(--color-neutral-secondary)] ${searchText} text-sm ${padding} pl-10 pr-10 bg-transparent ${
          borderType === "bottom"
            ? "border-0 border-b-2 border-b-[var(--color-box-border)] hover:border-b-[var(--color-brand-default)] focus:border-b-[var(--color-brand-default)] border-solid":
                       help?"border-b border-[var(--color-box-border)] focus:ring-0 focus:outline-none focus:shadow-[0_0_0_2px_var(--color-shadow-select)] focus:border-[var(--color-brand-default)]" : "focus:ring-0 focus:outline-none focus:shadow-[0_0_0_2px_var(--color-shadow-select)] border rounded-lg border-[var(--color-box-border)] hover:bg-[var(--color-neutral-secondary-bg)] focus:border-[var(--info-panel-view-bg)] border-solid"
        } `}
        style={{ width: '-webkit-fill-available' }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {value && value.length > 0 && (
        <Button
        variant="icon"
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-0.5 rounded-full"
          onClick={() => {
            if (onClear) onClear();
            // Optionally focus back to input
            inputRef.current && inputRef.current.focus();
          }}
          tabIndex={-1}
        >
          <MdClose className="w-5 h-5 text-[var(--info-panel-view-bg)]" />
        </Button>
      )}
    </div>
  );
}
