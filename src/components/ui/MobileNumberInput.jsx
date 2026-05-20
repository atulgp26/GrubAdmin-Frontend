"use client";
import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

const countryCodes = [
	{ code: "+1", country: "United States" },
	{ code: "+1", country: "Canada" },
	{ code: "+44", country: "United Kingdom" },
	{ code: "+61", country: "Australia" },
	{ code: "+64", country: "New Zealand" },
	{ code: "+91", country: "India" },
	{ code: "+86", country: "China" },
	{ code: "+81", country: "Japan" },
	{ code: "+82", country: "South Korea" },
	{ code: "+65", country: "Singapore" },
	{ code: "+60", country: "Malaysia" },
	{ code: "+66", country: "Thailand" },
	{ code: "+63", country: "Philippines" },
	{ code: "+62", country: "Indonesia" },
	{ code: "+84", country: "Vietnam" },
	{ code: "+33", country: "France" },
	{ code: "+49", country: "Germany" },
	{ code: "+39", country: "Italy" },
	{ code: "+34", country: "Spain" },
	{ code: "+31", country: "Netherlands" },
	{ code: "+32", country: "Belgium" },
	{ code: "+41", country: "Switzerland" },
	{ code: "+43", country: "Austria" },
	{ code: "+45", country: "Denmark" },
	{ code: "+46", country: "Sweden" },
	{ code: "+47", country: "Norway" },
	{ code: "+48", country: "Poland" },
	{ code: "+55", country: "Brazil" },
	{ code: "+56", country: "Chile" },
	{ code: "+57", country: "Colombia" },
	{ code: "+54", country: "Argentina" },
	{ code: "+51", country: "Peru" },
	{ code: "+52", country: "Mexico" },
	{ code: "+234", country: "Nigeria" },
	{ code: "+27", country: "South Africa" },
	{ code: "+20", country: "Egypt" },
	{ code: "+966", country: "Saudi Arabia" },
	{ code: "+971", country: "UAE" },
	{ code: "+972", country: "Israel" },
	{ code: "+90", country: "Turkey" },
	{ code: "+7", country: "Russia" },
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
	const [selectedCountry, setSelectedCountry] = useState(countryCodes[5]); // Default to India
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [mobileNumber, setMobileNumber] = useState(value);
	const [searchTerm, setSearchTerm] = useState("");

	// Validate initial value
	const validateInitialValue = (val) => {
		if (!val) return false;
		const digits = val.replace(/\D/g, "");
		return digits.length === 10;
	};

	const [isValidNumber, setIsValidNumber] = useState(
		isValid || validateInitialValue(value),
	);
	const dropdownRef = useRef(null);
	const searchInputRef = useRef(null);

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
		setSearchTerm("");

		if (onChange) {
			onChange(country.code + mobileNumber.replace(/\D/g, ""));
		}
	};

	// Filter countries by search term
	const filteredCountries = countryCodes.filter(
		(country) =>
			country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
			country.code.includes(searchTerm),
	);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target)
			) {
				setIsDropdownOpen(false);
				setSearchTerm("");
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Focus search input when dropdown opens
	useEffect(() => {
		if (isDropdownOpen && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [isDropdownOpen]);

	// Update mobile number when value prop changes
	useEffect(() => {
		if (value !== undefined) {
			let countryCode = null;
			let numberToSet = "";

			// Try to find matching country code at the start
			for (const country of countryCodes) {
				if (value.startsWith(country.code)) {
					countryCode = country;
					const remaining = value
						.substring(country.code.length)
						.trim();
					numberToSet = remaining.replace(/\D/g, "");
					break;
				}
			}

			// If no country code found, check if it's just digits or has other format
			if (!countryCode && value) {
				const digitsOnly = value.replace(/\D/g, "");
				if (digitsOnly.length > 0) {
					if (value.startsWith("+")) {
						if (
							digitsOnly.startsWith("91") &&
							digitsOnly.length > 2
						) {
							const indiaCode = countryCodes.find(
								(c) =>
									c.code === "+91" && c.country === "India",
							);
							if (indiaCode) {
								countryCode = indiaCode;
								numberToSet = digitsOnly.substring(2);
							}
						} else {
							numberToSet = digitsOnly;
						}
					} else {
						numberToSet = digitsOnly;
					}
				}
			}

			if (countryCode && selectedCountry.code !== countryCode.code) {
				setSelectedCountry(countryCode);
			}

			if (numberToSet || value === "") {
				const currentDigits = mobileNumber.replace(/\D/g, "");
				const newDigits = numberToSet.replace(/\D/g, "");

				if (currentDigits !== newDigits || value === "") {
					if (numberToSet && numberToSet.length > 0) {
						const formatted = formatMobileNumber(numberToSet);
						setMobileNumber(formatted);
						const isValid = validateMobileNumber(numberToSet);
						setIsValidNumber(isValid);
						if (onValidationChange) {
							onValidationChange(isValid);
						}
					} else {
						setMobileNumber("");
						setIsValidNumber(false);
						if (onValidationChange) {
							onValidationChange(false);
						}
					}
				} else {
					const digits = mobileNumber.replace(/\D/g, "");
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
						<span className="text-sm font-medium">
							{selectedCountry.code}
						</span>
						<FiChevronDown
							className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
						/>
					</button>

					{/* Dropdown */}
					{isDropdownOpen && (
						<div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-[4px_4px_8px_0px_var(--color-notif-shadow-soft),0px_0px_4px_0px_var(--color-notif-shadow-strong)] border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)]">
							{/* Search Input */}
							<div className="p-2 border-b border-[var(--color-stroke-neutral)]">
								<input
									ref={searchInputRef}
									type="text"
									placeholder="Search country..."
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
									className="w-full px-2 py-1 text-black text-sm border border-[var(--color-box-border)] rounded outline-none focus:border-[var(--info-panel-view-bg)] bg-white"
								/>
							</div>

							{/* Country List */}
							<div className="max-h-60 overflow-y-auto">
								{filteredCountries.length > 0 ? (
									filteredCountries.map((country, idx) => (
										<button
											key={`${country.code}-${idx}`}
											type="button"
											onClick={() =>
												handleCountryChange(country)
											}
											className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)] transition-colors ${
												selectedCountry.code ===
													country.code &&
												selectedCountry.country ===
													country.country
													? "!bg-[var(--sidebar-active-bg)]"
													: ""
											}`}
										>
											<span
												className={`text-sm font-medium min-w-12 ${selectedCountry.code === country.code && selectedCountry.country === country.country ? "!text-[var(--color-neutral-primary)]" : "text-[var(--color-neutral-secondary)]"}`}
											>
												{country.code}
											</span>
											<span
												className={`text-sm font-medium ${selectedCountry.code === country.code && selectedCountry.country === country.country ? "!text-[var(--color-neutral-primary)]" : "text-[var(--color-neutral-secondary)]"}`}
											>
												{country.country}
											</span>
										</button>
									))
								) : (
									<div className="px-3 py-2 text-sm text-[var(--color-neutral-light)]">
										No countries found
									</div>
								)}
							</div>
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
				</div>
			</div>
		</div>
	);
}
