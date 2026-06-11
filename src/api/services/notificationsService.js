import http from "@/api/httpClient";
import { API_ENDPOINTS } from "@/api/config";

export const notificationsService = {
	getNotifications: (params) => {
		return http.get(API_ENDPOINTS.NOTIFICATION.GET_NOTIFICATION, params);
	},
	markAsRead: (ids) => {
		return http.patch(API_ENDPOINTS.NOTIFICATION.MARK_AS_READ, { ids });
	},
};
