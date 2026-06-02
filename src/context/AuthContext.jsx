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
import { setAuthCookie, clearAuthCookie } from "@/utils/cookies";
import { setToken, clearToken } from "@/api/utils";
import { getApiError } from "@/api/errorHandler";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isInitialized, setIsInitialized] = useState(false);

	const loadSession = useCallback(async () => {
		setIsLoading(true);
		try {
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

	const login = useCallback(async (credentials) => {
		setIsLoading(true);
		try {
			const response = await authService.login(credentials);
			
			if (response?.success) {
				// Store JWT for Authorization header (fallback when HttpOnly cookie
				// isn't sent due to cross-origin SameSite restrictions)
				if (response?.data?.token) {
					setToken(response.data.token);
				}
				const sessionValid = await loadSession();
				if (sessionValid) {
					// Persist token for page-reload recovery (1 day = JWT expiry)
					if (response?.data?.token) {
						setAuthCookie(credentials.email, response.data.token, 1);
					}
					return { success: true };
				}
				return { success: false, error: "Session validation failed" };
			}
			
			return { 
				success: false, 
				error: getApiError(response)
			};
		} catch (error) {
			console.error("[AuthContext] Login error:", error);
			return { 
				success: false, 
				error: getApiError(error)
			};
		} finally {
			setIsLoading(false);
		}
	}, [loadSession]);

	const logout = useCallback(async () => {
		try {
			await authService.logout();
		} catch (error) {
			console.error("[AuthContext] Logout API error:", error);
		} finally {
			setUser(null);
			setIsAuthenticated(false);
			clearToken();
			clearAuthCookie();
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
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

export default AuthContext;