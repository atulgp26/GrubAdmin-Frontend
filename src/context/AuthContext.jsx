"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

import { authService } from "@/api/services/authService";
import { accountService } from "@/api/services/accountService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);

	// null = unknown
	// true = authenticated
	// false = unauthenticated
	const [isAuthenticated, setIsAuthenticated] = useState(null);

	const [isLoading, setIsLoading] = useState(true);
	const [isInitialized, setIsInitialized] = useState(false);

	const loadSession = useCallback(async () => {
		try {
			setIsLoading(true);

			const response = await accountService.getProfile();

			if (response?.success && response?.code === 200) {
				const userData = response?.data?.user || response?.data;

				if (userData) {
					setUser(userData);
					setIsAuthenticated(true);

					return true;
				}
			}

			setUser(null);
			setIsAuthenticated(false);

			return false;
		} catch (error) {
			console.error("[AuthContext] Session load error:", error);

			setUser(null);
			setIsAuthenticated(false);

			return false;
		} finally {
			setIsLoading(false);
			setIsInitialized(true);
		}
	}, []);

	const login = useCallback(
		async (credentials) => {
			try {
				setIsLoading(true);

				const response = await authService.login(credentials);

				if (!response?.success) {
					return {
						success: false,
						error:
							response?.message ||
							response?.error ||
							"Login failed",
					};
				}

				/**
				 * IMPORTANT:
				 * Give browser time to store HttpOnly cookie
				 * before validating session.
				 */
				await new Promise((resolve) =>
					setTimeout(resolve, 150)
				);

				const sessionValid = await loadSession();

				if (!sessionValid) {
					return {
						success: false,
						error: "Session validation failed",
					};
				}

				return { success: true };
			} catch (error) {
				console.error("[AuthContext] Login error:", error);

				return {
					success: false,
					error:
						error?.response?.data?.message ||
						error?.message ||
						"Login failed",
				};
			} finally {
				setIsLoading(false);
			}
		},
		[loadSession]
	);

	const logout = useCallback(async () => {
		try {
			await authService.logout();
		} catch (error) {
			console.error("[AuthContext] Logout error:", error);
		} finally {
			setUser(null);
			setIsAuthenticated(false);
		}
	}, []);

	const refreshSession = useCallback(async () => {
		return await loadSession();
	}, [loadSession]);

	useEffect(() => {
		loadSession();
	}, [loadSession]);

	const value = {
		user,
		isAuthenticated,
		isLoading,
		isInitialized,
		login,
		logout,
		refreshSession,
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error(
			"useAuth must be used within an AuthProvider"
		);
	}

	return context;
}

export default AuthContext;