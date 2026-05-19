import React, { useEffect, useRef, useState } from "react";

export default function TemperatureSlider() {
  const [temp, setTemp] = useState(25);
  const [sliderHeight, setSliderHeight] = useState(332);
  const sliderRef = useRef(null);

  const minTemp = 20;
  const maxTemp = 70;

  useEffect(() => {
    const updateSliderHeight = () => {
      if (sliderRef.current) {
        const height = sliderRef.current.offsetHeight;
        setSliderHeight(height);
      }
    };
    updateSliderHeight();
    window.addEventListener("resize", updateSliderHeight);
    return () => window.removeEventListener("resize", updateSliderHeight);
  }, []);

  const handleDrag = (e) => {
    if (!sliderRef.current) return;
    const sliderRect = sliderRef.current.getBoundingClientRect();
    let offsetY = e.clientY - sliderRect.top;

    let newTemp =
      maxTemp - (offsetY / sliderHeight) * (maxTemp - minTemp);
    newTemp = Math.max(minTemp, Math.min(maxTemp, Math.round(newTemp)));

    setTemp(newTemp);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    const onMouseMove = (e) => handleDrag(e);
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const position = ((maxTemp - temp) / (maxTemp - minTemp)) * sliderHeight;

  return (
    <div className="flex items-center h-full gap-4">
      {/* Temperature scale */}
      <div className="flex flex-col items-center justify-between h-[332px] 2xl:h-[432px] text-sm text-gray-700 font-medium">
        <span className="text-sm text-[var(--color-neutral-primary)]">70°C</span>
        <span className="text-sm text-[var(--color-stroke-brand)]">25°C</span>
        <span className="text-sm text-[var(--color-stroke-brand)]">20°C</span>
      </div>

      {/* Slider */}
      <div className="flex flex-col items-center gap-2">
        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          className="relative 2xl:w-4 w-3 h-[332px] 2xl:h-[432px] rounded-full cursor-pointer"
        >
          {/* Gradient track */}
          <div className="absolute w-full h-full rounded-full bg-gradient-to-b from-[var(--color-gradiant-red-bg)] via-[var(--color-gradiant-yellow-bg)] to-[var(--color-gradiant-blue-bg)] z-0" />

          {/* Gray overlay */}
          <div
            className="absolute w-full bg-[var(--color-neutral-light)] rounded-full z-10"
            style={{ height: `${position}px`, top: 0 }}
          />

          {/* Thumb */}
          <div
            className="absolute left-1/2 -translate-x-1/2 2xl:w-6 2xl:h-6 w-5 h-5 bg-white border border-[var(--color-box-border)] rounded-full z-20"
            style={{ top: `${position - 8}px` }}
          />
        </div>
      </div>

      {/* Temperature labels */}
      <div className="flex flex-col items-center justify-between h-[332px] 2xl:h-[432px] text-sm font-medium">
        <div className="px-2 py-1 rounded-md bg-[var(--color-neutral-secondary-bg)] text-[var(--notif-border)] underline shadow-sm border border-[var(--notif-border)]">Hot</div>
        <div className="px-2 py-1 rounded-md bg-[var(--color-neutral-secondary-bg)] text-[var(--notif-border)] shadow-sm border border-[var(--notif-border)]">Warm</div>
        <div className="px-2 py-1 rounded-md bg-[var(--color-neutral-secondary-bg)] text-[var(--notif-border)] shadow-sm border border-[var(--notif-border)]">Cold</div>
      </div>
    </div>
  );
}
