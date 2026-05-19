"use client";
import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

const MobileNotSupported = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      
      // Check for mobile devices
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileDevice = mobileRegex.test(userAgent.toLowerCase());
      
      // Also check screen width as additional check
      const isSmallScreen = window.innerWidth < 1024;
      
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--color-neutral-primary)] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[var(--color-neutral-secondary-bg)] flex items-center justify-center">
            <Icon 
              name="computer_access" 
              className="w-10 h-10 text-[var(--color-stroke-brand)]"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
            Mobile Not Supported
          </h1>
          <p className="text-base text-[var(--color-stroke-brand)] leading-relaxed">
            This application is designed for desktop and laptop computers. 
            Please access it from a laptop or desktop device for the best experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileNotSupported;

