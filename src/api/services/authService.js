import httpClient from '../httpClient';
import { API_ENDPOINTS } from '../config';

// Authentication API Service
export const authService = {
  // Login with email/password
  login: async (credentials) => {
    return httpClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  // Logout user
  logout: async () => {
    return httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  // Send OTP
  sendOtp: async (email) => {
    const payloadEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    return httpClient.post(API_ENDPOINTS.AUTH.SEND_OTP, { email: payloadEmail });
  },

  // Resend OTP
  resendOtp: async (email) => {
    const payloadEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    return httpClient.post(API_ENDPOINTS.AUTH.RESEND_OTP, { email: payloadEmail });
  },

  // Verify OTP
  verifyOtp: async (otpData) => {
    const payloadEmail = typeof otpData?.email === 'string' ? otpData.email.trim().toLowerCase() : '';
    return httpClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, {
      ...otpData,
      email: payloadEmail,
    });
  },

  // Verify if user is authenticated
  verifyAuthenticated: async () => {
    return httpClient.get(API_ENDPOINTS.AUTH.VERIFY_AUTHENTICATED);
  },

  // Forgot Password - Send OTP
  forgotPasswordSendOtp: async (email) => {
    const payloadEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    return httpClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_SEND_OTP, { email: payloadEmail });
  },

  // Forgot Password - Resend OTP
  forgotPasswordResendOtp: async (email) => {
    const payloadEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    return httpClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_RESEND_OTP, { email: payloadEmail });
  },

  // Forgot Password - Verify OTP
  forgotPasswordVerifyOtp: async (otpData) => {
    const payloadEmail = typeof otpData?.email === 'string' ? otpData.email.trim().toLowerCase() : '';
    return httpClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_VERIFY_OTP, {
      ...otpData,
      email: payloadEmail,
    });
  },

  // Forgot Password - Confirm Reset
  forgotPasswordConfirm: async (data) => {
    const payloadEmail = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : '';
    const payloadOtp = typeof data?.otp === 'string' ? data.otp.trim() : String(data?.otp || '').trim();
    const payload = {
      email: payloadEmail,
      otp: payloadOtp,
      password: data?.password || '',
    };
    return httpClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_CONFIRM, payload);
  },
};
