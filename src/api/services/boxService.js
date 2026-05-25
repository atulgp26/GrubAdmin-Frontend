import httpClient from "@/api/httpClient";
import { API_ENDPOINTS } from "@/api/config";

export const boxService = {
	createBox: (boxCreationData) => {
		return httpClient.post(
			API_ENDPOINTS.GRUBPAC.CREATE_BOX,
			boxCreationData,
		);
	},

	updateBox: async (boxId, boxUpdationData) => {
		if (!boxId) {
			throw new Error("Box id is required");
		}

		return httpClient.put(
			`${API_ENDPOINTS.GRUBPAC.UPDATE_BOX}/${boxId}`,
			boxUpdationData,
		);
	},

	assignBoxes: async (data) => {
		return httpClient.patch(API_ENDPOINTS.GRUBPAC.ASSIGN_BOXES, data);
	},

	unassignBoxes: async (data) => {
		return httpClient.patch(API_ENDPOINTS.GRUBPAC.UNASSIGN_BOXES, data);
	},

	getBoxes: async (params) => {
		return httpClient.get(API_ENDPOINTS.GRUBPAC.GET_BOX, params ?? {});
	},

	deleteBoxes: async (params) => {
		const payload = Array.isArray(params) ? { box_ids: params } : params;
		return httpClient.delete(API_ENDPOINTS.GRUBPAC.DELETE_BOX, payload);
	},
};
