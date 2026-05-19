import React, { useState } from "react";
import HelpSearchBar from "@/components/ui/HelpSearchBar";
import Button from "@/components/ui/Button";

function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "ig");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="font-semibold text-[var(--color-neutral-secondary)]">{part}</span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

export default function HelpSearchInput({ data = [], onSelect, placeholder = "Search FAQs" }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const filtered =
    value.trim().length > 0
      ? data.filter(
          (item) =>
            (item.title && item.title.toLowerCase().includes(value.toLowerCase())) ||
            (item.subtitle &&
              item.subtitle.toLowerCase().includes(value.toLowerCase()))
        )
      : [];

  return (
    <div className="w-full relative">
      <HelpSearchBar
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder={placeholder}
        className="w-full"
        clearable
        onClear={() => setValue("")}
      />
      {focused && filtered.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white border-[var(--color-stroke-brand)] divide-y divide-[var(--color-stroke-neutral)] rounded-lg shadow-[4px_4px_8px_0px_var(--color-notif-shadow-soft),0px_0px_4px_0px_var(--color-notif-shadow-strong)] z-20 overflow-hidden">
          {filtered.map((item, idx) => (
            <Button
              key={idx}
              variant="ghost"
              className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-100 rounded-none"
              onMouseDown={() => {
                onSelect?.(item);
                setValue("");
              }}
            >
              <div className="text-[var(--color-neutral-secondary)] text-base text-left">
                {highlightMatch(item.title, value)}
              </div>
              {item.subtitle && (
                <div className="text-xs text-[var(--color-stroke-brand)] mt-0.5 text-left">
                  {highlightMatch(item.subtitle, value)}
                </div>
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
