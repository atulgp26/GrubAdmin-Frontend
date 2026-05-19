"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
	const {
		isAuthenticated,
		isInitialized,
		isLoading,
	} = useAuth();

	const router = useRouter();

	useEffect(() => {
		if (
			isInitialized &&
			!isLoading &&
			isAuthenticated === false
		) {
			router.replace("/login");
		}
	}, [
		isAuthenticated,
		isInitialized,
		isLoading,
		router,
	]);

	// Still checking session
	if (
		!isInitialized ||
		isLoading ||
		isAuthenticated === null
	) {
		return null;
	}

	// Explicitly logged out
	if (isAuthenticated === false) {
		return null;
	}

	return children;
}