import httpClient from '../httpClient';
import { API_ENDPOINTS, API_BASE_URL } from '../config';
import { getHeaders } from '../utils';
import { clearAuthCookie } from '@/utils/cookies';

// Employee API Service
export const employeeService = {
  // Create a new employee/admin
  createAdmin: async (employeeData) => {
    return httpClient.post(API_ENDPOINTS.EMPLOYEE.CREATE_ADMIN, employeeData);
  },

  // Update an employee/admin
  updateAdmin: async (employeeData) => {
    return httpClient.put(API_ENDPOINTS.EMPLOYEE.UPDATE_ADMIN, employeeData);
  },

  // Get all employees/admins (supports query params for filtering)
  getAdmins: async (params = {}) => {
    return httpClient.get(API_ENDPOINTS.EMPLOYEE.GET_ADMINS, params);
  },

  // Bulk assign role to multiple employees/admins
  bulkAssignRole: async (roleId, adminIds) => {
    return httpClient.patch(API_ENDPOINTS.EMPLOYEE.BULK_ASSIGN_ROLE, {
      role: roleId,
      admins: adminIds,
    });
  },

  // Suspend employees/admins
  suspendAdmin: async (adminIds) => {
    console.log("suspendAdmin called with:", adminIds);
    console.log("Using endpoint:", API_ENDPOINTS.EMPLOYEE.SUSPEND_ADMIN);
    const result = await httpClient.patch(API_ENDPOINTS.EMPLOYEE.SUSPEND_ADMIN, {
      admins: adminIds,
    });
    console.log("suspendAdmin result:", result);
    return result;
  },

  // Reactivate employees/admins
  reactivateAdmin: async (adminIds) => {
    return httpClient.patch(API_ENDPOINTS.EMPLOYEE.REACTIVATE_ADMIN, {
      admins: adminIds,
    });
  },

  // Delete employees/admins
  deleteAdmins: async ({ adminIds = [], params = {} } = {}) => {
    // If IDs provided, send as JSON body
    if (Array.isArray(adminIds) && adminIds.length > 0) {
      return httpClient.delete(API_ENDPOINTS.EMPLOYEE.GET_ADMINS, {
        admins: adminIds,
      });
    }
    // Otherwise allow query param style deletion (e.g. email/status)
    const qs = new URLSearchParams(params).toString();
    const url = qs
      ? `${API_ENDPOINTS.EMPLOYEE.GET_ADMINS}?${qs}`
      : API_ENDPOINTS.EMPLOYEE.GET_ADMINS;
    return httpClient.delete(url);
  },

  // Export employees/admins - returns blob for file download
  exportAdmins: async (params = {}) => {
    // Build query string manually to handle arrays and booleans correctly
    const queryParts = [];
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') continue;
      if (Array.isArray(value)) {
        // Repeat the key for each value (role=a&role=b)
        value.forEach((v) => {
          if (v !== undefined && v !== null && v !== '') {
            queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
          }
        });
        continue;
      }
      if (typeof value === 'boolean') {
        queryParts.push(`${encodeURIComponent(key)}=${value}`);
      } else {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
    const queryString = queryParts.length > 0 ? queryParts.join('&') : '';
    const fullUrl = `${API_BASE_URL}${API_ENDPOINTS.EMPLOYEE.EXPORT_ADMINS}${queryString ? '?' + queryString : ''}`;
    
    console.log("Export Admins API URL:", fullUrl);
    console.log("Export Admins params:", params);
    console.log("Export Admins query string:", queryString);
    
    // Fetch response
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    console.log("Export Admins API response status:", response.status);
    const contentType = response.headers.get('content-type') || '';
    const contentDisposition = response.headers.get('content-disposition') || '';
    
    console.log("Content-Type:", contentType);
    console.log("Content-Disposition:", contentDisposition);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      clearAuthCookie();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }
    
    // Clone response for error checking
    const responseClone = response.clone();
    
    // Always read as text first (CSV is text format)
    const text = await response.text();
    console.log("Export Admins text response length:", text.length);
    console.log("Export Admins text preview:", text.substring(0, 500));
    console.log("Export Admins full response text:", text);
    
    // If response is not OK, try to parse error message
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        if (contentType.includes('application/json')) {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error("Export Admins API error:", errorData);
        } else {
          console.error("Export Admins API error text:", text);
          errorMessage = text || errorMessage;
        }
      } catch (e) {
        console.error("Error parsing error response:", e);
      }
      throw new Error(errorMessage);
    }
    
    // Check if response is actually valid CSV or if it's an error
    if (!text || text.trim().length === 0 || text.trim() === '1' || text.trim() === '2') {
      console.error("Export Admins: Invalid or empty response received:", text);
      throw new Error("Export failed: Received invalid response from server. Please try again.");
    }
    
    // Check if response is JSON error (should not happen for successful export)
    if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
      try {
        const jsonData = JSON.parse(text);
        if (jsonData.error || jsonData.message) {
          console.error("Export Admins API JSON error:", jsonData);
          throw new Error(jsonData.message || jsonData.error || "Failed to export. Received error response.");
        }
      } catch (parseError) {
        // Not JSON, continue as CSV
      }
    }
    
    // Create CSV blob with proper MIME type
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
    console.log("Export Admins blob created - size:", blob.size, "bytes, type:", blob.type);
    
    // Check if blob is empty
    if (blob.size === 0) {
      throw new Error("Export file is empty. Please check your filters and try again.");
    }
    
    // Extract filename from Content-Disposition or use default
    const filename = extractFilenameFromDisposition(contentDisposition) || `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
    
    console.log("Export Admins filename:", filename);
    
    // Return blob with metadata
    return {
      blob,
      filename,
      contentType: 'text/csv',
    };
  },
};

// Helper function to extract filename from Content-Disposition header
function extractFilenameFromDisposition(disposition) {
  if (!disposition) return null;
  const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  if (filenameMatch && filenameMatch[1]) {
    return filenameMatch[1].replace(/['"]/g, '').trim();
  }
  return null;
}

