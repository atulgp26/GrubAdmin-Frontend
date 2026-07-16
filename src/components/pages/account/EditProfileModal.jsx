"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import OtpVerifyModal from "@/components/pages/login/OtpVerifyModal";
import PasswordChangeModal from "@/components/pages/account/PasswordChangeModal";
import { PencilLine } from "lucide-react";
import { MdCalendarToday, MdDone } from "react-icons/md";
import Input from "@/components/ui/Input";
import MobileNumberInput from "@/components/ui/MobileNumberInput";
import { accountService } from "@/api/services/accountService";
import { showSuccess, showError } from "@/components/ui/toast";
import { clearAuthCookie } from "@/utils/cookies";
import { useAuth } from "@/context/AuthContext";

export default function EditProfileModal({
	open,
	onClose,
	onSave,
	fields = defaultFields,
	onFieldChange,
}) {
	const router = useRouter();
	const { updateUser, loadSession } = useAuth();
	const [editedFields, setEditedFields] = useState(new Set());
	const [currentFields, setCurrentFields] = useState(fields);
	const [editingField, setEditingField] = useState(null);
	const [tempValue, setTempValue] = useState("");
	const [pendingProfileData, setPendingProfileData] = useState(null);

	// OTP verification states
	const [showOtpModal, setShowOtpModal] = useState(false);
	const [isPassword, setIsPassword] = useState(false);
	const [otpEmail, setOtpEmail] = useState("");
	const [otp, setOtp] = useState(["", "", "", ""]);
	const [timer, setTimer] = useState(60);
	const [otpError, setOtpError] = useState(false);
	const otpRefs = [useRef(), useRef(), useRef(), useRef()];
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const dateRef = useRef(null);
	// Password change states
	const [showPasswordModal, setShowPasswordModal] = useState(false);

	// Mobile number validation state
	const [isMobileValid, setIsMobileValid] = useState(false);

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

	const [focusedField, setFocusedField] = useState("");
	const [selectedRole, setSelectedRole] = useState([]);
	const timerIntervalRef = useRef(null);

	// Populate formData when fields prop changes or modal opens
	useEffect(() => {
		if (open && fields) {
			// Split name into firstName and lastName
			const nameParts = (fields.name || "")
				.trim()
				.split(" ")
				.filter((part) => part.length > 0);
			const firstName = nameParts[0] || "";
			const lastName = nameParts.slice(1).join(" ") || "";

			// Format joining date if available
			let formattedJoiningDate = "";
			if (fields.joiningDate) {
				try {
					// If it's an ISO date string, format it for input (YYYY-MM-DD)
					const dateObj = new Date(fields.joiningDate);
					if (!isNaN(dateObj.getTime())) {
						formattedJoiningDate = dateObj
							.toISOString()
							.split("T")[0];
					} else {
						// Try parsing if it's in another format
						formattedJoiningDate = fields.joiningDate;
					}
				} catch (error) {
					console.error("Error parsing joining date:", error);
					formattedJoiningDate = "";
				}
			}

			// Format contact for mobile input (ensure it has +91 prefix if it's a number)
			let formattedContact = fields.contact || "";
			if (formattedContact && !formattedContact.startsWith("+")) {
				// If contact is just digits, add +91 prefix
				const digits = formattedContact.replace(/\D/g, "");
				if (digits.length === 10) {
					formattedContact = `+91 ${digits}`;
				} else if (digits.length > 10) {
					formattedContact = `+${digits}`;
				}
			}

			// Update formData with values from fields
			setFormData({
				firstName: firstName,
				lastName: lastName,
				phoneNumber: "", // Not used, but kept for consistency
				email: fields.email || "",
				role: "",
				location: fields.facility || "",
				employeeId: "",
				joiningDate: formattedJoiningDate,
			});

			// Update currentFields with properly formatted data
			setCurrentFields({
				name: fields.name || "",
				email: fields.email || "",
				contact: formattedContact,
				password: fields.password || "**********",
				facility: fields.facility || "",
			});

			// Reset edited fields when modal opens
			setEditedFields(new Set());
			setEditingField(null);
			setTempValue("");
		} else if (!open) {
			// Reset states when modal closes
			setPendingProfileData(null);
			setOtpError(false);
			setOtp(["", "", "", ""]);
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current);
				timerIntervalRef.current = null;
			}
			setTimer(60);
		}
	}, [open, fields]);

	// Role options data - same as list page
	const roleOptions = [
		{ id: "manager", label: "Manager", description: "10 permissions" },
		{
			id: "relationmanager",
			label: "Relation manager",
			description: "10 permissions",
		},
		{ id: "support", label: "Support", description: "10 permissions" },
		{
			id: "technician",
			label: "Technician",
			description: "10 permissions",
		},
		{ id: "trainee", label: "Trainee", description: "10 permissions" },
	];

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleFocus = (field) => {
		setFocusedField(field);
	};

	const handleBlur = () => {
		setFocusedField("");
	};

	const isFormValid = () => {
		return (
			formData.firstName.trim() &&
			formData.lastName.trim() &&
			formData.phoneNumber.trim() &&
			formData.email.trim() &&
			formData.role.trim()
		);
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
	};

	const handleFieldEdit = (fieldName) => {
		setEditingField(fieldName);
		setTempValue(currentFields[fieldName]);
	};

	const handleFieldSave = (fieldName) => {
		if (tempValue !== currentFields[fieldName]) {
			setCurrentFields((prev) => ({ ...prev, [fieldName]: tempValue }));
			setEditedFields((prev) => new Set([...prev, fieldName]));
		}
		setEditingField(null);
		setTempValue("");
	};

	// Prepare profile data for API call
	const prepareProfileData = (fields) => {
		const profileData = {};

		// Split name into first_name and last_name (API expects them separately)
		if (fields.name && fields.name.trim()) {
			const nameParts = fields.name
				.trim()
				.split(" ")
				.filter((part) => part.length > 0);
			if (nameParts.length > 0) {
				profileData.first_name = nameParts[0];
			}
			if (nameParts.length > 1) {
				profileData.last_name = nameParts.slice(1).join(" ");
			} else {
				profileData.last_name = null; // API might expect null for empty last_name
			}
		}

		if (fields.email && fields.email.trim()) {
			profileData.email = fields.email.trim();
		}
		if (fields.contact) {
			// Extract country code and mobile number from contact
			const contactStr = fields.contact.trim();
			let countryCode = "+91"; // Default
			let mobileNumber = "";

			// Check if it starts with country code
			if (contactStr.startsWith("+")) {
				const parts = contactStr.split(" ");
				if (parts.length > 1) {
					countryCode = parts[0];
					mobileNumber = parts.slice(1).join("").replace(/\D/g, "");
				} else {
					// Extract country code from the string
					const digits = contactStr.replace(/\D/g, "");
					if (digits.length > 10) {
						countryCode = `+${digits.slice(0, -10)}`;
						mobileNumber = digits.slice(-10);
					} else {
						mobileNumber = digits;
					}
				}
			} else {
				// No country code prefix, extract just the number
				const digits = contactStr.replace(/\D/g, "");
				if (digits.length > 10) {
					countryCode = `+${digits.slice(0, -10)}`;
					mobileNumber = digits.slice(-10);
				} else {
					mobileNumber = digits;
				}
			}

			if (mobileNumber.length > 0) {
				profileData.mobile_number = mobileNumber;
				profileData.country_code = countryCode;
			}
		}
		// Check both facility (from fields) and location (from formData)
		if (fields.facility && fields.facility.trim()) {
			profileData.assigned_location = fields.facility.trim();
		} else if (formData && formData.location && formData.location.trim()) {
			profileData.assigned_location = formData.location.trim();
		}
		// Include joining date from formData if available
		if (formData && formData.joiningDate) {
			try {
				const dateObj = new Date(formData.joiningDate);
				if (!isNaN(dateObj.getTime())) {
					profileData.joining_date = dateObj
						.toISOString()
						.split("T")[0];
				}
			} catch (error) {
				console.error("Error parsing joining date:", error);
			}
		}

		return profileData;
	};

	const handleSaveChanges = async () => {
		// Finalize any active inline edit
		if (editingField && tempValue !== currentFields[editingField]) {
			setCurrentFields((prev) => ({
				...prev,
				[editingField]: tempValue,
			}));
			setEditedFields((prev) => new Set([...prev, editingField]));
			setEditingField(null);
			setTempValue("");
		}

		// Build normal fields payload (name, location, joiningDate)
		const normalPayload = {};
		const nameParts = `${formData.firstName} ${formData.lastName}`
			.trim()
			.split(" ")
			.filter(Boolean);
		if (nameParts[0]) normalPayload.first_name = nameParts[0];
		if (nameParts.slice(1).join(" "))
			normalPayload.last_name = nameParts.slice(1).join(" ");
		if (formData.location)
			normalPayload.assigned_location = formData.location.trim();
		if (formData.joiningDate) {
			const d = new Date(formData.joiningDate);
			if (!isNaN(d))
				normalPayload.joining_date = d.toISOString().split("T")[0];
		}

		//Detect which sensitive field changed (only ONE at a time)
		const hasPassword = editedFields.has("password");
		const hasEmail = editedFields.has("email");
		const hasContact = editedFields.has("contact");
		const hasSensitive = hasPassword || hasEmail || hasContact;

		// Step 1: Save normal fields first
		if (Object.keys(normalPayload).length > 0) {
			try {
				const res = await accountService.updateProfile(normalPayload);
				if (!res.success) {
					showError(res.message || "Failed to save basic details.");
					return;
				}
			} catch (err) {
				showError(
					err.response?.data?.message ||
						"Failed to save basic details.",
				);
				return;
			}
		}
		if (!hasSensitive) {
			await loadSession(); 
			showSuccess("Profile updated successfully!")
			onClose();

			if (onSave) onSave(normalPayload);
			return;
		}

		// Password → open password modal
		if (hasPassword) {
			setShowPasswordModal(true);
			return;
		}

		// Email or Contact → OTP flow (send ONLY the sensitive field)
		if (hasEmail || hasContact) {
			const sensitivePayload = {};

			if (hasEmail) {
				sensitivePayload.email = currentFields.email;
			}

			if (hasContact) {
				const contactStr = currentFields.contact.trim();
				const digits = contactStr.replace(/\D/g, "");
				sensitivePayload.country_code = contactStr.startsWith("+")
					? `+${digits.slice(0, digits.length - 10)}`
					: "+91";
				sensitivePayload.mobile_number = digits.slice(-10);
			}

			setTitle("Hold on!");
			setDescription(
				hasEmail
					? `To confirm changing your email address, enter the OTP sent to your updated ID ${currentFields.email}`
					: `To confirm changing your contact number, enter the OTP sent to your updated number ${currentFields.contact}`,
			);
			setOtpEmail(hasEmail ? currentFields.email : currentFields.contact);

			try {
				const response =
					await accountService.updateProfile(sensitivePayload);
				if (response.success && response.code === 200) {
					setPendingProfileData(sensitivePayload);
					setShowOtpModal(true);
					startOtpTimer();
				} else {
					showError(
						response.message ||
							response.error ||
							"Failed to send OTP. Please try again.",
					);
				}
			} catch (error) {
				showError(
					error.response?.data?.message ||
						"Failed to send OTP. Please try again.",
				);
			}
		}
	};

	const startOtpTimer = () => {
		// Clear any existing timer
		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current);
		}

		setTimer(60);
		timerIntervalRef.current = setInterval(() => {
			setTimer((prev) => {
				if (prev <= 1) {
					if (timerIntervalRef.current) {
						clearInterval(timerIntervalRef.current);
						timerIntervalRef.current = null;
					}
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current);
			}
		};
	}, []);

	const handleOtpVerify = async () => {
		const enteredOtp = otp.join("");

		if (enteredOtp.length !== 4) {
			showError("Please enter a valid 4-digit OTP");
			setOtpError(true);
			return;
		}

		try {
			// Step 1: Confirm OTP
			const otpResponse = await accountService.confirmOTP(enteredOtp);

			if (!otpResponse.success || otpResponse.code !== 200) {
				showError("Invalid OTP. Please try again.");
				setOtpError(true);
				setOtp(["", "", "", ""]);
				if (otpRefs.length > 0 && otpRefs[0].current) {
					otpRefs[0].current.focus();
				}
				return;
			}

			// Step 2: Update profile with PATCH API
			if (
				pendingProfileData &&
				Object.keys(pendingProfileData).length > 0
			) {
				// Log the data being sent for debugging
				console.log("Sending profile data:", pendingProfileData);

				const patchResponse =
					await accountService.patchProfile(pendingProfileData);

				if (patchResponse.success && patchResponse.code === 200) {
					// Clear timer
					if (timerIntervalRef.current) {
						clearInterval(timerIntervalRef.current);
						timerIntervalRef.current = null;
					}

					// Success - show toast, logout and redirect
					showSuccess("Profile updated successfully!");
					setShowOtpModal(false);

					// Clear auth cookie
					clearAuthCookie();

					// Clear auth-related localStorage items
					localStorage.removeItem("hasShownPasswordModal");

					// Hard redirect to login for complete logout (clears all React state)
					window.location.href = "/login";
				} else {
					const errorMsg =
						patchResponse.message ||
						patchResponse.error ||
						"Failed to update profile. Please try again.";
					showError(errorMsg);
					setOtpError(true);
				}
			} else {
				// No profile data to update, just confirm OTP was successful
				showSuccess("Profile verification successful!");
				setShowOtpModal(false);
				onClose();
			}
		} catch (error) {
			console.error("OTP verification error:", error);
			console.error("Error response:", error.response?.data);

			let errorMessage = "Invalid OTP. Please try again.";

			if (error.response?.status === 400) {
				errorMessage =
					error.response?.data?.message ||
					error.response?.data?.error ||
					"Invalid data. Please check your inputs.";
			} else if (error.response?.data?.message) {
				errorMessage = error.response.data.message;
			} else if (error.response?.data?.error) {
				errorMessage = error.response.data.error;
			}

			showError(errorMessage);
			setOtpError(true);
			setOtp(["", "", "", ""]);
			if (otpRefs.length > 0 && otpRefs[0].current) {
				otpRefs[0].current.focus();
			}
		}
	};

	const handleOtpBack = () => {
		// Clear timer
		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current);
			timerIntervalRef.current = null;
		}

		setShowOtpModal(false);
		setOtp(["", "", "", ""]);
		setPendingProfileData(null);
		setOtpError(false);
		setTimer(60);
	};

	const handleOtpResend = async () => {
		try {
			// Extract mobile number and country code from current contact
			const contact = currentFields.contact || "";
			let mobileNumber = "";
			let countryCode = "+91"; // Default to +91 for India

			if (contact) {
				// Remove all non-digits to get clean number
				const digits = contact.replace(/\D/g, "");

				// Extract country code if present (e.g., +91 or 91)
				if (contact.startsWith("+91")) {
					countryCode = "+91";
					mobileNumber = digits.slice(2); // Remove 91 prefix
				} else if (contact.startsWith("91") && digits.length > 10) {
					countryCode = "+91";
					mobileNumber = digits.slice(2); // Remove 91 prefix
				} else {
					// No country code, assume it's Indian number
					mobileNumber = digits.slice(-10); // Take last 10 digits
				}

				// Ensure we have exactly 10 digits
				if (mobileNumber.length !== 10) {
					mobileNumber = digits.slice(-10);
				}
			}

			// Use updated contact if available in pendingProfileData
			if (pendingProfileData && pendingProfileData.contact) {
				const pendingDigits = pendingProfileData.contact.replace(
					/\D/g,
					"",
				);
				mobileNumber = pendingDigits.slice(-10);
			}

			if (!mobileNumber || mobileNumber.length !== 10) {
				showError(
					"Invalid mobile number. Please check your contact number.",
				);
				return;
			}

			const response = await accountService.resendOTP(
				mobileNumber,
				countryCode,
			);

			if (response.success && response.code === 200) {
				showSuccess("OTP resent successfully!");
				// Reset timer and OTP fields
				startOtpTimer();
				setOtp(["", "", "", ""]);
				setOtpError(false);
				// Focus on first OTP input
				if (otpRefs.length > 0 && otpRefs[0].current) {
					otpRefs[0].current.focus();
				}
			} else {
				const errorMsg =
					response.message ||
					response.error ||
					"Failed to resend OTP. Please try again.";
				showError(errorMsg);
			}
		} catch (error) {
			console.error("Resend OTP error:", error);
			console.error("Error response:", error.response?.data);

			if (error.response?.data?.message) {
				showError(error.response.data.message);
			} else if (error.response?.data?.error) {
				showError(error.response.data.error);
			} else {
				showError("Failed to resend OTP. Please try again.");
			}
		}
	};

	const handlePasswordSave = (passwords) => {
		// Attempt to change password via PATCH /admin/account
		(async () => {
			try {
				const payload = {
					old_password: passwords.current,
					new_password: passwords.new,
				};
				const res = await accountService.patchProfile(payload);
				if (res?.success && res.code === 200) {
					showSuccess("Password updated successfully!");
					setShowPasswordModal(false);
					// Clear auth and force re-login
					clearAuthCookie();
					localStorage.removeItem("hasShownPasswordModal");
					window.location.href = "/login";
				} else {
					const err =
						res?.message ||
						res?.error ||
						"Failed to update password";
					showError(err);
				}
			} catch (error) {
				console.error("Password change error:", error);
				const errMsg =
					error?.response?.data?.message ||
					error?.response?.data?.error ||
					error?.message ||
					"Failed to update password";
				showError(errMsg);
			}
		})();
	};

	const handlePasswordBack = () => {
		setShowPasswordModal(false);
	};

	const originalFirstName = (fields.name || "").trim().split(" ")[0] || "";
	const originalLastName =
		(fields.name || "").trim().split(" ").slice(1).join(" ") || "";

	const hasChanges =
		editedFields.size > 0 ||
		(editingField && tempValue !== currentFields[editingField]) ||
		formData.firstName !== originalFirstName ||
		formData.lastName !== originalLastName ||
		formData.location !== (fields.facility || "") ||
		formData.joiningDate !== "";

	return (
		<>
			<Modal
				open={open && !showOtpModal && !showPasswordModal}
				onClose={onClose}
			>
				<div className="flex flex-col">
					<h2 className="text-2xl mt-6 font-semibold text-[var(--color-neutral-primary)] mb-2">
						Edit your profile
					</h2>
					<p className="text-[var(--color-stroke-brand)] mb-6 ">
						Changes will be saved to your account and used across
						the app.
					</p>
					<div className="space-y-6 mb-6">
						<div className="space-y-4">
							<h3 className="text-[var(--color-neutral-secondary)] text-base">
								Basic details
							</h3>
							<div className="grid grid-cols-2 gap-4">
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
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<h3 className="text-[var(--color-neutral-secondary)] text-base">
									Assigned location{" "}
									<span className="text-sm text-[var(--color-neutral-secondary)]">
										(optional)
									</span>
								</h3>
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
										onFocus={() =>
											handleFocus("joiningDate")
										}
										onBlur={handleBlur}
										isFocused={
											focusedField === "joiningDate"
										}
										className="pr-10 custom-date-input"
										max={
											new Date()
												.toISOString()
												.split("T")[0]
										}
									/>
									<MdCalendarToday
										onClick={() =>
											dateRef.current?.showPicker()
										}
										className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--info-panel-view-bg)] cursor-pointer"
									/>
								</div>
							</div>
						</div>
						<div className="space-y-4">
							<h3 className="text-[var(--color-neutral-secondary)] text-base">
								Contact details
							</h3>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<MobileNumberInput
										value={currentFields.contact}
										onChange={(value) => {
											setCurrentFields((prev) => ({
												...prev,
												contact: value,
											}));
											setEditedFields(
												(prev) =>
													new Set([
														...prev,
														"contact",
													]),
											);
										}}
										placeholder="Enter mobile number"
										onValidationChange={setIsMobileValid}
										className="w-full"
									/>
								</div>
								<FieldRow
									value={currentFields.email}
									onEdit={() => handleFieldEdit("email")}
									isEdited={editedFields.has("email")}
									isEditing={editingField === "email"}
									tempValue={tempValue}
									onTempValueChange={setTempValue}
									onSave={() => handleFieldSave("email")}
									type="email"
								/>
							</div>
						</div>
						<div className="space-y-4">
							<h3 className="text-[var(--color-neutral-secondary)] text-base">
								Password
							</h3>
							<div className="grid grid-cols-2 gap-4">
								<FieldRow
									label="Password"
									value={currentFields.password}
									onEdit={() => {
										// Open the dedicated password modal instead of inline edit
										setShowPasswordModal(true);
										setEditingField(null);
									}}
									isEdited={false}
									isEditing={false}
									tempValue={tempValue}
									onTempValueChange={setTempValue}
									onSave={() => handleFieldSave("password")}
									type="password"
								/>
							</div>
						</div>
					</div>
					<hr className="w-full border-t border-[var(--color-box-border)] pb-6" />
					<div className="flex items-center gap-4">
						<Button
							onClick={onClose}
							variant="grayOutline"
							size="lg"
							className="cursor-pointer btn-size-md-lg w-1/2 !text-[var(--color-stroke-brand)] font-medium text-xl py-2"
						>
							CANCEL
						</Button>
						<Button
							onClick={handleSaveChanges}
							variant="disabledPrimary"
							disabled={!hasChanges}
							className="w-1/2 btn-size-md-lg"
						>
							SAVE CHANGES
						</Button>
					</div>
				</div>
			</Modal>

			<OtpVerifyModal
				open={showOtpModal}
				onClose={() => setShowOtpModal(false)}
				email={otpEmail}
				otp={otp}
				setOtp={setOtp}
				timer={timer}
				onBack={handleOtpBack}
				onVerify={handleOtpVerify}
				otpRefs={otpRefs}
				otpError={otpError}
				onResend={handleOtpResend}
				isPassword={isPassword}
				title={title}
				message={description}
				showBackButton={true}
			/>

			<PasswordChangeModal
				open={showPasswordModal}
				onClose={() => setShowPasswordModal(false)}
				onBack={handlePasswordBack}
				onSave={handlePasswordSave}
			/>
		</>
	);
}

