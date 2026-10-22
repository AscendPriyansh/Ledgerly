export type LoanStatus = 'OUTSTANDING' | 'REPAID';

export interface User {
  id: string;
  phone: string;
  name?: string | null;
  avatarUrl?: string | null;
  email?: string | null;
  bio?: string | null;
  totalLoans?: number;
  createdAt?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  avatarUrl?: string | null;
  email?: string | null;
  phone?: string;
  bio?: string | null;
}

export interface UserProfileResponse {
  user: User;
  message?: string;
}

export interface RequestOtpPayload {
  phone: string;
}

export interface RequestOtpResponse {
  message: string;
  expiresInSeconds: number;
  mockOtp?: string;
  otp?: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface VerifyOtpResponse {
  token: string;
  user: User;
}

export interface Repayment {
  id: string;
  amount: string;
  repaidAt: string;
}

export interface Loan {
  id: string;
  friendName: string;
  amount: string;
  repaidAmount: string;
  outstandingAmount: string;
  dueDate: string;
  status: LoanStatus;
  isOverdue: boolean;
  note?: string;
  repayments?: Repayment[];
  createdAt: string;
}

export interface LoansListResponse {
  loans: Loan[];
}

export interface SingleLoanResponse {
  loan: Loan;
}

export interface CreateLoanPayload {
  friendName: string;
  amount: number;
  dueDate: string;
  note?: string;
}

export interface CreateLoanResponse {
  loan: Loan;
}

export interface RepayLoanResponse {
  message: string;
  loanId: string;
  repaidAmount: string;
  status: 'REPAID';
}

export interface SummaryResponse {
  totalLent: string;
  totalRepaid: string;
  overdueAmount: string;
  outstandingAmount: string;
  loanCount: number;
}

export interface MonthlyBarData {
  month: string;
  label: string;
  lent: string;
  repaid: string;
}

export interface AnalyticsResponse {
  rangeMonths: number;
  portfolio: {
    totalLent: string;
    totalRepaid: string;
    outstandingTotal: string;
    outstandingNormal: string;
    outstandingOverdue: string;
    loanCount: number;
  };
  monthlySeries: MonthlyBarData[];
  insights: {
    overdueCount: number;
    overdueAmount: string;
    dueSoonCount: number;
    dueSoonAmount: string;
    largestOutstanding: {
      id: string;
      friendName: string;
      amount: string;
      outstandingAmount: string;
      dueDate: string;
    } | null;
    overdueLoans: Array<{
      id: string;
      friendName: string;
      amount: string;
      outstandingAmount: string;
      dueDate: string;
      daysOverdue: number;
    }>;
    upcomingLoans: Array<{
      id: string;
      friendName: string;
      amount: string;
      outstandingAmount: string;
      dueDate: string;
      daysUntilDue: number;
    }>;
  };
  recentActivity: Array<{
    id: string;
    type: 'LOAN_CREATED' | 'LOAN_REPAID';
    friendName: string;
    amount: string;
    date: string;
    loanId: string;
  }>;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: Array<{
    path: string;
    message: string;
  }>;
}
