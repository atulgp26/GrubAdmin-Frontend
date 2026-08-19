export const DEBOUNCE_TIME = 200;

export const DEFAULT_PAGE_SIZE = 100;
export const DEFAULT_PAGE_NUMBER = 1;



export const CAMPING_VERTICAL_NAME = "camping";

export const GRUBPAC_GROUP_BY_ASSIGNED_GROUPS = [
	{
		name: "Assigned",
		// value: "assigned",
	},
	{
		name: "Unassigned",
		value: "unassigned",
	},
];

export const GRUBPAC_DEFAULT_ASSIGNMENT_STATE = "assigned";

// Optional dev-only login defaults — set via NEXT_PUBLIC_SEED_EMAIL / NEXT_PUBLIC_SEED_PASSWORD in .env.local.
// Leave unset in production builds so credentials are not baked into the client bundle.
export const SEED_EMAIL = process.env.NEXT_PUBLIC_SEED_EMAIL?.trim() ?? "";
export const SEED_PASSWORD = process.env.NEXT_PUBLIC_SEED_PASSWORD ?? "";

export const MODULE = {
	employee: "Employee - List",
	role: "Employee - Roles",
	client: "Clients - List",
	support_categories: "Support - Categories",
	FAQ: "Support - FAQs",
	grubpac: "GrubPac - List",
};

export const LOGS_GRAMMAR = {
	create: "created",
	update: "updated",
	delete: "deleted",
	export: "exported",
	assignment: "assigned",
	suspend: "suspended",
	activate: "activated",
	"re-order": "re-ordered",
	transfer: "transferred",
};
