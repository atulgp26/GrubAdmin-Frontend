"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SetNewPasswordModal from "@/components/pages/login/SetNewPasswordModal";
import { authService } from "@/api/services/authService";
import { showError, showSuccess } from "@/components/ui/toast";
import { getApiError } from "@/api/errorHandler";

function ResetPasswordContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [open, setOpen] = useState(false);
	const email = searchParams.get("email");
	const token = searchParams.get("token");

	useEffect(() => {
		if (email && token) {
			setOpen(true);
		}
	}, [email, token]);

	const handleSave = async (password) => {
		try {
			const response = await authService.forgotPasswordConfirm({
				email: decodeURIComponent(email),
				otp: token,
				password,
			});

			if (response?.success) {
				showSuccess("Password reset successfully!", "", true);
				setOpen(false);
				router.replace("/login");
				return;
			}

			showError(getApiError(response));
		} catch (error) {
			showError(getApiError(error));
		}
	};

	if (!email || !token) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white p-6">
				<h1 className="text-xl font-semibold text-[var(--color-neutral-primary)]">
					Invalid or expired link
				</h1>
				<p className="text-[var(--color-neutral-secondary)] text-center max-w-md">
					This password reset link is invalid or has expired. Please request a
					new one from the login page.
				</p>
				<a
					href="/login"
					className="text-[var(--color-brand-default)] font-medium hover:underline"
				>
					Back to login
				</a>
			</div>
		);
	}

	return (
		<SetNewPasswordModal
			open={open}
			onClose={() => router.replace("/login")}
			onSave={handleSave}
		/>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-white">
					Loading...
				</div>
			}
		>
			<ResetPasswordContent />
		</Suspense>
	);
}
