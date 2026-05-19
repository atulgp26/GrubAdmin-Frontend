import httpClient from "@/api/httpClient";
import { API_ENDPOINTS } from "@/api/config";

export const logsService = {
	getLogs: (params) => {
		return httpClient.get(API_ENDPOINTS.LOGS.GET_LOGS, params ?? {});
	},
};