function FieldRow({
	label,
	value,
	onEdit,
	isEdited,
	isEditing,
	tempValue,
	onTempValueChange,
	onSave,
	type = "text",
}) {
	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			onSave();
		}
	};

	return (
		<div className="flex items-center justify-between">
			<div className="flex w-full justify-between items-center">
				{isEditing ? (
					<div className="relative w-full rounded-lg flex items-center transition-colors duration-150">
						<input
							type={type === "password" ? "text" : type}
							value={tempValue}
							onChange={(e) => onTempValueChange(e.target.value)}
							onKeyDown={handleKeyPress}
							className="w-full px-3 py-2 rounded-lg 
             border border-[var(--color-box-border)] 
             text-[var(--color-neutral-secondary)] placeholder:text-[var(--color-neutral-light)]
             bg-white 
             hover:border-[var(--info-panel-view-bg)] 
             focus:border-[var(--info-panel-view-bg)] 
             focus:bg-white focus:shadow-[0_0_0_4px_var(--color-shadow-select)]
             focus:ring-0 outline-none"
							autoFocus
						/>
						<button
							onClick={onSave}
							className="absolute right-2 text-[var(--info-panel-view-bg)] hover:text-[var(--color-success-dark)] p-1"
						>
							<CheckIcon className="text-[var(--notif-success)]" />
						</button>
					</div>
				) : (
					<>
						<span className="w-full px-3 py-4 text-[var(--color-neutral-secondary)] pl-4 break-all">
							{value}
						</span>
						<button
							className="cursor-pointer flex items-center ml-2"
							onClick={onEdit}
							aria-label={`Edit ${label}`}
						>
							{isEdited ? (
								<MdDone className="w-5 h-5 text-[var(--info-panel-view-bg)]" />
							) : (
								<PencilLine className="w-5 h-5 text-[var(--info-panel-view-bg)]" />
							)}
						</button>
					</>
				)}
			</div>
		</div>
	);
}

function EditIcon() {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M16.4745 5.40801L18.5917 7.52524M17.8358 3.54289L11.6002 9.77846C11.3243 10.0544 11.1317 10.4093 11.0488 10.7976L10.5 14L13.7024 13.4512C14.0907 13.3683 14.4456 13.1757 14.7215 12.8998L20.9571 6.66421C21.281 6.34028 21.4645 5.90599 21.4645 5.4535C21.4645 5.00101 21.281 4.56672 20.9571 4.24279C20.6331 3.91885 20.1989 3.73539 19.7464 3.73539C19.2939 3.73539 18.8596 3.91885 18.5356 4.24279L17.8358 3.54289Z"
				stroke="#FE5720"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M19 15V18C19 18.5304 18.7893 19.0391 18.4142 19.4142C18.0391 19.7893 17.5304 20 17 20H6C5.46957 20 4.96086 19.7893 4.58579 19.4142C4.21071 19.0391 4 18.5304 4 18V7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5H9"
				stroke="#FE5720"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function CheckIcon() {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M20 6L9 17L4 12"
				stroke="#5ca940"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

const defaultFields = {
	name: "",
	email: "",
	contact: "",
	password: "**********",
	facility: "",
};
