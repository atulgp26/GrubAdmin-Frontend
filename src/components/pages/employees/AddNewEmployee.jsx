import React, { useState, useEffect } from "react";
import Modal from "../../ui/Modal";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import MultiSelectDropdown from "../../ui/MultiSelectDropdown";
import { useRef } from "react";
import { MdCalendarToday, MdDone } from "react-icons/md";
import Select from "@/components/ui/Select";
import MobileNumberInput from "@/components/ui/MobileNumberInput";
import { showSuccess, showError } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { roleService } from "@/api/services/roleService";
import { employeeService } from "@/api/services/employeeService";

const AddNewEmployee = ({ isOpen, onClose, onConfirm }) => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		phoneNumber: "",
		email: "",
		role: "",
		location: "",
		employeeId: "",
		joiningDate: "",
	});
	const dateRef = useRef(null);
	const [focusedField, setFocusedField] = useState("");
	const [selectedRole, setSelectedRole] = useState([]);
	const [roleOptions, setRoleOptions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [rolesLoading, setRolesLoading] = useState(true);
	const [validationErrors, setValidationErrors] = useState({
		firstName: "",
		lastName: "",
		phoneNumber: "",
		email: "",
		role: "",
		location: "",
		joiningDate: "",
	});
	const router = useRouter();

	// Fetch roles from API
	useEffect(() => {
		const fetchRoles = async () => {
			if (!isOpen) return;

			try {
				setRolesLoading(true);
				const response = await roleService.getRoles();

				if (
					response.success &&
					response.code === 200 &&
					response.data?.roles
				) {
					// Transform roles for Select component
					const transformedRoles = response.data.roles.map((role) => {
						// Calculate permissions count
						const permissionsCount = role.permissions_json
							? Object.values(role.permissions_json).reduce(
									(total, permissions) => {
										return (
											total +
											(Array.isArray(permissions)
												? permissions.length
												: 0)
										);
									},
									0,
								)
							: 0;

						return {
							value: role.id, // Use role ID for value
							label: role.name,
							description: `${permissionsCount} permissions`,
							roleData: role, // Keep full role data for reference
						};
					});

					setRoleOptions(transformedRoles);
				} else {
					console.error("Failed to fetch roles:", response);
					setRoleOptions([]);
				}
			} catch (error) {
				console.error("Error fetching roles:", error);
				setRoleOptions([]);
			} finally {
				setRolesLoading(false);
			}
		};

		fetchRoles();
	}, [isOpen]);

	// Validation functions
	const validateFirstName = (value) => {
		if (!value || value.trim().length === 0) {
			return "First name is required";
		}
		if (value.trim().length < 2) {
			return "First name must be at least 2 characters";
		}
		if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
			return "First name can only contain letters, spaces, hyphens, and apostrophes";
		}
		return "";
	};

	const validateLastName = (value) => {
		// Last name is optional, but if provided, validate it
		if (value && value.trim().length > 0) {
			if (value.trim().length < 2) {
				return "Last name must be at least 2 characters";
			}
			if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
				return "Last name can only contain letters, spaces, hyphens, and apostrophes";
			}
		}
		return "";
	};

	const validateEmail = (value) => {
		if (!value || value.trim().length === 0) {
			return "Email is required";
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(value.trim())) {
			return "Please enter a valid email address";
		}
		return "";
	};

	const validateRole = (value) => {
		if (!value || value.trim().length === 0) {
			return "Role is required";
		}
		return "";
	};

	const validateLocation = (value) => {
		// Location is optional, but if provided, validate it
		if (value && value.trim().length > 0) {
			if (value.trim().length < 2) {
				return "Location must be at least 2 characters";
			}
		}
		return "";
	};

	const validateJoiningDate = (value) => {
		// Joining date is optional, but if provided, validate it
		if (value && value.trim().length > 0) {
			const date = new Date(value);
			if (isNaN(date.getTime())) {
				return "Please enter a valid date";
			}
			const today = new Date();
			today.setHours(23, 59, 59, 999);
			if (date > today) {
				return "Joining date cannot be in the future";
			}
		}
		return "";
	};

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		// Validate the field in real-time
		let error = "";
		switch (field) {
			case "firstName":
				error = validateFirstName(value);
				break;
			case "lastName":
				error = validateLastName(value);
				break;
			case "email":
				error = validateEmail(value);
				break;
			case "role":
				error = validateRole(value);
				break;
			case "location":
				error = validateLocation(value);
				break;
			case "joiningDate":
				error = validateJoiningDate(value);
				break;
			default:
				break;
		}

		setValidationErrors((prev) => ({
			...prev,
			[field]: error,
		}));
	};

	const handleFocus = (field) => {
		setFocusedField(field);
	};

	const handleBlur = () => {
		setFocusedField("");
	};

	const handleRoleChange = (newSelectedRoles) => {
		setSelectedRole(newSelectedRoles);
		// Update form data with selected role (take first selection for single role)
		const roleValue =
			newSelectedRoles.length > 0 ? newSelectedRoles[0] : "";
		setFormData((prev) => ({
			...prev,
			role: roleValue,
		}));

		// Validate role
		const error = validateRole(roleValue);
		setValidationErrors((prev) => ({
			...prev,
			role: error,
		}));
	};

	const isFormValid = () => {
		const firstNameError = validateFirstName(formData.firstName);
		const emailError = validateEmail(formData.email);
		const roleError = validateRole(formData.role);
		const locationError = validateLocation(formData.location);
		const joiningDateError = validateJoiningDate(formData.joiningDate);

		// Phone is optional - no validation required, allow API call

		const isValid =
			!firstNameError &&
			!emailError &&
			!roleError &&
			!locationError &&
			!joiningDateError;

		return isValid;
	};

	const handleSubmit = async () => {
		if (!isFormValid()) return;

		try {
			setLoading(true);

			// Get selected role ID
			// formData.role should contain the role ID (value from Select component)
			console.log("formData.role:", formData.role);
			console.log("roleOptions:", roleOptions);

			// Check if formData.role is already a role ID or if we need to find it
			let roleId = formData.role;

			// If formData.role is not in roleOptions values, try to find by label
			const selectedRoleOption = roleOptions.find(
				(role) => role.value === formData.role,
			);
			if (selectedRoleOption) {
				roleId = selectedRoleOption.value;
			} else {
				// Fallback: try to find by label (in case it was stored as label)
				const roleByLabel = roleOptions.find(
					(role) => role.label === formData.role,
				);
				if (roleByLabel) {
					roleId = roleByLabel.value;
				} else {
					console.warn(
						"Role not found in roleOptions. formData.role:",
						formData.role,
					);
				}
			}

			console.log("Final roleId:", roleId);

			// Extract country code and mobile number from phoneNumber (robust)
			let countryCode = "+91";
			let mobileNumber = "";
			if (formData.phoneNumber && formData.phoneNumber.trim()) {
				const digitsOnly = formData.phoneNumber.replace(/\D/g, "");
				// Use last 10 digits as the phone number
				if (digitsOnly.length >= 10) {
					mobileNumber = digitsOnly.slice(-10);
					// Infer country code from the remaining prefix if available
					const prefix = digitsOnly.slice(0, digitsOnly.length - 10);
					if (prefix && prefix.length > 0) {
						countryCode = `+${prefix}`;
					}
				} else {
					mobileNumber = digitsOnly;
				}
			}

			// Format joining date if provided
			let joiningDateISO = "";
			if (formData.joiningDate) {
				try {
					const dateObj = new Date(formData.joiningDate);
					if (!isNaN(dateObj.getTime())) {
						joiningDateISO = dateObj.toISOString();
					}
				} catch (error) {
					console.error("Error parsing joining date:", error);
				}
			}

			// Validate all required fields before submission
			const firstNameError = validateFirstName(formData.firstName);
			const emailError = validateEmail(formData.email);
			const roleError = validateRole(formData.role);
			// Strict phone validation when provided
			let phoneError = "";
			if (formData.phoneNumber && formData.phoneNumber.trim()) {
				if (mobileNumber.length !== 10) {
					phoneError = "Mobile number must be 10 digits";
				}
			}

			// Phone is optional - no validation required

			if (firstNameError || emailError || roleError || phoneError) {
				// Set all validation errors
				setValidationErrors({
					firstName: firstNameError,
					email: emailError,
					role: roleError,
					lastName: validateLastName(formData.lastName),
					location: validateLocation(formData.location),
					joiningDate: validateJoiningDate(formData.joiningDate),
				});
				showError(
					phoneError ||
						"Please fix the validation errors before submitting",
				);
				setLoading(false);
				return;
			}

			// Prepare API payload
			const firstName = formData.firstName.trim();
			const lastName = formData.lastName.trim();

			// Build payload - only include optional fields if they have values
			const payload = {
				email: formData.email.trim(),
				first_name: firstName,
			};

			// Add optional fields only if they have values
			if (lastName.length >= 2) {
				payload.last_name = lastName;
			}

			if (formData.location && formData.location.trim()) {
				payload.location = formData.location.trim();
			}

			if (joiningDateISO) {
				payload.joining_date = joiningDateISO;
			}

			if (roleId) {
				// API expects key 'role' (not 'role_id') for assigning role during create
				payload.role_id = roleId;
				console.log("Role ID added to payload (role):", roleId);
			} else {
				console.warn("No role ID found! formData.role:", formData.role);
			}

			// Add phone number only when exactly 10 digits (API requirement)
			if (mobileNumber && mobileNumber.length === 10) {
				payload.mobile_number = mobileNumber;
				payload.country_code = countryCode;
			}

			// Add employee_id - omit if not provided
			// Remove # prefix if present
			if (formData.employeeId && formData.employeeId.trim()) {
				payload.employee_id = formData.employeeId
					.trim()
					.replace(/^#\s*/, "");
			}

			console.log("Creating employee with payload:", payload);
			console.log("Payload role_id:", payload.role_id);

			const response = await employeeService.createAdmin(payload);

			console.log("Create employee response:", response);

			if (response.success && response.code === 200) {
				const fullName =
					`${formData.firstName} ${formData.lastName}`.trim();
				showSuccess(
					"Success!",
					`${fullName || "Employee"} added successfully. Their role can be managed anytime from their profile.`,
				);
				handleReset();
				onClose();
				if (onConfirm) {
					onConfirm(formData);
				}
				router.push("/employees/list");
			} else {
				// Handle API error response
				let errorMsg =
					response.error ||
					response.message ||
					"Failed to create employee. Please try again.";
				const lower = (errorMsg || "").toLowerCase();
				if (lower.includes("unique") || lower.includes("collision")) {
					errorMsg =
						"This email, mobile number, or Employee ID already exists. Please use unique values.";
				}
				showError(errorMsg);
				console.error("API Error:", response);
			}
		} catch (error) {
			console.error("Error creating employee:", error);
			let errorMessage = "Failed to create employee. Please try again.";

			// Check for different error formats
			if (error?.response?.data) {
				// Check for error in response.data
				if (error.response.data.error) {
					errorMessage = error.response.data.error;
				} else if (error.response.data.message) {
					errorMessage = error.response.data.message;
				}
			} else if (error?.response?.data?.error) {
				errorMessage = error.response.data.error;
			} else if (error?.response?.data?.message) {
				errorMessage = error.response.data.message;
			} else if (error?.message) {
				errorMessage = error.message;
			}

			// Display user-friendly error message
			if (
				errorMessage.toLowerCase().includes("unique") ||
				errorMessage.toLowerCase().includes("collision")
			) {
				errorMessage =
					"This email, mobile number, or Employee ID already exists. Please use unique values.";
			}

			showError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleReset = () => {
		setFormData({
			firstName: "",
			lastName: "",
			phoneNumber: "",
			email: "",
			role: "",
			location: "",
			employeeId: "",
			joiningDate: "",
		});
		setSelectedRole([]);
		setFocusedField("");
		setValidationErrors({
			firstName: "",
			lastName: "",
			email: "",
			role: "",
			location: "",
			joiningDate: "",
		});
	};

	const handleCancel = () => {
		handleReset();
		onClose();
	};

	if (!isOpen) return null;

	return (
		<Modal
			open={isOpen}
			onClose={handleCancel}
			width="max-w-2xl"
			customClass=" overflow-auto"
			closeOnOutsideClick={true}
		>
			<div className="space-y-6">
				{/* Header */}
				<div className="space-y-2 mt-2">
					<h1 className="text-[var(--color-neutral-primary)] font-semibold text-2xl">
						Add new employee
					</h1>
					<p className="text-[var(--color-stroke-brand)] text-base">
						Create an account for your employee and assign them
						their role.
					</p>
				</div>

				{/* Basic Details */}
				<div className="space-y-4">
					<h3 className="text-[var(--color-neutral-secondary)] text-base">
						Basic details
					</h3>
					<div className="grid grid-cols-2 gap-4">
						<div className="relative">
							<Input
								type="text"
								placeholder="First name"
								value={formData.firstName}
								onChange={(e) =>
									handleInputChange(
										"firstName",
										e.target.value,
									)
								}
								onFocus={() => handleFocus("firstName")}
								onBlur={handleBlur}
								isFocused={focusedField === "firstName"}
							/>
							{validationErrors.firstName && (
								<p className="absolute top-full left-0 mt-1 text-xs text-red-500">
									{validationErrors.firstName}
								</p>
							)}
						</div>
						<div className="relative">
							<Input
								type="text"
								placeholder="Last name"
								value={formData.lastName}
								onChange={(e) =>
									handleInputChange(
										"lastName",
										e.target.value,
									)
								}
								onFocus={() => handleFocus("lastName")}
								onBlur={handleBlur}
								isFocused={focusedField === "lastName"}
							/>
							{validationErrors.lastName && (
								<p className="absolute top-full left-0 mt-1 text-xs text-red-500">
									{validationErrors.lastName}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Contact Details */}
				<div className="space-y-4">
					<h3 className="text-[var(--color-neutral-secondary)] text-base">
						Contact details
					</h3>
					<div className="grid grid-cols-2 gap-4">
						<div className="relative">
							<MobileNumberInput
								value={formData.phoneNumber}
								onChange={(phoneValue) => {
									setFormData((prev) => ({
										...prev,
										phoneNumber: phoneValue,
									}));
									const digits = (phoneValue || "").replace(
										/\D/g,
										"",
									);
									setValidationErrors((prev) => ({
										...prev,
										phoneNumber:
											digits.length > 0 &&
											digits.length < 10
												? "Mobile number must be 10 digits"
												: "",
									}));
								}}
								placeholder="Enter mobile number"
								className="w-full"
								onValidationChange={(isValid) => {
									const digits = (
										formData.phoneNumber || ""
									).replace(/\D/g, "");
									setValidationErrors((prev) => ({
										...prev,
										phoneNumber:
											digits.length > 0 && !isValid
												? "Mobile number must be 10 digits"
												: "",
									}));
								}}
							/>
							{validationErrors.phoneNumber && (
								<p className="absolute top-full left-0 mt-1 text-xs text-red-500">
									{validationErrors.phoneNumber}
								</p>
							)}
						</div>
						<div className="relative">
							<Input
								type="email"
								placeholder="Email address"
								value={formData.email}
								onChange={(e) =>
									handleInputChange("email", e.target.value)
								}
								onFocus={() => handleFocus("email")}
								onBlur={handleBlur}
								isFocused={focusedField === "email"}
							/>
							{validationErrors.email && (
								<p className="absolute top-full left-0 mt-1 text-xs text-red-500">
									{validationErrors.email}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Role and Location */}
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<h3 className="text-[var(--color-neutral-secondary)] text-base">
							Role permissions
						</h3>
						<div className="relative">
							<Select
								options={roleOptions}
								value={formData.role}
								onChange={(newValue) =>
									handleInputChange("role", newValue)
								}
								placeholder={
									rolesLoading
										? "Loading roles..."
										: "Select role"
								}
								style={{ height: "38px", width: "250px" }}
								showSearch={true}
								fontSize="!text-base"
								padding="!py-2"
								className=""
							/>
							{validationErrors.role && (
								<p className="absolute top-full left-0 mt-1 text-xs text-red-500">
									{validationErrors.role}
								</p>
							)}
						</div>
					</div>
					<div className="space-y-2">
						<h3 className="text-[var(--color-neutral-secondary)] text-base font-medium">
							Employee ID{" "}
							<span className="text-sm text-[var(--color-neutral-secondary)]">
								(optional)
							</span>
						</h3>
						<div className="relative">
							<Input
								type="text"
								placeholder="Employee ID"
								value={formData.employeeId}
								onChange={(e) =>
									handleInputChange(
										"employeeId",
										e.target.value,
									)
								}
								onFocus={() => handleFocus("employeeId")}
								onBlur={handleBlur}
								isFocused={focusedField === "employeeId"}
								className="pl-8"
							/>
							<span
								className={`${formData.employeeId ? "text-[var(--color-neutral-secondary)]" : ""} absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-light)] text-sm pointer-events-none z-10`}
							>
								#
							</span>
						</div>
					</div>
				</div>

				{/* Employee ID and Joining Date */}
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<h3 className="text-[var(--color-neutral-secondary)] text-base">
							Assigned location{" "}
							<span className="text-sm text-[var(--color-neutral-secondary)]">
								(optional)
							</span>
						</h3>
						<div className="relative">
							<Input
								type="text"
								placeholder="Office location"
								value={formData.location}
								onChange={(e) =>
									handleInputChange(
										"location",
										e.target.value,
									)
								}
								onFocus={() => handleFocus("location")}
								onBlur={handleBlur}
								isFocused={focusedField === "location"}
							/>
							{validationErrors.location && (
								<p className="absolute top-full left-0 mt-1 text-xs text-red-500">
									{validationErrors.location}
								</p>
							)}
						</div>
					</div>
					<div className="space-y-2">
						<h3 className="text-[var(--color-neutral-secondary)] text-base font-medium">
							Joining date{" "}
							<span className="text-sm text-[var(--color-neutral-secondary)]">
								(optional)
							</span>
						</h3>
						<div className="relative">
							<Input
								ref={dateRef}
								type="date"
								placeholder="Select date"
								value={formData.joiningDate}
								onChange={(e) =>
									handleInputChange(
										"joiningDate",
										e.target.value,
									)
								}
								onFocus={() => handleFocus("joiningDate")}
								onBlur={handleBlur}
								isFocused={focusedField === "joiningDate"}
								className="pr-12 custom-date-input"
								max={new Date().toISOString().split("T")[0]}
							/>

							<MdCalendarToday
								onClick={() => dateRef.current?.showPicker()}
								className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--info-panel-view-bg)] cursor-pointer"
							/>

							{validationErrors.joiningDate && (
								<p className="absolute top-full left-0 mt-1 text-xs text-red-500">
									{validationErrors.joiningDate}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-4 pt-6 border-t border-[var(--color-box-border)]">
					<Button
						variant="grayOutline"
						size="mdLg"
						onClick={handleCancel}
						className="flex-1"
					>
						CANCEL
					</Button>
					<Button
						variant="disabledPrimary"
						size="mdLg"
						onClick={handleSubmit}
						disabled={!isFormValid() || loading}
						className="flex-1 disabled:!bg-[var(--color-stroke-neutral)] disabled:!border-[var(--color-box-border)]"
					>
						<span className="flex items-center justify-center gap-2">
							{isFormValid() && !loading && (
								<MdDone stroke={1} className="w-6 h-6" />
							)}
							{loading ? (
								<LoadingDetails
									variant="inline"
									text="CREATING..."
								/>
							) : (
								"CONFIRM"
							)}
						</span>
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default AddNewEmployee;
