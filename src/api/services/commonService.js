import httpClient from '../httpClient';
import { API_ENDPOINTS } from '../config';

// Common API Service
export const commonService = {
  // Get config values (e.g., icon_base_url)
  getConfig: async () => {
    return httpClient.get(API_ENDPOINTS.COMMON.GET_CONFIG);
  },

  // Get icons list
  getIcons: async () => {
    return httpClient.get(API_ENDPOINTS.COMMON.GET_ICONS);
  },

  // Get permissions list
  getPermissions: async () => {
    return httpClient.get(API_ENDPOINTS.COMMON.GET_PERMISSIONS);
  },
};


