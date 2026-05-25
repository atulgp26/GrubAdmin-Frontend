import httpClient from "@/api/httpClient";
import { API_ENDPOINTS } from "@/api/config";

export const logsService = {
  getLogs: (params) => {
    return httpClient.get(API_ENDPOINTS.LOGS.GET_LOGS, params ?? {});
  },

  // Fetch logs for a specific admin/employee
  getEmployeeLogs: (adminId, params = {}) => {
    return httpClient.get(API_ENDPOINTS.LOGS.GET_LOGS, {
      ...params,
      admin_id: adminId,
    });
  },

  // Fetch logs for a dismissed employee using their original admin ID.
  // Searches both as actor and subject to capture all related log entries.
  getEmployeeLogsByOriginalId: (originalAdminId, params = {}) => {
    return httpClient.get(API_ENDPOINTS.LOGS.GET_LOGS, {
      ...params,
      admin_id: originalAdminId,
      subject_id: originalAdminId,
    });
  },

  // Fetch logs for a specific client by their client_id
  getClientLogs: (clientId, params = {}) => {
    return httpClient.get(API_ENDPOINTS.LOGS.GET_LOGS, {
      ...params,
      client_id: clientId,
    });
  },
};