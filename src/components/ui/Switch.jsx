// app/components/ToggleButton.tsx or any component path
"use client";
import { useState } from "react";

export default function ToggleButton() {
  const [isOn, setIsOn] = useState(false);

  return (
    <button
      onClick={() => setIsOn(!isOn)}
      className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors duration-300 
        ${isOn ? "bg-[var(--color-success)]" : "bg-[var(--color-checkbox-bg)]"}`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300
          ${isOn ? "translate-x-3" : "translate-x-0"}`}
      ></div>
    </button>
  );
}
