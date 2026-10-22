import { apiClient } from './client';
import { HealthResponse } from '../types/api';

export const healthApi = {
  async check(): Promise<HealthResponse> {
    return apiClient<HealthResponse>('/api/health', {
      method: 'GET',
    });
  },
};
