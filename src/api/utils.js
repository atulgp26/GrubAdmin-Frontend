/**
 * Authentication utilities.
 *
 * The backend sets auth via an HttpOnly `auth_token` cookie that is
 * automatically sent with every credentialed request.  Because the
 * frontend (localhost:3000) and backend (localhost:8000) are cross-origin
 * in development, SameSite=Lax cookies may not be sent with fetch()
 * calls.  As a fallback, the login/verify-otp handlers also return the
 * JWT in the response body, which we store in-memory here and use as
 * an Authorization: Bearer header.  The backend's authGuard middleware
 * checks the cookie first, then falls back to the Authorization header.
 */

// In-memory token store (set after login/OTP-verify, survives page navigation
// via AuthContext, cleared on logout)
let _inMemoryToken = null;

/** Store the JWT for use in Authorization headers. */
export const setToken = (token) => {
  _inMemoryToken = token;
};

/** Clear the stored JWT. */
export const clearToken = () => {
  _inMemoryToken = null;
};

// Attempt to read a token from the JS-accessible `auth` cookie.
// This is a best-effort helper; the canonical auth is the HttpOnly cookie.
function readTokenFromClientCookie() {
  if (typeof window === 'undefined') return null;
  try {
    const authCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth='));
    if (!authCookie) return null;
    const authData = JSON.parse(decodeURIComponent(authCookie.split('=')[1]));
    return authData.authToken || null;
  } catch {
    return null;
  }
}

export const getToken = () => {
  // In-memory token (set after login/OTP-verify) takes precedence.
  if (_inMemoryToken) return _inMemoryToken;
  // Fallback to client-side cookie.
  return readTokenFromClientCookie();
};

// Get headers for API requests.
// Authorization header is only set when we have a client-side token.
// The canonical auth_token cookie is sent automatically via credentials: "include".
export const getHeaders = () => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};
