import { makeRequest } from "./request";
import { getHeaders } from "./utils";

// Build query string with support for array values as repeated keys (e.g., ?role=a&role=b)
// and JSON-serialized objects (e.g., ?filters=[{"category":"Employee","types":["Creation"]}])
function buildQueryString(params = {}) {
	const search = new URLSearchParams();
	Object.entries(params || {}).forEach(([key, value]) => {
		if (value === undefined || value === null) return;
		if (Array.isArray(value)) {
			// If array contains objects, JSON-serialize the whole thing
			if (value.length > 0 && typeof value[0] === "object") {
				search.append(key, JSON.stringify(value));
			} else {
				value.forEach((v) => {
					if (v !== undefined && v !== null)
						search.append(key, String(v));
				});
			}
		} else if (typeof value === "object") {
			search.append(key, JSON.stringify(value));
		} else {
			search.append(key, String(value));
		}
	});
	const qs = search.toString();
	return qs ? `?${qs}` : "";
}

const httpClient = {
	// GET request
	async get(
		url,
		params = {},
		config = {
			returnRaw: false,
		},
	) {
		console.log(params);
		const fullUrl = `${url}${buildQueryString(params)}`;
		return makeRequest(fullUrl, { method: "GET" }, config);
	},

	// GET request with body
	async getWithBody(url, data = {}) {
		return makeRequest(url, {
			method: "GET",
			headers: getHeaders(),
			body: JSON.stringify(data),
		});
	},

	// POST request
	async post(url, data = {}) {
		return makeRequest(url, {
			method: "POST",
			body: data instanceof FormData ? data : JSON.stringify(data),
		});
	},

	// PUT request
	async put(url, data = {}) {
		return makeRequest(url, {
			method: "PUT",
			body: data instanceof FormData ? data : JSON.stringify(data),
		});
	},

	// DELETE request (supports JSON body)
	async delete(url, data = {}) {
		return makeRequest(url, {
			method: "DELETE",
			headers: getHeaders(),
			body: Object.keys(data || {}).length
				? JSON.stringify(data)
				: undefined,
		});
	},

	// PATCH request
	async patch(url, data = {}) {
		return makeRequest(url, {
			method: "PATCH",
			body: data instanceof FormData ? data : JSON.stringify(data),
		});
	},
};

export default httpClient;
