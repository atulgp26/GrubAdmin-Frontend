const HTTP_ERROR_MESSAGES = {
	502: "Server temporarily unavailable. Please try again.",
	503: "Service unavailable. Please try again.",
	504: "Request timeout. Please try again.",
	500: "Internal server error. Please try again.",
	429: "Too many requests. Please wait and try again.",
	403: "Access denied.",
	404: "Resource not found.",
	401: "Invalid credentials",
	0: "Network request failed. Please check your connection and try again.",
};

export function getApiError(error) {
	if (!error) return "Something went wrong";

	const status = error?.code || error?.status || error?.response?.status;

	if (status && HTTP_ERROR_MESSAGES[status]) {
		return HTTP_ERROR_MESSAGES[status];
	}

	const message = error?.message || error?.error || error?.data?.message || error?.data?.error;

	if (message && typeof message === "string") {
		if (/<html|<script|<iframe/i.test(message)) {
			return "Server temporarily unavailable. Please try again.";
		}
		return message;
	}

	if (status >= 500) return "Server temporarily unavailable. Please try again.";
	if (status >= 400) return "Something went wrong";

	return "Something went wrong";
}