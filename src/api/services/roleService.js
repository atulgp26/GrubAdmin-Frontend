import httpClient from "../httpClient";
import { API_ENDPOINTS } from "../config";

// Role API Service
export const roleService = {
	// Create a new role
	createRole: async (roleData) => {
		return httpClient.post(API_ENDPOINTS.ROLE.CREATE_ROLE, roleData);
	},

	// Get all roles (supports query params: query, hide_assigned)
	getRoles: async (params = {}) => {
		return httpClient.get(API_ENDPOINTS.ROLE.GET_ROLES, params);
	},

	// Update a role by ID
	updateRole: async (roleId, roleData) => {
		const url = `${API_ENDPOINTS.ROLE.UPDATE_ROLE}/${roleId}`;
		return httpClient.put(url, roleData);
	},

	// Delete a role by ID
	deleteRole: async (roleId) => {
		const url = `${API_ENDPOINTS.ROLE.DELETE_ROLE}/${roleId}`;
		console.log("deleteRole called:", { url, roleId });
		try {
			const resp = await httpClient.delete(url, { id: roleId });
			console.log("deleteRole response:", resp);
			return resp;
		} catch (e) {
			console.error("deleteRole error:", e);
			throw e;
		}
	},
};
