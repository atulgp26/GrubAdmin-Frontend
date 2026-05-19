import { API_BASE_URL } from "./config";
import { getHeaders } from "./utils";
import { clearAuthCookie } from "@/utils/cookies";

// Handle 401 redirect - only run once per session to avoid redirect loops
let isRedirecting = false;

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
			error: error?.message || "Failed to fetch",
			message: "Network request failed. Please check your connection and try again.",
		};
	}
	// Handle 401 Unauthorized - token expired
	if (response.status === 401) {
		clearAuthCookie();

		// Only redirect if we're in browser and not already redirecting
		if (
			typeof window !== "undefined" &&
			!isRedirecting &&
			!window.location.pathname.includes("/login")
		) {
			isRedirecting = true;
			window.location.href = "/login";
		}
		// Try to return a structured error response instead of throwing on server
		try {
			const maybeJson = await response.clone().json();
			return {
				success: false,
				code: 401,
				...maybeJson,
				error: maybeJson?.error || "Unauthorized",
				message: maybeJson?.message || "Session expired",
			};
		} catch (_) {
			return {
				success: false,
				code: 401,
				error: "Unauthorized",
				message: "Session expired",
			};
		}
	}

	if (config.returnRaw) {
		return response;
	}

	if (!response.ok) {
		// Return structured error instead of throwing to avoid white screens
		try {
			const json = await response.clone().json();
			return {
				success: false,
				code: response.status,
				...json,
				error: json?.error || `HTTP ${response.status}`,
				message: json?.message,
			};
		} catch (_) {
			const text = await response.text();
			return {
				success: false,
				code: response.status,
				error: `HTTP ${response.status}`,
				message: text,
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
			error: "Invalid JSON",
			message: "Failed to parse server response",
		};
	}
};
