import React, { useState } from 'react';

export default function CustomTooltip({ 
  title, 
  placement = "bottom", 
  arrowPosition = "left",
  children,
  onClick,
  className = "",
  ...props 
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div 
          className={`absolute z-50 ${className}`}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          <div
            className={`relative bg-white border border-white rounded-lg shadow-[0_0_4px_0_var(--color-notif-shadow-soft)] p-3 w-max ${
              placement === "bottom" ? "top-2" : "top-2"
            } ${
              arrowPosition === "left" ? "left-0" : 
              arrowPosition === "right" ? "right-0" : 
              "left-1/2 transform -translate-x-1/2"
            }`}
          >
            {/* Arrow pointing up */}
            <div
              className={`absolute w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-white ${
                arrowPosition === "left" ? "left-3 -top-[6px]" : 
                arrowPosition === "right" ? "right-3 -top-[6px]" : 
                "left-1/2 transform -translate-x-1/2 -top-[6px]"
              }`}
            />
            
            {/* Arrow border */}
            <div
              className={`absolute w-0 h-0 border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent border-b-white ${
                arrowPosition === "left" ? "left-3 -top-[7px]" : 
                arrowPosition === "right" ? "right-3 -top-[7px]" : 
                "left-1/2 transform -translate-x-1/2 -top-[7px]"
              }`}
            />
            
            {/* Content */}
            <div onClick={onClick} className="text-sm cursor-pointer font-normal text-[var(--color-stroke-brand)]">
              {title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
