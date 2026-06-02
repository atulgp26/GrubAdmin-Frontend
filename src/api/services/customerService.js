import httpClient from "../httpClient";
import { API_ENDPOINTS, API_BASE_URL } from "../config";
import { getHeaders } from "../utils";
import { clearAuthCookie } from "@/utils/cookies";

export const customerService = {
	// Get customer verticals
	getVerticals: async () => {
		return httpClient.get(API_ENDPOINTS.CUSTOMER.GET_VERTICALS);
	},

	// Get customers list
	getCustomers: async (params) => {
		return httpClient.get(
			API_ENDPOINTS.CUSTOMER.GET_CUSTOMERS,
			params ?? {},
		);
	},

	createCustomer: async (data) => {
		return httpClient.post(API_ENDPOINTS.CUSTOMER.CREATE_CUSTOMER, data);
	},

	// Export customers - returns blob for file download
	exportCustomers: async (params = {}) => {
		const queryString = new URLSearchParams(params).toString();
		const fullUrl = `${API_BASE_URL}${API_ENDPOINTS.CUSTOMER.EXPORT_CUSTOMERS}${queryString ? "?" + queryString : ""}`;

		console.log("Export API URL:", fullUrl);
		console.log("Export params:", params);

		const response = await httpClient.get(
			API_ENDPOINTS.CUSTOMER.EXPORT_CUSTOMERS,
			params,
			{
				returnRaw: true,
			},
		);

		console.log("Export API response status:", response.status);

		// Handle 401 Unauthorized
		if (response.status === 401) {
			clearAuthCookie();
			if (
				typeof window !== "undefined" &&
				!window.location.pathname.includes("/login")
			) {
				window.location.href = "/login";
			}
			throw new Error("Unauthorized");
		}

		// Check content type before processing
		const contentType = response.headers.get("content-type") || "";
		const contentDisposition =
			response.headers.get("content-disposition") || "";

		// If response is not OK, try to parse error message
		if (!response.ok) {
			let errorMessage = `HTTP error! status: ${response.status}`;
			try {
				if (contentType.includes("application/json")) {
					const errorData = await response.json();
					errorMessage =
						errorData.message || errorData.error || errorMessage;
					console.error("Export API error:", errorData);
				} else {
					const errorText = await response.text();
					console.error("Export API error text:", errorText);
					errorMessage = errorText || errorMessage;
				}
			} catch (e) {
				console.error("Error parsing error response:", e);
			}
			throw new Error(errorMessage);
		}

		// Check if response is JSON (error message) or blob (file)
		if (contentType.includes("application/json")) {
			const jsonData = await response.json();
			console.log("Export API JSON response:", jsonData);
			return jsonData;
		}

		// For faster download, use streaming approach if available
		// But for now, return blob directly - browser will handle download efficiently
		const blob = await response.blob();

		console.log("Export blob size:", blob.size, "bytes");

		// Check if blob is empty
		if (blob.size === 0) {
			throw new Error(
				"Export file is empty. Please check your filters and try again.",
			);
		}

		// Return blob with metadata if needed
		return {
			blob,
			filename:
				extractFilenameFromDisposition(contentDisposition) ||
				`customers_export_${new Date().toISOString().split("T")[0]}.csv`,
			contentType,
		};
	},

	// Impersonate a client (Access Complete Account)
	impersonateClient: async (clientId, data) => {
		const url = API_ENDPOINTS.CUSTOMER.IMPERSONATE_CLIENT.replace(":id", clientId);
		return httpClient.post(url, data ?? {});
	},

	// Exchange impersonation token for delivery session (call from GrubDelivery)
	getDeliveryImpersonationSession: async (token) => {
		return httpClient.post(API_ENDPOINTS.DELIVERY.IMPERSONATE, { token });
	},

	// Exit impersonation - restore admin session
	exitImpersonation: async () => {
		return httpClient.post(API_ENDPOINTS.CUSTOMER.EXIT_IMPERSONATION);
	},
};

// Helper function to extract filename from Content-Disposition header
function extractFilenameFromDisposition(disposition) {
	if (!disposition) return null;
	const filenameMatch = disposition.match(
		/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
	);
	if (filenameMatch && filenameMatch[1]) {
		return filenameMatch[1].replace(/['"]/g, "").trim();
	}
	return null;
}
