"use client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CheckBox from "@/components/ui/CheckBox";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
	MdOutlineVpnKey,
	MdOutlineVisibility,
	MdOutlineVisibilityOff,
} from "react-icons/md";
import OtpLoginModal from "@/components/pages/login/OtpLoginModal";
import OtpVerifyModal from "@/components/pages/login/OtpVerifyModal";
import ForgotPasswordModal from "@/components/pages/login/ForgotPasswordModal";
import SetNewPasswordModal from "@/components/pages/login/SetNewPasswordModal";
import LoginHeader from "@/components/pages/login/LoginHeader";
import { HiOutlineUser } from "react-icons/hi2";
import { VscKey } from "react-icons/vsc";
import { showSuccess, showError } from "@/components/ui/toast";
import { authService } from "@/api/services/authService";
import { setToken } from "@/api/utils";
import { setAuthCookie } from "@/utils/cookies";
import { getApiError } from "@/api/errorHandler";
import TableCheckbox from "@/components/ui/TableCheckbox";
import { SEED_EMAIL, SEED_PASSWORD } from "@/constants/config";
import { useAuth } from "@/context/AuthContext";
import LoadingDetails from "@/components/ui/LoadingDetails";

const carouselData = [
	{
		title: "Link your Box",
		description:
			"Scan the box and connect via Bluetooth — it's fast and easy.",
	},
	{
		title: "Track Orders",
		description: "Monitor your orders in real-time with ease.",
	},
	{
		title: "Manage Inventory",
		description: "Keep your stock updated and never run out.",
	},
];

