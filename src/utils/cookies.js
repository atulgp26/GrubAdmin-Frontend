/**
 * Cookie utility functions
 *
 * AUTH ARCHITECTURE:
 * ─────────────────
 * Backend sets an HttpOnly `auth_token` cookie on successful login/OTP-verify.
 * This cookie is NOT accessible via JavaScript (HttpOnly flag).
 * All API requests use `credentials: "include"` which automatically sends it.
 *
 * The `auth` cookie (JS-accessible) stores a non-sensitive session hint only
 * (email + timestamp). It MUST NOT contain JWTs or other secrets.
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

// Non-sensitive session hint only — never store JWTs here.
export const setAuthCookie = (email, time = 1 / 24) => {
	const authData = { email, timestamp: Date.now() };
	setCookie("auth", JSON.stringify(authData), time ?? 1 / 24);
	notifyAuthChanged();
};

export const getAuthCookie = () => {
	const authCookie = getCookie("auth");
	if (!authCookie) return null;

	try {
		const authData = JSON.parse(authCookie);
		if (authData?.authToken) {
			// Strip legacy JWT from client cookie.
			delete authData.authToken;
			setCookie("auth", JSON.stringify(authData), 1);
		}

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
	notifyAuthChanged();
};

export const notifyAuthChanged = () => {
	try {
		window.dispatchEvent(new Event("auth-changed"));
	} catch (_) {}
};

/**
 * Synchronous auth checks are intentionally not supported because session cookie is HttpOnly.
 * Authentication must be verified via API.
 */
export const isAuthenticated = () => {
	return false;
};
