"use client";
import { useState, useEffect } from "react";

const COUNTRY_CODE = "+91";

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
	const [mobileNumber, setMobileNumber] = useState(value);

	const validateInitialValue = (val) => {
		if (!val) return false;
		const digits = val.replace(/\D/g, "");
		return digits.length === 10;
	};

	const [isValidNumber, setIsValidNumber] = useState(
		isValid || validateInitialValue(value),
	);

	const formatMobileNumber = (number) => {
		const digits = number.replace(/\D/g, "").slice(0, 10);
		if (digits.length > 5) {
			return digits.slice(0, 5) + " " + digits.slice(5);
		}
		return digits;
	};

	const validateMobileNumber = (number) => {
		const digits = number.replace(/\D/g, "");
		return digits.length === 10;
	};

	const handleMobileChange = (e) => {
		const formatted = formatMobileNumber(e.target.value);
		setMobileNumber(formatted);

		const isValid = validateMobileNumber(formatted);
		setIsValidNumber(isValid);

		if (onChange) {
			onChange(COUNTRY_CODE + formatted.replace(/\D/g, ""));
		}

		if (onValidationChange) {
			onValidationChange(isValid);
		}
	};

	useEffect(() => {
		if (value !== undefined) {
			const prefix = COUNTRY_CODE;
			let numberToSet = "";

			if (value.startsWith(prefix)) {
				numberToSet = value.substring(prefix.length).replace(/\D/g, "");
			} else if (value) {
				numberToSet = value.replace(/\D/g, "").replace(/^91/, "");
			}

			const currentDigits = (mobileNumber || "").replace(/\D/g, "");
			const newDigits = (numberToSet || "").replace(/\D/g, "");

			if (currentDigits !== newDigits) {
				if (numberToSet && numberToSet.length > 0) {
					setMobileNumber(formatMobileNumber(numberToSet));
					const isValid = validateMobileNumber(numberToSet);
					setIsValidNumber(isValid);
					if (onValidationChange) onValidationChange(isValid);
				} else if (value === "") {
					setMobileNumber("");
					setIsValidNumber(false);
					if (onValidationChange) onValidationChange(false);
				}
			}
		}
	}, [value]);

	return (
		<div className={`relative ${className}`}>
			<div className="flex items-center border border-[var(--color-box-border)] rounded-lg bg-white hover:border-[var(--info-panel-view-bg)] focus-within:border-[var(--info-panel-view-bg)] focus-within:shadow-[0_0_0_4px_var(--color-shadow-select)] transition-all duration-150">
				<span className={`flex items-center ${padding} px-3 py-2 text-[var(--color-stroke-brand)] text-sm font-medium select-none`}>
					{COUNTRY_CODE}
				</span>
				<div className="w-px h-6 bg-[var(--color-box-border)]"></div>
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