export default function LoginPage() {
	const router = useRouter();
	const {
		login,
		refreshSession,
		isAuthenticated,
		isLoading: authLoading,
	} = useAuth();
	const [showPassword, setShowPassword] = useState(false);
	const [carouselIndex, setCarouselIndex] = useState(0);
	const [otpModalOpen, setOtpModalOpen] = useState(false);
	const [otpVerifyModalOpen, setOtpVerifyModalOpen] = useState(false);
	const [otpEmail, setOtpEmail] = useState("");
	const [otp, setOtp] = useState(["", "", "", ""]);
	const [timer, setTimer] = useState(12);
	const [isLoading, setIsLoading] = useState(false);
	const [otpError, setOtpError] = useState(false);
	const [focusedInput, setFocusedInput] = useState(null);
	const [rememberMe, setRememberMe] = useState(false);

	// Forgot Password States
	const [forgotPasswordModalOpen, setForgotPasswordModalOpen] =
		useState(false);
	const [setPasswordModalOpen, setSetPasswordModalOpen] = useState(false);
	const [isForgotPasswordFlow, setIsForgotPasswordFlow] = useState(false);
	const [verifiedOtp, setVerifiedOtp] = useState("");

	const formRef = useRef(null);
	const otpRefs = [useRef(), useRef(), useRef(), useRef()];

	const sanitizeEmail = (value) =>
		typeof value === "string" ? value.trim().toLowerCase() : "";

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		mode: "onSubmit",
		reValidateMode: "onChange",
		defaultValues: {
			email: SEED_EMAIL,
			password: SEED_PASSWORD,
		},
	});

	useEffect(() => {
		if (isAuthenticated && !authLoading) {
			router.replace("/dashboard");
		}
	}, [isAuthenticated, authLoading, router]);

	useEffect(() => {
		let interval;
		if (otpVerifyModalOpen && timer > 0) {
			interval = setInterval(() => setTimer((t) => t - 1), 1000);
		}
		return () => clearInterval(interval);
	}, [otpVerifyModalOpen, timer]);

	useEffect(() => {
		function handleClickOutside(event) {
			if (formRef.current && !formRef.current.contains(event.target)) {
				setFocusedInput(null);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const loginInProgressRef = useRef(false);

	const handleLogin = async (data) => {
		// Prevent duplicate concurrent submissions
		if (loginInProgressRef.current) return;
		loginInProgressRef.current = true;
		setIsLoading(true);
		try {
			const result = await login({
				email: data.email,
				password: data.password,
			});

			if (result.success) {
				showSuccess("Login successful!", "", true);
				router.replace("/dashboard");
			} else {
				showError(getApiError(result));
			}
		} catch (error) {
			console.error("Login error:", error);
			showError(getApiError(error));
		} finally {
			setIsLoading(false);
			loginInProgressRef.current = false;
		}
	};

	const handleOtpLogin = async (email) => {
		try {
			setIsLoading(true);
			const normalizedEmail = sanitizeEmail(email);
			const response = await authService.sendOtp(normalizedEmail);

			if (
				response.success &&
				(!response.code ||
					(response.code >= 200 && response.code < 300))
			) {
				setOtpEmail(normalizedEmail);
				setOtpModalOpen(false);
				setOtpVerifyModalOpen(true);
				setIsForgotPasswordFlow(false); // Ensure we're in regular OTP flow
				setTimer(12);
				setOtp(["", "", "", ""]);
				showSuccess("OTP sent successfully!", "", true);
			} else {
				showError(getApiError(response));
			}
		} catch (error) {
			console.error("Send OTP error:", error);
			showError(getApiError(error));
		} finally {
			setIsLoading(false);
		}
	};

	const onLoginError = () => {
		if (errors.password) {
			showError("Password is required");
		} else if (errors.email) {
			showError(errors.email.message);
		}
	};

	// Forgot Password Handlers
	const handleForgotPassword = async (email) => {
		try {
			setIsLoading(true);
			const normalizedEmail = sanitizeEmail(email);
			const response =
				await authService.forgotPasswordSendOtp(normalizedEmail);

			if (
				response.success &&
				(!response.code ||
					(response.code >= 200 && response.code < 300))
			) {
				setOtpEmail(normalizedEmail);
				setForgotPasswordModalOpen(false);
				setIsForgotPasswordFlow(true);
				setOtpVerifyModalOpen(true);
				setTimer(12);
				setOtp(["", "", "", ""]);
				showSuccess("OTP sent successfully!", "", true);
			} else {
				showError(getApiError(response));
			}
		} catch (error) {
			console.error("Forgot password send OTP error:", error);
			showError(getApiError(error));
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendOtp = async () => {
		try {
			setIsLoading(true);
			const normalizedEmail = sanitizeEmail(otpEmail);
			const response = isForgotPasswordFlow
				? await authService.forgotPasswordResendOtp(normalizedEmail)
				: await authService.resendOtp(normalizedEmail);

			if (
				response.success &&
				(!response.code ||
					(response.code >= 200 && response.code < 300))
			) {
				setTimer(12);
				showSuccess("A new OTP has been sent!", "", true);
			} else {
				showError(getApiError(response));
			}
		} catch (error) {
			console.error("Resend OTP error:", error);
			showError(getApiError(error));
		} finally {
			setIsLoading(false);
		}
	};

	const handleOtpVerify = async () => {
		const enteredOtp = otp.join("");

		if (enteredOtp.length !== 4) {
			showError("Please enter a valid 4-digit OTP");
			return;
		}

		try {
			setIsLoading(true);

			// If forgot password flow, verify OTP using forgot password verify endpoint
			if (isForgotPasswordFlow) {
				setVerifiedOtp(enteredOtp);
				setOtpVerifyModalOpen(false);
				setSetPasswordModalOpen(true);
				setOtpError(false);
				setOtp(["", "", "", ""]);
				showSuccess("OTP entered. Set your new password.", "", true);
				return;
			}

			// Regular OTP login flow
			const response = await authService.verifyOtp({
				email: sanitizeEmail(otpEmail),
				otp: enteredOtp,
			});

			if (
				response?.success &&
				(!response.code ||
					(response.code >= 200 && response.code < 300))
			) {
				showSuccess("OTP verified successfully!", "", true);
				setOtpVerifyModalOpen(false);
				setOtpError(false);

				// Store JWT for Authorization header (fallback when HttpOnly cookie
				// isn't sent due to cross-origin SameSite restrictions)
				if (response?.data?.token) {
					setToken(response.data.token);
					setAuthCookie(otpEmail, response.data.token, 1);
				}

				// Refresh AuthContext session (the HttpOnly cookie was set by the backend)
				const sessionValid = await refreshSession();
				if (!sessionValid) {
					showError("Session not yet validated. Please try again.");
					router.replace("/login");
					return;
				}

				router.replace("/dashboard");
			} else {
				showError(getApiError(response));
				setOtpError(true);
				setOtp(["", "", "", ""]);
				if (otpRefs.length > 0 && otpRefs[0].current) {
					otpRefs[0].current.focus();
				}
			}
		} catch (error) {
			console.error("Verify OTP error:", error);
			showError(getApiError(error));

			setOtpError(true);
			setOtp(["", "", "", ""]);
			if (otpRefs.length > 0 && otpRefs[0].current) {
				otpRefs[0].current.focus();
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleSavePassword = async (newPassword) => {
		try {
			setIsLoading(true);
			const response = await authService.forgotPasswordConfirm({
				email: sanitizeEmail(otpEmail),
				otp: verifiedOtp,
				password: newPassword,
			});

			if (
				response.success &&
				(!response.code ||
					(response.code >= 200 && response.code < 300))
			) {
				showSuccess("Password reset successfully!", "", true);
				setSetPasswordModalOpen(false);
				setIsForgotPasswordFlow(false);
				setVerifiedOtp("");
				router.push("/login");
			} else {
				showError(getApiError(response));
			}
		} catch (error) {
			console.error("Forgot password confirm error:", error);
			showError(getApiError(error));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<div className="w-full h-full bg-white container mx-auto">
				<LoginHeader />
			</div>
			<div className="p-6 w-full flex items-center justify-center min-h-[calc(100vh-116px)]">
				<div className="mx-auto flex flex-col md:flex-row items-center justify-center gap-12">
					<div className="w-[50%] h-[640px] p-12 flex flex-col gap-6 bg-white">
						<div>
							<h2 className="text-3xl text-[var(--color-neutral-primary)] font-semibold mb-2">
								Welcome to GrubPac!
							</h2>
							<p className="text-lg text-[var(--color-neutral-secondary)]">
								Enter your registered details to access your
								account.
							</p>
						</div>
						<form
							ref={formRef}
							className="flex flex-col gap-4"
							onSubmit={handleSubmit(handleLogin, onLoginError)}
						>
							<div className="relative">
								<Input
									type="email"
									placeholder="Email ID"
									className={`w-full pl-10 pr-3 py-2 !font-normal !text-lg rounded text-[var(--color-neutral-secondary)] placeholder:text-[var(--color-neutral-light)]`}
									isFocused={focusedInput === "email"}
									onFocus={() => setFocusedInput("email")}
									onBlur={() => setFocusedInput(null)}
									{...register("email", {
										required: "Email is required",
										pattern: {
											value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
											message:
												"Please enter a valid email address",
										},
									})}
								/>
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-light)]">
									<HiOutlineUser size={22} />
								</span>
							</div>
							{errors.email && (
								<p className="text-red-500 text-sm -mt-2">
									{errors.email.message}
								</p>
							)}
							<div className="relative">
								<Input
									type={showPassword ? "text" : "password"}
									placeholder="Password"
									className={`w-full pl-10 pr-10 py-2 !font-normal !text-lg text-[var(--color-neutral-secondary)] placeholder:text-[var(--color-neutral-light)] rounded`}
									isFocused={focusedInput === "password"}
									onFocus={() => setFocusedInput("password")}
									onBlur={() => setFocusedInput(null)}
									{...register("password", {
										required: "Password is required",
									})}
								/>
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-light)]">
									<VscKey size={22} />
								</span>
								<button
									type="button"
									className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-default)] focus:outline-none"
									onClick={() => setShowPassword((v) => !v)}
									tabIndex={-1}
								>
									{showPassword ? (
										<MdOutlineVisibility size={22} />
									) : (
										<MdOutlineVisibilityOff size={22} />
									)}
								</button>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<TableCheckbox
										checked={rememberMe}
										onChange={(e) =>
											setRememberMe(e.target.checked)
										}
									/>
									<label className="text-base text-[var(--color-neutral-secondary)] text-lg cursor-pointer">
										Remember me
									</label>
								</div>
								<button
									type="button"
									onClick={() =>
										setForgotPasswordModalOpen(true)
									}
									className="text-base font-medium text-[var(--color-stroke-brand)] hover:underline"
								>
									FORGOT PASSWORD
								</button>
							</div>

							<Button
								type="submit"
								disabled={isLoading}
								className="btn-size-md-lg w-full !text-xl font-medium rounded-lg !my-0 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? (
									<LoadingDetails
										variant="inline"
										text="LOGGING IN..."
									/>
								) : (
									"CONTINUE"
								)}
							</Button>
							<div className="flex justify-center gap-2 my-2">
								<span className="text-lg text-[var(--color-neutral-secondary)]">
									or
								</span>
							</div>
							<Button
								type="button"
								variant="grayOutline"
								className="btn-size-md-lg w-full !text-xl font-medium rounded-lg border !border-[var(--color-stroke-brand)]"
								onClick={() => setOtpModalOpen(true)}
							>
								LOGIN USING OTP
							</Button>
						</form>
						<div className="flex justify-evenly text-base text-[var(--color-stroke-brand)] font-medium mt-24">
							<a href="#" className="hover:underline">
								PRIVACY POLICY
							</a>
							<a href="#" className="hover:underline">
								TERMS OF SERVICE
							</a>
						</div>
					</div>

					<div className="hidden md:flex flex-col items-center justify-center w-[820px] px-12 py-12 h-[640px] ml-6 bg-[var(--color-neutral-secondary-bg)] rounded-lg">
						<div className="w-full mt-8 h-[440px] bg-white rounded mb-6 flex items-center justify-center">
							<img src="/box.png" alt="Box" className="w-full h-full object-contain p-8" />
						</div>
						<div className="text-center">
							<div className="font-semibold text-[var(--color-neutral-primary)] text-2xl mb-1">
								{carouselData[carouselIndex].title}
							</div>
							<div className="text-[var(--color-neutral-secondary)] text-lg mb-4 max-w-lg">
								{carouselData[carouselIndex].description}
							</div>
							<div className="flex justify-center gap-4 mt-2">
								{carouselData.map((_, idx) => (
									<button
										key={idx}
										onClick={() => setCarouselIndex(idx)}
										className={`w-3 h-3 rounded-full focus:outline-none transition-all duration-200 ${
											idx === carouselIndex
												? "bg-[var(--color-brand-primary-btn)]"
												: "bg-white"
										}`}
										aria-label={`Go to slide ${idx + 1}`}
									/>
								))}
							</div>
						</div>
					</div>
				</div>

				<OtpLoginModal
					open={otpModalOpen}
					onClose={() => setOtpModalOpen(false)}
					onNext={handleOtpLogin}
				/>
				<OtpVerifyModal
					open={otpVerifyModalOpen}
					onClose={() => {
						setOtpVerifyModalOpen(false);
						if (isForgotPasswordFlow) {
							setIsForgotPasswordFlow(false);
						}
					}}
					email={otpEmail}
					otp={otp}
					setOtp={setOtp}
					timer={timer}
					onBack={() => {
						setOtpVerifyModalOpen(false);
						if (isForgotPasswordFlow) {
							setForgotPasswordModalOpen(true);
							setIsForgotPasswordFlow(false);
						} else {
							setOtpModalOpen(true);
						}
						setOtpError(false);
					}}
					onVerify={handleOtpVerify}
					otpRefs={otpRefs}
					otpError={otpError}
					onResend={handleResendOtp}
					showBackButton={true}
				/>
				<ForgotPasswordModal
					open={forgotPasswordModalOpen}
					onClose={() => setForgotPasswordModalOpen(false)}
					onNext={handleForgotPassword}
				/>
				<SetNewPasswordModal
					open={setPasswordModalOpen}
					onClose={() => {
						setSetPasswordModalOpen(false);
						setIsForgotPasswordFlow(false);
					}}
					onSave={handleSavePassword}
				/>
			</div>
		</>
	);
}
