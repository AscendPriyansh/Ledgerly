import { apiClient } from './client';
import { AnalyticsResponse, SummaryResponse } from '../types/api';

export const summaryApi = {
  async get(): Promise<SummaryResponse> {
    return apiClient<SummaryResponse>('/api/summary', {
      method: 'GET',
    });
  },

  async getAnalytics(months: number = 6): Promise<AnalyticsResponse> {
    return apiClient<AnalyticsResponse>(`/api/summary/analytics?months=${months}`, {
      method: 'GET',
    });
  },
};
