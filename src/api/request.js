import { API_BASE_URL } from "./config";
import { getHeaders } from "./utils";
import { clearAuthCookie } from "@/utils/cookies";
import { clearToken } from "./utils";

// Handle 401 redirect - only run once per session to avoid redirect loops
let isRedirecting = false;

const HTTP_ERROR_MESSAGES = {
	502: "Server temporarily unavailable. Please try again.",
	503: "Service unavailable. Please try again.",
	504: "Request timeout. Please try again.",
	500: "Internal server error. Please try again.",
	429: "Too many requests. Please wait and try again.",
	403: "Access denied.",
	404: "Resource not found.",
	0: "Network request failed. Please check your connection and try again.",
};

function getFriendlyError(status) {
	return HTTP_ERROR_MESSAGES[status] || null;
}

function isHtmlResponse(response) {
	const contentType = response.headers.get("content-type") || "";
	return contentType.includes("text/html");
}

function sanitizeError(status, message) {
	const friendly = getFriendlyError(status);
	if (friendly) return friendly;
	if (typeof message === "string" && /<html|<script|<iframe/i.test(message)) {
		return "Server temporarily unavailable. Please try again.";
	}
	return message;
}

export const makeRequest = async (
	url,
	options = {},
	config = {
		returnRaw: false,
	},
) => {
	// Build headers, omitting default JSON Content-Type when sending FormData
	const isFormDataBody = options && options.body instanceof FormData;
	const baseHeaders = { ...getHeaders() };
	if (isFormDataBody && baseHeaders["Content-Type"]) {
		delete baseHeaders["Content-Type"];
	}

	let response;
	try {
		response = await fetch(`${API_BASE_URL}${url}`, {
			...options,
			credentials: "include",
			headers: {
				...baseHeaders,
				...options.headers,
			},
		});
	} catch (error) {
		console.error("Network Error:", error);
		return {
			success: false,
			code: 0,
			error: HTTP_ERROR_MESSAGES[0],
			message: HTTP_ERROR_MESSAGES[0],
		};
	}

	// Handle 401 Unauthorized - token expired
	if (response.status === 401) {
		clearAuthCookie();
		clearToken();

		// Only redirect if we're in browser and not already redirecting
		if (
			typeof window !== "undefined" &&
			!isRedirecting &&
			!window.location.pathname.includes("/login")
		) {
			isRedirecting = true;
			window.location.href = "/login";
		}
		// Try to return a structured error response instead of throwing
		try {
			const maybeJson = await response.clone().json();
			return {
				success: false,
				code: 401,
				...maybeJson,
				error: maybeJson?.error || "Invalid credentials",
				message: maybeJson?.message || "Invalid credentials",
			};
		} catch (_) {
			return {
				success: false,
				code: 401,
				error: "Invalid credentials",
				message: "Invalid credentials",
			};
		}
	}

	if (config.returnRaw) {
		return response;
	}

	if (!response.ok) {
		// Check if the response is non-JSON (e.g. Nginx HTML error page)
		if (isHtmlResponse(response)) {
			const friendlyError = getFriendlyError(response.status)
				|| "Server temporarily unavailable. Please try again.";
			return {
				success: false,
				code: response.status,
				error: friendlyError,
				message: friendlyError,
			};
		}

		// Return structured error instead of throwing to avoid white screens
		try {
			const json = await response.clone().json();
			return {
				success: false,
				code: response.status,
				...json,
				error: sanitizeError(response.status, json?.error || `HTTP ${response.status}`),
				message: sanitizeError(response.status, json?.message),
			};
		} catch (_) {
			const text = await response.text();
			return {
				success: false,
				code: response.status,
				error: sanitizeError(response.status, `HTTP ${response.status}`),
				message: sanitizeError(response.status, text),
			};
		}
	}

	// Parse JSON safely
	try {
		const jsonData = await response.json();
		return jsonData;
	} catch (_) {
		return {
			success: false,
			code: 500,
			error: "Failed to parse server response",
			message: "Failed to parse server response",
		};
	}
};
