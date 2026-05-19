import React, { useRef, useEffect } from "react";

const TextArea = ({ placeholder, value, onChange }) => {
  const textareaRef = useRef(null);

  // Auto-resize on content change
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // adjust based on content
    }
  }, [value]);

  const parentBorder =
    "border rounded-lg border-[var(--color-box-border)] bg-white focus:border-[var(--info-panel-view-bg)] focus:bg-white focus:shadow-[0_0_0_4px_var(--color-shadow-select)]";

  return (
    <textarea
      ref={textareaRef}
      className={`w-full p-3 resize-none overflow-hidden ${parentBorder} hover:bg-[var(--color-neutral-secondary-bg)] text-[var(--color-neutral-secondary)] placeholder:text-[var(--color-neutral-light)] focus:outline-none`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

export default TextArea;
