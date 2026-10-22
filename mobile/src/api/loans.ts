import { apiClient } from './client';
import {
  CreateLoanPayload,
  CreateLoanResponse,
  LoansListResponse,
  SingleLoanResponse,
  RepayLoanResponse,
} from '../types/api';

export const loansApi = {
  async list(): Promise<LoansListResponse> {
    return apiClient<LoansListResponse>('/api/loans', {
      method: 'GET',
    });
  },

  async get(id: string): Promise<SingleLoanResponse> {
    return apiClient<SingleLoanResponse>(`/api/loans/${id}`, {
      method: 'GET',
    });
  },

  async create(payload: CreateLoanPayload): Promise<CreateLoanResponse> {
    return apiClient<CreateLoanResponse>('/api/loans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async repay(loanId: string): Promise<RepayLoanResponse> {
    return apiClient<RepayLoanResponse>(`/api/loans/${loanId}/repay`, {
      method: 'PATCH',
    });
  },
};
