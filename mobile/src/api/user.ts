import { apiClient } from './client';
import { UserProfileResponse, UpdateProfilePayload } from '../types/api';

export const userApi = {
  async getProfile(): Promise<UserProfileResponse> {
    return apiClient<UserProfileResponse>('/api/user/profile', {
      method: 'GET',
    });
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfileResponse> {
    return apiClient<UserProfileResponse>('/api/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
