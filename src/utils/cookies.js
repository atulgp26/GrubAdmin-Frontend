/**
 * Cookie utility functions
 *
 * AUTH ARCHITECTURE:
 * ─────────────────
 * Backend sets an HttpOnly `auth_token` cookie on successful login/OTP-verify.
 * This cookie is NOT accessible via JavaScript (HttpOnly flag).
 * All API requests use `credentials: "include"` which automatically sends it.
 *
 * The `auth` cookie (JS-accessible) is a LEGACY client-side hint only.
 * It is NOT the source of truth for authentication.
 * Session validation MUST be done via API (GET /admin/account/me).
 */

export const setCookie = (name, value, days = 1) => {
	const expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
	document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export const getCookie = (name) => {
	const nameEQ = name + "=";
	const ca = document.cookie.split(";");
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === " ") c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
};

export const deleteCookie = (name) => {
	document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Authentication specific functions (legacy client-side hint only)
export const setAuthCookie = (email, authToken, time = 1 / 24) => {
	const authData = { email, authToken, timestamp: Date.now() };
	setCookie("auth", JSON.stringify(authData), time ?? 1 / 24);
	try {
		window.dispatchEvent(new Event("auth-changed"));
	} catch (_) {}
};

export const getAuthCookie = () => {
	const authCookie = getCookie("auth");
	if (!authCookie) return null;

	try {
		const authData = JSON.parse(authCookie);
		const now = Date.now();
		const cookieAge = now - authData.timestamp;
		const maxAge = 60 * 60 * 1000;

		if (cookieAge > maxAge) {
			deleteCookie("auth");
			return null;
		}

		return authData;
	} catch (error) {
		deleteCookie("auth");
		return null;
	}
};

export const clearAuthCookie = () => {
	deleteCookie("auth");
};

/**
 * Synchronous auth checks are intentionally not supported because session cookie is HttpOnly.
 * Authentication must be verified via API.
 */
export const isAuthenticated = () => {
	return false;
};
