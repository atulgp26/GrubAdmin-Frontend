import httpClient from '../httpClient';
import { API_ENDPOINTS } from '../config';

// Account API Service
export const accountService = {
  // Get user profile
  getProfile: async () => {
    return httpClient.get(API_ENDPOINTS.ACCOUNT.GET_PROFILE);
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return httpClient.put(API_ENDPOINTS.ACCOUNT.UPDATE_PROFILE, profileData);
  },

  // Confirm OTP for profile update
  confirmOTP: async (otp) => {
    return httpClient.patch(API_ENDPOINTS.ACCOUNT.CONFIRM_OTP, { otp });
  },

  // Resend OTP for profile update
  resendOTP: async (mobileNumber, countryCode) => {
    return httpClient.patch(API_ENDPOINTS.ACCOUNT.RESEND_OTP, {
      mobile_number: mobileNumber,
      country_code: countryCode
    });
  },

  // Patch user profile (after OTP confirmation)
  patchProfile: async (profileData) => {
    return httpClient.patch(API_ENDPOINTS.ACCOUNT.PATCH_PROFILE, profileData);
  },

  // Check delete eligibility
  deleteEligibility: async () => {
    return httpClient.get(API_ENDPOINTS.ACCOUNT.DELETE_ELIGIBILITY);
  },

  // Delete user account
  deleteAccount: async () => {
    return httpClient.delete(API_ENDPOINTS.ACCOUNT.DELETE_ACCOUNT);
  },
};
