import httpClient from '../httpClient';
import { API_ENDPOINTS, API_BASE_URL } from '../config';
import { getHeaders } from '../utils';
import { clearAuthCookie } from '@/utils/cookies';

// FAQ / Support related service
export const faqService = {
  // Create FAQ Category
  createCategory: async (data) => {
    return httpClient.post(API_ENDPOINTS.FAQ.CREATE_CATEGORY, data);
  },

  // Update FAQ Category
  updateCategory: async (data) => {
    // API expects PUT to the same endpoint with body containing id, name, icon, vertical
    return httpClient.put(API_ENDPOINTS.FAQ.CREATE_CATEGORY, data);
  },

  // Delete FAQ Categories (bulk)
  deleteCategories: async (ids = []) => {
    // Backend commonly accepts either `categories` or `category_ids`
    return httpClient.delete(API_ENDPOINTS.FAQ.DELETE_CATEGORY || API_ENDPOINTS.FAQ.CREATE_CATEGORY, {
      categories: ids,
      category_ids: ids,
    });
  },

  // Get FAQ Categories (supports query params)
  getCategories: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const url = qs ? `${API_ENDPOINTS.FAQ.GET_CATEGORIES}?${qs}` : API_ENDPOINTS.FAQ.GET_CATEGORIES;
    return httpClient.get(url);
  },

  // Create FAQ
  createFaq: async (data) => {
    return httpClient.post(API_ENDPOINTS.FAQ.CREATE_FAQ, data);
  },

  // List FAQs by category (supports optional publishing_status filter)
  getFaqsByCategory: async (categoryId, publishingStatus = null) => {
    const params = new URLSearchParams();
    params.append('category_id', categoryId);
    if (publishingStatus && publishingStatus !== 'All FAQs') {
      // Map UI values to API values
      const statusMap = {
        'Draft FAQs': 'draft',
        'Published FAQs': 'published'
      };
      params.append('publishing_status', statusMap[publishingStatus] || publishingStatus);
    }
    const url = `${API_ENDPOINTS.FAQ.GET_FAQS}?${params.toString()}`;
    return httpClient.get(url);
  },

  // Suspend FAQ categories (bulk)
  suspendCategories: async (ids = []) => {
    // Send both keys to be safe with backend naming
    return httpClient.patch(API_ENDPOINTS.FAQ.SUSPEND_CATEGORY, {
      categories: ids,
      category_ids: ids,
    });
  },

  // Reactivate FAQ categories (bulk)
  reactivateCategories: async (ids = []) => {
    return httpClient.patch(API_ENDPOINTS.FAQ.REACTIVATE_CATEGORY, {
      categories: ids,
      category_ids: ids,
    });
  },

  // Reorder FAQ categories
  // Accepts:
  // - Array of ids: [id1, id2, ...]
  // - Array of objects: [{ id, display_order }, ...]
  // - Object map: { id: order, ... }
  // Sends: { order: { id: indexStartingAt1 } }
  reorderCategories: async (reorderedData, queryParams = {}) => {
    let orderMap = {};

    if (Array.isArray(reorderedData)) {
      if (reorderedData.length > 0 && typeof reorderedData[0] === 'object') {
        // [{ id, display_order }]
        reorderedData.forEach((item) => {
          if (!item) return;
          const id = item.id || item.category_id || item.categoryId;
          const order = Number(item.display_order || item.order || item.index);
          if (id) orderMap[id] = order > 0 ? order : undefined;
        });
      } else {
        // [id1, id2, ...]
        reorderedData.forEach((id, idx) => {
          if (id) orderMap[id] = idx + 1; // start from 1 as per API
        });
      }
    } else if (reorderedData && typeof reorderedData === 'object') {
      orderMap = { ...reorderedData };
    }

    // Remove undefined entries
    Object.keys(orderMap).forEach((k) => {
      if (orderMap[k] === undefined || orderMap[k] === null) {
        delete orderMap[k];
      }
    });

    const qs = new URLSearchParams(queryParams).toString();
    const url = qs
      ? `${API_ENDPOINTS.FAQ.REORDER_CATEGORIES}?${qs}`
      : API_ENDPOINTS.FAQ.REORDER_CATEGORIES;

    return httpClient.patch(url, { order: orderMap });
  },

  // Update FAQ by ID
  updateFaq: async (faqId, data) => {
    const url = `${API_ENDPOINTS.FAQ.UPDATE_FAQ}/${faqId}`;
    return httpClient.put(url, data);
  },

  // Delete FAQs by ids
  deleteFaqs: async (ids) => {
    return httpClient.delete(API_ENDPOINTS.FAQ.DELETE_FAQ, { ids });
  },

  // Toggle FAQ publishing status (bulk update)
  toggleFaqStatus: async (ids, publishingStatus) => {
    return httpClient.patch(API_ENDPOINTS.FAQ.TOGGLE_STATUS, {
      ids,
      publishing_status: publishingStatus,
    });
  },

  // Change category for FAQs (bulk)
  changeFaqCategoryBulk: async (ids = [], oldCategoryId, newCategoryId) => {
    // API expects: { ids: [...], old_category: 'id', new_category: 'id' }
    return httpClient.patch(API_ENDPOINTS.FAQ.CHANGE_CATEGORY_BULK, {
      ids,
      old_category: oldCategoryId,
      new_category: newCategoryId,
    });
  },

  // Export FAQs and categories - returns blob for file download
  exportFaqs: async (params = {}) => {
    // Build query string with params: query, include_questions, category_state
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${API_BASE_URL}${API_ENDPOINTS.FAQ.EXPORT_FAQS}${queryString ? '?' + queryString : ''}`;
    
    console.log("Export FAQs API URL:", fullUrl);
    console.log("Export FAQs params:", params);
    
    // Fetch response
    const response = await fetch(fullUrl, {
      method: 'GET',
      credentials: 'include',
      headers: getHeaders(),
    });
    
    console.log("Export FAQs API response status:", response.status);
    const contentType = response.headers.get('content-type') || '';
    const contentDisposition = response.headers.get('content-disposition') || '';
    
    console.log("Content-Type:", contentType);
    console.log("Content-Disposition:", contentDisposition);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      clearAuthCookie();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }
    
    // If response is not OK, try to parse error message
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const text = await response.clone().text();
        if (contentType.includes('application/json')) {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error("Export FAQs API error:", errorData);
        } else {
          console.error("Export FAQs API error text:", text);
          errorMessage = text || errorMessage;
        }
      } catch (e) {
        console.error("Error parsing error response:", e);
      }
      throw new Error(errorMessage);
    }
    
    // Always read as text first (CSV is text format)
    const text = await response.text();
    console.log("Export FAQs text response length:", text.length);
    console.log("Export FAQs text preview:", text.substring(0, 200));
    
    // Check if response is JSON error (should not happen for successful export)
    if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
      try {
        const jsonData = JSON.parse(text);
        if (jsonData.error || jsonData.message) {
          console.error("Export FAQs API JSON error:", jsonData);
          throw new Error(jsonData.message || jsonData.error || "Failed to export. Received error response.");
        }
      } catch (parseError) {
        // Not JSON, continue as CSV
      }
    }
    
    // Create CSV blob with proper MIME type
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
    console.log("Export FAQs blob created - size:", blob.size, "bytes, type:", blob.type);
    
    // Check if blob is empty
    if (blob.size === 0) {
      throw new Error("Export file is empty. Please check your filters and try again.");
    }
    
    // Extract filename from Content-Disposition or use default
    const filename = extractFilenameFromDisposition(contentDisposition) || `faqs_export_${new Date().toISOString().split('T')[0]}.csv`;
    
    console.log("Export FAQs filename:", filename);
    
    // Return blob with metadata
    return {
      blob,
      filename,
      contentType: 'text/csv',
    };
  },
  
  // Export Categories - returns blob (uses /admin/faq-category/export)
  exportCategories: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${API_BASE_URL}${API_ENDPOINTS.FAQ.EXPORT_CATEGORIES}${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      credentials: 'include',
      headers: getHeaders(),
    });
    
    if (response.status === 401) {
      clearAuthCookie();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }
    if (!response.ok) {
      let msg = `HTTP ${response.status}`;
      try {
        const t = await response.clone().text();
        try { const j = JSON.parse(t); msg = j.message || j.error || msg; } catch (_) { msg = t || msg; }
      } catch (_) {}
      throw new Error(msg);
    }
    const text = await response.text();
    if (!text || text.trim().length === 0) throw new Error('Export file is empty.');
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
    const contentDisposition = response.headers.get('content-disposition') || '';
    const filename = extractFilenameFromDisposition(contentDisposition) || `categories_export_${new Date().toISOString().split('T')[0]}.csv`;
    return { blob, filename, contentType: 'text/csv' };
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


