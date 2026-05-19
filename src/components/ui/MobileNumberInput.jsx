"use client";
import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { MdDone } from "react-icons/md";

const countryCodes = [
  { code: "+91", country: "India", flag: "🇮🇳" },
];

export default function MobileNumberInput({
  value = "",
  onChange,
  placeholder = "Enter mobile number",
  className = "",
  isValid = false,
  onValidationChange,
  onBlur,
  padding,
}) {
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState(value);
  
  // Validate initial value
  const validateInitialValue = (val) => {
    if (!val) return false;
    const digits = val.replace(/\D/g, "");
    return digits.length === 10;
  };
  
  const [isValidNumber, setIsValidNumber] = useState(isValid || validateInitialValue(value));
  const dropdownRef = useRef(null);

  // Format mobile number with space
  const formatMobileNumber = (number) => {
    // Remove all non-digits and limit to 10 digits
    const digits = number.replace(/\D/g, "").slice(0, 10);
    // Add space after 5 digits for better readability
    if (digits.length > 5) {
      return digits.slice(0, 5) + " " + digits.slice(5);
    }
    return digits;
  };

  // Validate mobile number - exactly 10 digits
  const validateMobileNumber = (number) => {
    const digits = number.replace(/\D/g, "");
    // Validation - exactly 10 digits
    return digits.length === 10;
  };

  // Handle mobile number change
  const handleMobileChange = (e) => {
    const formatted = formatMobileNumber(e.target.value);
    setMobileNumber(formatted);
    
    const isValid = validateMobileNumber(formatted);
    setIsValidNumber(isValid);
    
    if (onChange) {
      onChange(selectedCountry.code + formatted.replace(/\D/g, ""));
    }
    
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  };

  // Handle country code change
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    
    if (onChange) {
      onChange(country.code + mobileNumber.replace(/\D/g, ""));
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update mobile number when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      // Extract country code and number from value
      // Value format could be: "+91XXXXXXXXXX" or "+91 XXXXXXXXXX" or "XXXXXXXXXX"
      let countryCode = null;
      let numberToSet = '';
      
      // Try to find matching country code at the start
      for (const country of countryCodes) {
        if (value.startsWith(country.code)) {
          countryCode = country;
          // Remove country code from value - remove spaces and non-digits after country code
          const remaining = value.substring(country.code.length).trim();
          numberToSet = remaining.replace(/\D/g, ''); // Extract only digits
          break;
        }
      }
      
      // If no country code found, check if it's just digits or has other format
      if (!countryCode && value) {
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length > 0) {
          if (value.startsWith('+')) {
            // Has + but country code not in our list
            // Check if it starts with 91 (India)
            if (digitsOnly.startsWith('91') && digitsOnly.length > 2) {
              // Assume +91 country code
              const indiaCode = countryCodes.find(c => c.code === '+91');
              if (indiaCode) {
                countryCode = indiaCode;
                numberToSet = digitsOnly.substring(2); // Remove 91
              }
            } else {
              // Other country code, just take all digits (but won't set country)
              numberToSet = digitsOnly;
            }
          } else {
            // Plain number without country code prefix
            numberToSet = digitsOnly;
          }
        }
      }
      
      // Update country code dropdown if found
      if (countryCode && selectedCountry.code !== countryCode.code) {
        setSelectedCountry(countryCode);
      }
      
      // Update mobile number input (only digits, formatted, no country code)
      if (numberToSet || value === '') {
        const currentDigits = mobileNumber.replace(/\D/g, '');
        const newDigits = numberToSet.replace(/\D/g, '');
        
        // Only update if the digits have actually changed
        if (currentDigits !== newDigits || value === '') {
          if (numberToSet && numberToSet.length > 0) {
            const formatted = formatMobileNumber(numberToSet);
            setMobileNumber(formatted);
            // Validate the updated number - check digits, not formatted string
            const isValid = validateMobileNumber(numberToSet);
            setIsValidNumber(isValid);
            if (onValidationChange) {
              onValidationChange(isValid);
            }
          } else {
            // Clear the input if value is empty
            setMobileNumber('');
            setIsValidNumber(false);
            if (onValidationChange) {
              onValidationChange(false);
            }
          }
        } else {
          // Even if digits haven't changed, make sure validation is correct
          // This handles the case where value is set but mobileNumber state wasn't updated
          const digits = mobileNumber.replace(/\D/g, '');
          const isValid = digits.length === 10;
          if (isValidNumber !== isValid) {
            setIsValidNumber(isValid);
            if (onValidationChange) {
              onValidationChange(isValid);
            }
          }
        }
      }
    }
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center border border-[var(--color-box-border)] rounded-lg bg-white hover:border-[var(--info-panel-view-bg)] focus-within:border-[var(--info-panel-view-bg)] focus-within:shadow-[0_0_0_4px_var(--color-shadow-select)] transition-all duration-150">
        {/* Country Code Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-1 ${padding} px-3 py-2 text-[var(--color-stroke-brand)] hover:text-[var(--color-neutral-primary)] transition-colors`}
          >
            <span className="text-sm font-medium">{selectedCountry.code}</span>
            <FiChevronDown 
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} 
            />
          </button>
          
          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-[4px_4px_8px_0px_var(--color-notif-shadow-soft),0px_0px_4px_0px_var(--color-notif-shadow-strong)] border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] border border-[var(--color-stroke-neutral)] max-h-60 focus:outline-none overflow-y-auto scrollbar-hide">
              {countryCodes.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountryChange(country)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)] transition-colors ${
                    selectedCountry.code === country.code ? "!bg-[var(--sidebar-active-bg)]" : ""
                  }`}
                >
                  <span className={`text-sm font-medium ${selectedCountry.code === country.code ? "!text-[var(--color-neutral-primary)]" : "text-[var(--color-neutral-secondary)]"}`}>
                    {country.code}
                  </span>
                  <span className={`text-sm font-medium ${selectedCountry.code === country.code ? "!text-[var(--color-neutral-primary)]" : "text-[var(--color-neutral-secondary)]"}`}>
                    {country.country}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Separator */}
        <div className="w-px h-6 bg-[var(--color-box-border)]"></div>
        
        {/* Mobile Number Input */}
        <div className="flex-1 flex items-center">
          <input
            type="tel"
            value={mobileNumber}
            onChange={handleMobileChange}
            onBlur={onBlur}
            placeholder={placeholder}
            maxLength={11}
            className="flex-1 px-3 py-2 text-[var(--color-neutral-secondary)] placeholder:text-[var(--color-neutral-light)] bg-transparent border-none outline-none"
          />
          
          {/* Validation Indicator - Hidden */}
        </div>
      </div>
    </div>
  );
}