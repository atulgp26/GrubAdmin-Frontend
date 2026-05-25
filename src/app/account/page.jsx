"use client";
import { useState, useEffect, useRef } from "react";
import { MdEdit } from "react-icons/md";
import Button from "@/components/ui/Button";
import ProfileSection from "@/components/pages/account/ProfileSection";
import DetailsSection from "@/components/pages/account/DetailsSection";
import AccountFooter from "@/components/pages/account/AccountFooter";
import EditProfileModal from "@/components/pages/account/EditProfileModal";
import DeleteAccountModal from "@/components/pages/account/DeleteAccountModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { LuPencilLine } from "react-icons/lu";
import { ArrowUpRight } from "lucide-react";
import DeleteRoleModal from "@/components/pages/employees/DeleteRoleModal";
import { accountService } from "@/api/services/accountService";
import { showSuccess, showError } from "@/components/ui/toast";
import OtpVerifyModal from "@/components/pages/login/OtpVerifyModal";
import { usePermissions } from "@/context/PermissionContext";
import PasswordChangeModal from "@/components/pages/account/PasswordChangeModal";
import LoadingDetails from "@/components/ui/LoadingDetails";

export default function AccountPage() {
	const [state, setState] = useState({
		userData: null,
		loading: true,
		editOpen: false,
		deleteOpen: false,
		deleteNotAllowedModal: false,
		otpModalOpen: false,
		otpError: false,
		fields: {
			name: "",
			email: "",
			contact: "",
			password: "**********",
			facility: "",
		},
	});

	const [otp, setOtp] = useState(["", "", "", ""]);
	const [otpRefs] = useState([useRef(), useRef(), useRef(), useRef()]);
	const { can } = usePermissions();
	const [showAddPasswordModal, setShowAddPasswordModal] = useState(false);

	const [showChangePasswordModal, setShowChangePasswordModal] =
		useState(false);

	const handleChangePassword = async (passwords) => {
		try {
			const payload = {
				old_password: passwords.current,
				new_password: passwords.new,
			};
			const res = await accountService.patchProfile(payload);
			if (res?.success && res.code === 200) {
				showSuccess("Password changed successfully!");
				setShowChangePasswordModal(false);
			} else {
				showError(
					res?.message || res?.error || "Failed to change password",
				);
			}
		} catch (error) {
			showError(
				error?.response?.data?.message || "Failed to change password",
			);
		}
	};

	const updateState = (updates) => {
		setState((prev) => ({ ...prev, ...updates }));
	};

	const handleAddPassword = async (passwords) => {
		try {
			const payload = { new_password: passwords.new };
			const res = await accountService.patchProfile(payload);
			if (res?.success && res.code === 200) {
				showSuccess("Password set successfully!");
				setShowAddPasswordModal(false);
				updateState({
					fields: { ...state.fields, password: "**********" },
					userData: {
						...state.userData,
						basicDetails: {
							...state.userData.basicDetails,
							password: "**********",
						},
					},
				});
			} else {
				showError(
					res?.message || res?.error || "Failed to set password",
				);
			}
		} catch (error) {
			showError(
				error?.response?.data?.message || "Failed to set password",
			);
		}
	};

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				updateState({ loading: true });
				const response = await accountService.getProfile();

				if (response.success && response.code === 200) {
					const user = response.data?.user || response.data;

					if (!user) {
						showError("Invalid profile data received");
						updateState({ loading: false });
						return;
					}

					const formatDate = (dateString) => {
						if (!dateString) return "Not specified";
						try {
							return new Date(dateString).toLocaleDateString();
						} catch (e) {
							return "Not specified";
						}
					};

					const firstName = user.first_name || "";
					const lastName = user.last_name || "";
					const fullName =
						[firstName, lastName].filter(Boolean).join(" ") ||
						"Unknown";

					let formattedContact = "";
					if (user.mobile_number) {
						const countryCode = user.country_code || "+91";
						formattedContact = `${countryCode} ${user.mobile_number}`;
					}

					// ✅ Use is_password_set from API
					const passwordDisplay = user.is_password_set
						? "**********"
						: "ADD";

					const userData = {
						name: fullName,
						id: user.id || "",
						isSuperAdmin: user.role?.is_super_admin || false,
						basicDetails: {
							email: user.email || "Not provided",
							contact:
								formattedContact ||
								user.mobile_number ||
								"Not provided",
							password: passwordDisplay,
						},
						professionalDetails: {
							role: (
								<div className="flex items-center justify-between text-[var(--color-neutral-secondary)] w-[350px] text-base">
									<span className="text-[var(--color-neutral-secondary)]">
										{response.data?.role ||
											user.role ||
											"No role assigned"}
									</span>
									<ArrowUpRight className="w-5 h-5" />
								</div>
							),
							facility: user.location || "Not specified",
							joiningDate: formatDate(user.joining_date),
						},
						createdAt: formatDate(user.created_at),
					};

					const fields = {
						name: fullName,
						email: user.email || "",
						contact: formattedContact || user.mobile_number || "",
						password: passwordDisplay,
						facility: user.location || "",
						joiningDate: user.joining_date || "",
					};

					updateState({
						userData,
						fields,
						loading: false,
					});
				} else {
					showError("Failed to load profile data");
					updateState({ loading: false });
				}
			} catch (error) {
				console.error("Profile fetch error:", error);

				let errorMessage = "Failed to load profile data";
				if (error?.response?.data?.message) {
					errorMessage = error.response.data.message;
				} else if (error?.response?.data?.error) {
					errorMessage = error.response.data.error;
				} else if (error?.message) {
					errorMessage = error.message;
				}

				showError(errorMessage);
				updateState({ loading: false });
			}
		};

		fetchProfile();
	}, []);

	const handleFieldChange = (field) => {
		const value = prompt(
			`Enter new value for ${field}:`,
			state.fields[field],
		);
		if (value !== null) {
			updateState({ fields: { ...state.fields, [field]: value } });
		}
	};

	const handleEditSave = async (updatedProfileData) => {
		try {
			const profileResponse = await accountService.getProfile();
			if (profileResponse.success && profileResponse.code === 200) {
				const user = profileResponse.data?.user || profileResponse.data;
				if (user) {
					const firstName = user.first_name || "";
					const lastName = user.last_name || "";
					const fullName =
						[firstName, lastName].filter(Boolean).join(" ") ||
						state.userData.name;

					let formattedContact = "";
					if (user.mobile_number) {
						const countryCode = user.country_code || "+91";
						formattedContact = `${countryCode} ${user.mobile_number}`;
					}

					const passwordDisplay = user.is_password_set
						? "**********"
						: "ADD";

					updateState({
						editOpen: false,
						userData: {
							...state.userData,
							name: fullName,
							basicDetails: {
								...state.userData.basicDetails,
								email:
									user.email ||
									state.userData.basicDetails.email,
								contact:
									formattedContact ||
									state.userData.basicDetails.contact,
								password: passwordDisplay,
							},
							professionalDetails: {
								...state.userData.professionalDetails,
								facility:
									user.location ||
									state.userData.professionalDetails.facility,
							},
						},
						fields: {
							...state.fields,
							name: fullName,
							email: user.email || state.fields.email,
							contact: formattedContact || state.fields.contact,
							facility: user.location || state.fields.facility,
							password: passwordDisplay,
						},
					});
				}
			}
		} catch (error) {
			console.error("Profile refresh error:", error);
		}
	};

	const handleDelete = () => {
		updateState({ deleteOpen: true });
	};

	const handleDeleteAccount = () => {
		updateState({ deleteOpen: false, otpModalOpen: true, otpError: false });
		setOtp(["", "", "", ""]);
	};

	const handleOtpVerify = async () => {
		const enteredOtp = otp.join("");

		if (enteredOtp.length !== 4) {
			showError("Please enter a valid 4-digit OTP");
			return;
		}

		try {
			const email = state.userData?.basicDetails?.email;

			if (!email) {
				showError(
					"Email not found. Cannot proceed with account deletion.",
				);
				return;
			}

			const eligibilityResponse = await accountService.deleteEligibility(
				email,
				enteredOtp,
			);

			if (
				eligibilityResponse.success &&
				eligibilityResponse.code === 200
			) {
				const deleteResponse = await accountService.deleteAccount();

				if (deleteResponse.success && deleteResponse.code === 200) {
					showSuccess("Account deleted successfully!");
					updateState({ otpModalOpen: false });
					const { clearAuthCookie } = await import("@/utils/cookies");
					clearAuthCookie();
					window.location.href = "/login";
				} else {
					showError("Failed to delete account");
				}
			} else {
				updateState({
					otpModalOpen: false,
					deleteNotAllowedModal: true,
				});
			}
		} catch (error) {
			console.error("OTP verification error:", error);

			let errorMessage = "Invalid OTP. Please try again.";
			if (error?.response?.data?.message) {
				errorMessage = error.response.data.message;
			} else if (error?.response?.data?.error) {
				errorMessage = error.response.data.error;
			} else if (error?.message) {
				errorMessage = error.message;
			}

			showError(errorMessage);
			updateState({ otpError: true });
			setOtp(["", "", "", ""]);
			if (otpRefs.length > 0 && otpRefs[0].current) {
				otpRefs[0].current.focus();
			}
		}
	};

	const handleSupport = () => {
		alert("Contacting support...");
	};

	if (state.loading) {
		return (
			<ProtectedRoute>
				<div className="min-h-[60vh]">
					<LoadingDetails entity="profile" />
				</div>
			</ProtectedRoute>
		);
	}

	if (!state.userData) {
		return (
			<ProtectedRoute>
				<div className="flex justify-center items-center min-h-[60vh]">
					<div className="text-lg text-red-500">
						Failed to load profile data
					</div>
				</div>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute>
			<div className="space-y-8">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)] !ml-[16px]">
						Your account
					</h1>
					<div className="flex items-center gap-3">
						{/* CHANGE PASSWORD — only for non-superadmin */}
						{!state.userData.isSuperAdmin && (
							<Button
								className="bg-white !border !border-[var(--info-panel-view-bg)] !text-[var(--info-panel-view-bg)] hover:bg-[var(--warning-light)] px-4 py-2 rounded-lg flex items-center gap-2 font-semibold"
								onClick={() => setShowChangePasswordModal(true)}
								variant="secondary"
							>
								<LuPencilLine className="w-4 h-4" />
								<span className="block font-medium">
									CHANGE PASSWORD
								</span>
							</Button>
						)}
						{/* EDIT — only for superadmin */}
						{state.userData.isSuperAdmin &&
							(can("edit profile details", "clients") ||
								can("edit profile details", "account") ||
								can("edit profile details")) && (
								<Button
									className="bg-white !border !border-[var(--info-panel-view-bg)] !text-[var(--info-panel-view-bg)] hover:bg-[var(--warning-light)] px-4 py-2 rounded-lg flex items-center gap-2 font-semibold"
									onClick={() =>
										updateState({ editOpen: true })
									}
									variant="secondary"
								>
									<LuPencilLine className="w-4 h-4" />
									<span className="block font-medium">
										EDIT
									</span>
								</Button>
							)}
					</div>
				</div>

				<div className="flex justify-center items-center w-full min-h-[60vh]">
					<div className="grid grid-cols-10 gap-20 w-full">
						<div className="col-span-4">
							<ProfileSection
								name={state.userData.name}
								id={state.userData.id}
							/>
						</div>
						<div className="col-span-6">
							<DetailsSection
								basicDetails={state.userData.basicDetails}
								professionalDetails={
									state.userData.professionalDetails
								}
								onAddPassword={() =>
									setShowAddPasswordModal(true)
								}
							/>
						</div>
					</div>
				</div>

				<AccountFooter
					createdAt={state.userData.createdAt}
					onDelete={handleDelete}
					allowDelete={
						can("delete entries", "clients") ||
						can("delete account", "account") ||
						can("delete account")
					}
				/>

				<EditProfileModal
					open={state.editOpen}
					onClose={() => updateState({ editOpen: false })}
					onSave={handleEditSave}
					fields={state.fields}
					onFieldChange={handleFieldChange}
				/>
				<PasswordChangeModal
					open={showChangePasswordModal}
					onClose={() => setShowChangePasswordModal(false)}
					onBack={() => setShowChangePasswordModal(false)}
					onSave={handleChangePassword}
					isAddMode={false}
				/>
				<DeleteAccountModal
					open={state.deleteOpen}
					onClose={() => updateState({ deleteOpen: false })}
					onDelete={handleDeleteAccount}
					onSupport={handleSupport}
				/>

				<DeleteRoleModal
					open={state.deleteNotAllowedModal}
					onClose={() =>
						updateState({ deleteNotAllowedModal: false })
					}
					title="Deletion not allowed"
					deleteNotAllowed={true}
					description={`This is the only active Super admin account for managing the\nplatform.\nTo proceed, please assign the role to another employee, of edit your credentials to transfer ownership.`}
				/>

				<OtpVerifyModal
					open={state.otpModalOpen}
					onClose={() => updateState({ otpModalOpen: false })}
					email={state.userData?.basicDetails?.email || ""}
					otp={otp}
					setOtp={setOtp}
					timer={0}
					onBack={() => {
						updateState({
							otpModalOpen: false,
							deleteOpen: true,
							otpError: false,
						});
					}}
					onVerify={handleOtpVerify}
					otpRefs={otpRefs}
					otpError={state.otpError}
					onResend={() => {
						showError(
							"Please contact support to resend OTP for account deletion",
						);
					}}
					title="Verify Account Deletion"
					message="Enter the OTP sent to your email to confirm account deletion"
					showBackButton={true}
					buttonText="DELETE ACCOUNT"
				/>
			</div>
		</ProtectedRoute>
	);
}
