import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { loansApi } from '../api/loans';
import { summaryApi } from '../api/summary';
import { healthApi } from '../api/health';
import { userApi } from '../api/user';
import { CreateLoanPayload, Loan, SummaryResponse, AnalyticsResponse, UpdateProfilePayload, UserProfileResponse } from '../types/api';

export const QUERY_KEYS = {
  summary: ['summary'] as const,
  analytics: (months: number) => ['analytics', months] as const,
  loans: ['loans'] as const,
  loanDetail: (id: string) => ['loan', id] as const,
  profile: ['profile'] as const,
  health: ['health'] as const,
};

export function useSummaryQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.summary,
    queryFn: () => summaryApi.get(),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAnalyticsQuery(months: number = 6) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics(months),
    queryFn: () => summaryApi.getAnalytics(months),
    staleTime: 1000 * 30,
  });
}

export function useLoansQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.loans,
    queryFn: () => loansApi.list(),
    staleTime: 1000 * 30,
  });
}

export function useLoanDetail(loanId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.loanDetail(loanId || ''),
    queryFn: async () => {
      if (!loanId) throw new Error('No loan ID');
      const res = await loansApi.get(loanId);
      return res.loan;
    },
    enabled: !!loanId,
    staleTime: 1000 * 30,
    initialData: () => {
      // Find from cached loans list if available
      const listData = queryClient.getQueryData<{ loans: Loan[] }>(QUERY_KEYS.loans);
      return listData?.loans.find((l) => l.id === loanId);
    },
  });

  return {
    loan: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    notFound: !query.isLoading && !query.data && !!query.error,
  };
}

export function useHealthQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.health,
    queryFn: () => healthApi.check(),
    retry: 1,
  });
}

export function useCreateLoanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLoanPayload) => loansApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loans });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.summary });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      if (data?.loan?.id) {
        queryClient.setQueryData(QUERY_KEYS.loanDetail(data.loan.id), data.loan);
      }
    },
  });
}

export function useRepayLoanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loanId: string) => loansApi.repay(loanId),
    onSuccess: (_, loanId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loans });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.summary });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loanDetail(loanId) });
    },
  });
}

export function useProfileQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: async () => {
      const res = await userApi.getProfile();
      return res.user;
    },
    staleTime: 1000 * 60,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload): Promise<UserProfileResponse> =>
      userApi.updateProfile(payload),
    onSuccess: (data: UserProfileResponse) => {
      queryClient.setQueryData(QUERY_KEYS.profile, data.user);
    },
  });
}
