import React from "react";

const Input = React.forwardRef(
	(
		{
			type,
			placeholder,
			disabledClass,
			margin,
			width,
			border,
			padding,
			className,
			value,
			onChange,
			loginprops,
			isFocused,
			onFocus,
			onBlur,
			readOnly,
			disabled,
			...props
		},
		ref,
	) => {
		const isTextLike = !["checkbox", "radio"].includes(type);

		// Use isFocused from parent for border/shadow
		const parentBorder = isFocused
			? "border border-[var(--info-panel-view-bg)]  bg-white shadow-[0_0_0_4px_var(--color-shadow-select)]"
			: `border border-[var(--color-box-border)] ${border} bg-white `;

		const baseClasses = isTextLike
			? `w-full px-3 py-2 ${padding} ${disabledClass} rounded-lg border-none outline-none hover:bg-[var(--color-neutral-secondary-bg)] focus:ring-0`
			: "";
		const loginStyles =
			loginprops && isTextLike
				? "pl-10 pr-10 !text-lg text-[var(--color-neutral-secondary)]"
				: "";

		return (
			<div
				className={`relative rounded-lg ${width} ${parentBorder} flex items-center transition-colors duration-150`}
			>
				<input
					ref={ref}
					type={type}
					placeholder={placeholder}
					className={`${baseClasses} ${loginStyles} ${className} text-[var(--color-neutral-secondary)] placeholder:text-[var(--color-neutral-light)]`}
					value={value}
					onChange={onChange}
					onFocus={onFocus}
					onBlur={onBlur}
					disabled={disabled}
					readOnly={readOnly}
					{...props}
				/>
			</div>
		);
	},
);

Input.displayName = "Input";

export default Input;
