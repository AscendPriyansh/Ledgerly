import { apiClient } from './client';
import {
  RequestOtpPayload,
  RequestOtpResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from '../types/api';

export const authApi = {
  async requestOtp(phone: string): Promise<RequestOtpResponse> {
    return apiClient<RequestOtpResponse>('/api/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phone } as RequestOtpPayload),
    });
  },

  async verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse> {
    return apiClient<VerifyOtpResponse>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp } as VerifyOtpPayload),
    });
  },
};
