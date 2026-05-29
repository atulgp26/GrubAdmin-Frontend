export const API_CONFIG = {
	BASE_URL:
		process.env.NEXT_PUBLIC_API_BASE_URL ||
		"http://43.204.34.10:8000/api/v1",
};

// API Endpoints
export const API_ENDPOINTS = {
	// Authentication
	AUTH: {
		LOGIN: "/admin/auth/login",
		LOGOUT: "/admin/auth/logout",
		SEND_OTP: "/admin/auth/send-otp",
		RESEND_OTP: "/admin/auth/resend-otp",
		VERIFY_OTP: "/admin/auth/verify-otp",
		VERIFY_AUTHENTICATED: "/admin/auth/verify-authenticated",
		FORGOT_PASSWORD_SEND_OTP: "/admin/auth/reset-password/otp/send",
		FORGOT_PASSWORD_RESEND_OTP: "/admin/auth/reset-password/otp/resend",
		FORGOT_PASSWORD_VERIFY_OTP: "/admin/auth/reset-password/otp/verify",
		FORGOT_PASSWORD_CONFIRM: "/admin/auth/reset-password/confirm",
	},

	// Account
	ACCOUNT: {
		GET_PROFILE: "/admin/account/me",
		UPDATE_PROFILE: "/admin/account/update",
		CONFIRM_OTP: "/admin/account/confirm",
		RESEND_OTP: "/admin/account/update/resend-otp",
		PATCH_PROFILE: "/admin/account",
		DELETE_ELIGIBILITY: "/admin/account/delete-eligibility",
		DELETE_ACCOUNT: "/admin/account/delete",
	},

	// Customer
	CUSTOMER: {
		GET_VERTICALS: "/admin/vertical",
		GET_CUSTOMERS: "/admin/customer",
		CREATE_CUSTOMER: "/admin/customer",
		EXPORT_CUSTOMERS: "/admin/customer/export",
	},

	// Common
	COMMON: {
		GET_CONFIG: "/common/config",
		GET_ICONS: "/common/icons",
		GET_PERMISSIONS: "/common/permissions",
	},

	// Support/FAQ
	FAQ: {
		CREATE_CATEGORY: "/admin/faq-category",
		GET_CATEGORIES: "/admin/faq-category",
		REORDER_CATEGORIES: "/admin/faq-category/reorder",
		EXPORT_FAQS: "/admin/faq/export",
		EXPORT_CATEGORIES: "/admin/faq-category/export",
		SUSPEND_CATEGORY: "/admin/faq-category/suspend",
		REACTIVATE_CATEGORY: "/admin/faq-category/reactivate",
		DELETE_CATEGORY: "/admin/faq-category",
		CREATE_FAQ: "/admin/faq",
		GET_FAQS: "/admin/faq",
		UPDATE_FAQ: "/admin/faq",
		DELETE_FAQ: "/admin/faq",
		TOGGLE_STATUS: "/admin/faq/status/toggle",
		CHANGE_CATEGORY_BULK: "/admin/faq/change-category/bulk",
	},

	// Roles
	ROLE: {
		CREATE_ROLE: "/admin/role",
		GET_ROLES: "/admin/role",
		UPDATE_ROLE: "/admin/role",
		DELETE_ROLE: "/admin/role",
	},

	// Employee/Admin
	EMPLOYEE: {
		CREATE_ADMIN: "/admin/admin",
		GET_ADMINS: "/admin/admin",
		UPDATE_ADMIN: "/admin/admin",
		EXPORT_ADMINS: "/admin/admin/export",
		BULK_ASSIGN_ROLE: "/admin/admin/assign-role/bulk",
		SUSPEND_ADMIN: "/admin/admin/suspend",
		REACTIVATE_ADMIN: "/admin/admin/reactivate",
	},

	// Grubpac/Boxes
	GRUBPAC: {
		CREATE_BOX: "/admin/box",
		GET_BOX: "/admin/box",
		UPDATE_BOX: "/admin/box",
		DELETE_BOX: "/admin/box",
		ASSIGN_BOXES: "/admin/box/assign",
		UNASSIGN_BOXES: "/admin/box/assign/remove",
	},

	// Grubpac/Logs
	LOGS: {
		GET_LOGS: "/admin/logs",
	},

	// Notifications
	NOTIFICATION: {
		GET_NOTIFICATION: "/admin/notifications",
		MARK_AS_READ: "/admin/notifications",
	},
};

export const API_BASE_URL = API_CONFIG.BASE_URL;
