import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  ArrowRight,
  Wallet,
  AlertTriangle,
  CalendarClock,
  TrendingUp,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native';
import { Screen } from '../../../src/components/Screen';
import { SummaryCard } from '../../../src/components/SummaryCard';
import { LoanCard } from '../../../src/components/LoanCard';
import { EmptyState } from '../../../src/components/EmptyState';
import { ErrorState } from '../../../src/components/ErrorState';
import { Skeleton, LoanCardSkeleton } from '../../../src/components/LoadingSkeleton';
import { MiniLedgerLogo } from '../../../src/components/MiniLedgerLogo';
import { PortfolioDonutChart } from '../../../src/components/PortfolioDonutChart';
import { MonthlyTrendsBarChart } from '../../../src/components/MonthlyTrendsBarChart';
import { Colors, Radii, Spacing, Typography } from '../../../src/constants/theme';
import { useSummaryQuery, useLoansQuery, useAnalyticsQuery } from '../../../src/hooks/useQueries';
import { useAuth } from '../../../src/features/auth/AuthContext';
import { formatDate, formatINR } from '../../../src/lib/formatters';
import { useTheme } from '../../../src/context/ThemeContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [monthsRange, setMonthsRange] = useState<number>(6);

  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
    isRefetching: isSummaryRefetching,
  } = useSummaryQuery();

  const {
    data: loansData,
    isLoading: isLoansLoading,
    error: loansError,
    refetch: refetchLoans,
    isRefetching: isLoansRefetching,
  } = useLoansQuery();

  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
    isRefetching: isAnalyticsRefetching,
  } = useAnalyticsQuery(monthsRange);

  const isRefreshing = isSummaryRefetching || isLoansRefetching || isAnalyticsRefetching;

  const handleRefresh = async () => {
    await Promise.all([refetchSummary(), refetchLoans(), refetchAnalytics()]);
  };

  const loans = loansData?.loans || [];
  const recentLoans = loans.slice(0, 4);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  };

  const insights = analytics?.insights;
  const portfolio = analytics?.portfolio;
  const overdueCount = insights?.overdueCount || 0;
  const dueSoonCount = insights?.dueSoonCount || 0;
  const hasInsights = overdueCount > 0 || dueSoonCount > 0 || !!insights?.largestOutstanding;

  return (
    <Screen
      scrollable
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      contentContainerStyle={styles.container}
    >
      {/* Top Header matching reference Panel 4 */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.profileRow}
          activeOpacity={0.7}
          onPress={() => router.push('/(app)/profile')}
        >
          <View style={styles.avatarCircle}>
            {user?.avatarUrl?.startsWith('preset:') ? (
              <Text style={{ fontSize: 16 }}>
                {user.avatarUrl === 'preset:leaf' ? '🌿' :
                 user.avatarUrl === 'preset:owl' ? '🦉' :
                 user.avatarUrl === 'preset:fox' ? '🦊' :
                 user.avatarUrl === 'preset:tiger' ? '🐯' :
                 user.avatarUrl === 'preset:panda' ? '🐼' :
                 user.avatarUrl === 'preset:lion' ? '🦁' :
                 user.avatarUrl === 'preset:astro' ? '🚀' :
                 user.avatarUrl === 'preset:gem' ? '💎' : '🌿'}
              </Text>
            ) : user?.name ? (
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.primary }}>
                {user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
              </Text>
            ) : (
              <MiniLedgerLogo size={22} withGlow={false} />
            )}
          </View>
          <View>
            <Text style={styles.greetingSub}>{getGreeting()}</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || (user?.phone ? user.phone.replace('+91', '') : 'Member')}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.bellButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          activeOpacity={0.7}
          onPress={() => {
            if (overdueCount > 0) {
              router.push('/(app)/(tabs)/loans');
            }
          }}
        >
          <Bell size={20} color={colors.textPrimary} />
          {overdueCount > 0 && <View style={[styles.bellDot, { backgroundColor: colors.danger }]} />}
        </TouchableOpacity>
      </View>

      {/* Summary Card with Add Loan button */}
      {summaryError ? (
        <ErrorState
          message="Could not load financial summary. Please ensure server is running."
          onRetry={refetchSummary}
        />
      ) : isSummaryLoading ? (
        <View style={styles.summarySkeleton}>
          <Skeleton height={200} borderRadius={Radii.xl} />
        </View>
      ) : (
        <SummaryCard
          summary={summary}
          onAddLoan={() => router.push('/(app)/loans/new')}
          isLoading={isSummaryLoading}
        />
      )}

      {/* Attention Needed / Actionable Insights Section */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <AlertTriangle size={16} color={overdueCount > 0 ? colors.danger : colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Attention Needed</Text>
        </View>
      </View>

      {overdueCount > 0 ? (
        <View
          style={[
            styles.overdueAlertCard,
            {
              backgroundColor: colors.dangerMuted,
              borderColor: isDark ? 'rgba(255, 99, 112, 0.28)' : 'rgba(225, 29, 72, 0.25)',
            },
          ]}
        >
          <View style={styles.overdueAlertTop}>
            <View
              style={[
                styles.overdueAlertBadge,
                { backgroundColor: isDark ? 'rgba(255, 99, 112, 0.2)' : 'rgba(225, 29, 72, 0.15)' },
              ]}
            >
              <Text style={[styles.overdueAlertBadgeText, { color: colors.danger }]}>Action Required</Text>
            </View>
            <Text style={[styles.overdueAmountHighlight, { color: colors.danger }]}>
              {formatINR(insights?.overdueAmount || '0')} overdue
            </Text>
          </View>
          <Text style={[styles.overdueAlertDesc, { color: colors.textSecondary }]}>
            {overdueCount} {overdueCount === 1 ? 'loan has' : 'loans have'} passed their scheduled repayment date.
          </Text>

          {insights?.overdueLoans?.slice(0, 2).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.overdueItemRow,
                { backgroundColor: isDark ? '#121A24' : colors.surface },
              ]}
              activeOpacity={0.75}
              onPress={() => router.push(`/(app)/loans/${item.id}`)}
            >
              <View style={styles.overdueItemLeft}>
                <Text style={[styles.overdueItemName, { color: colors.textPrimary }]}>{item.friendName}</Text>
                <Text style={[styles.overdueItemDays, { color: colors.danger }]}>{item.daysOverdue} days late</Text>
              </View>
              <View style={styles.overdueItemRight}>
                <Text style={[styles.overdueItemAmount, { color: colors.textPrimary }]}>{formatINR(item.outstandingAmount)}</Text>
                <ChevronRight size={14} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : dueSoonCount > 0 ? (
        <View
          style={[
            styles.dueSoonCard,
            {
              backgroundColor: colors.warningMuted,
              borderColor: isDark ? 'rgba(251, 191, 36, 0.22)' : 'rgba(217, 119, 6, 0.25)',
            },
          ]}
        >
          <View style={styles.dueSoonTop}>
            <CalendarClock size={16} color={colors.warning} />
            <Text style={[styles.dueSoonTitle, { color: colors.warning }]}>
              {dueSoonCount} {dueSoonCount === 1 ? 'loan is' : 'loans are'} due in the next 7 days
            </Text>
          </View>
          {insights?.upcomingLoans?.slice(0, 2).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.dueSoonItemRow,
                { backgroundColor: isDark ? '#141A22' : colors.surface },
              ]}
              activeOpacity={0.75}
              onPress={() => router.push(`/(app)/loans/${item.id}`)}
            >
              <View>
                <Text style={[styles.dueSoonName, { color: colors.textPrimary }]}>{item.friendName}</Text>
                <Text style={[styles.dueSoonDue, { color: colors.textMuted }]}>Due in {item.daysUntilDue} days ({formatDate(item.dueDate)})</Text>
              </View>
              <View style={styles.overdueItemRight}>
                <Text style={[styles.dueSoonAmount, { color: colors.textPrimary }]}>{formatINR(item.outstandingAmount)}</Text>
                <ChevronRight size={14} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View
          style={[
            styles.delightCard,
            {
              backgroundColor: colors.primaryMuted,
              borderColor: isDark ? 'rgba(52, 224, 161, 0.16)' : 'rgba(5, 150, 105, 0.2)',
            },
          ]}
        >
          <View
            style={[
              styles.delightIconCircle,
              { backgroundColor: isDark ? 'rgba(52, 224, 161, 0.12)' : 'rgba(5, 150, 105, 0.12)' },
            ]}
          >
            <Sparkles size={16} color={colors.primary} />
          </View>
          <View style={styles.delightTextCol}>
            <Text style={[styles.delightTitle, { color: colors.primary }]}>All caught up!</Text>
            <Text style={[styles.delightSubtitle, { color: colors.textSecondary }]}>
              {loans.length > 0
                ? 'No overdue balances. Your friendly ledger is clean and on track.'
                : 'Welcome! Add a loan above to track money lent to friends.'}
            </Text>
          </View>
        </View>
      )}

      {/* Largest Outstanding Insight banner if present */}
      {!!insights?.largestOutstanding && overdueCount === 0 && (
        <TouchableOpacity
          style={[
            styles.largestLoanCard,
            {
              backgroundColor: isDark ? '#0E1724' : colors.surface,
              borderColor: colors.border,
            },
          ]}
          activeOpacity={0.8}
          onPress={() => router.push(`/(app)/loans/${insights.largestOutstanding!.id}`)}
        >
          <View style={styles.largestLoanLeft}>
            <TrendingUp size={15} color={colors.primary} />
            <Text style={[styles.largestLoanText, { color: colors.textSecondary }]}>
              <Text style={{ fontWeight: '700', color: colors.textPrimary }}>
                {insights.largestOutstanding.friendName}
              </Text>{' '}
              has your largest balance ({formatINR(insights.largestOutstanding.outstandingAmount)})
            </Text>
          </View>
          <ChevronRight size={14} color={colors.primary} />
        </TouchableOpacity>
      )}

      {/* Portfolio Status Donut Chart */}
      <PortfolioDonutChart
        totalLent={parseFloat(portfolio?.totalLent || summary?.totalLent || '0')}
        totalRepaid={parseFloat(portfolio?.totalRepaid || summary?.totalRepaid || '0')}
        outstandingNormal={parseFloat(portfolio?.outstandingNormal || '0')}
        outstandingOverdue={parseFloat(portfolio?.outstandingOverdue || summary?.overdueAmount || '0')}
      />

      {/* Monthly Lending vs Repayment Bar Chart */}
      <MonthlyTrendsBarChart
        series={analytics?.monthlySeries || []}
        selectedMonths={monthsRange}
        onRangeChange={(m) => setMonthsRange(m)}
      />

      {/* Recent Activity Feed */}
      {analytics?.recentActivity && analytics.recentActivity.length > 0 && (
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
          </View>

          <View
            style={[
              styles.activityList,
              {
                backgroundColor: colors.surface,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
              },
            ]}
          >
            {analytics.recentActivity.slice(0, 4).map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.activityRow,
                  { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border },
                ]}
                activeOpacity={0.75}
                onPress={() => router.push(`/(app)/loans/${activity.loanId}`)}
              >
                <View style={styles.activityLeft}>
                  <View
                    style={[
                      styles.activityIconCircle,
                      activity.type === 'LOAN_REPAID'
                        ? styles.activityIconRepaid
                        : styles.activityIconCreated,
                    ]}
                  >
                    {activity.type === 'LOAN_REPAID' ? (
                      <CheckCircle2 size={16} color={colors.primary} />
                    ) : (
                      <PlusCircle size={16} color="#60A5FA" />
                    )}
                  </View>
                  <View>
                    <Text style={[styles.activityTitle, { color: colors.textSecondary }]}>
                      {activity.type === 'LOAN_REPAID' ? 'Repayment from ' : 'Loan to '}
                      <Text style={[styles.activityFriendName, { color: colors.textPrimary }]}>
                        {activity.friendName}
                      </Text>
                    </Text>
                    <Text style={[styles.activityDate, { color: colors.textMuted }]}>
                      {formatDate(activity.date)}
                    </Text>
                  </View>
                </View>

                <View style={styles.activityRight}>
                  <Text
                    style={[
                      styles.activityAmount,
                      { color: colors.textPrimary },
                      activity.type === 'LOAN_REPAID' && { color: colors.primary },
                    ]}
                  >
                    {activity.type === 'LOAN_REPAID' ? '+' : ''}{formatINR(activity.amount)}
                  </Text>
                  <ChevronRight size={13} color={colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Recent Loans Section matching reference Panel 4 */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Loans</Text>
        {loans.length > 0 && (
          <TouchableOpacity
            style={styles.viewAllRow}
            onPress={() => router.push('/(app)/(tabs)/loans')}
            activeOpacity={0.7}
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View all ({loans.length})</Text>
            <ArrowRight size={13} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Loans List Content */}
      {loansError ? (
        <ErrorState
          message="Could not load your loan records. Tap below to retry."
          onRetry={refetchLoans}
        />
      ) : isLoansLoading ? (
        <View>
          <LoanCardSkeleton />
          <LoanCardSkeleton />
        </View>
      ) : recentLoans.length === 0 ? (
        <EmptyState
          icon={<Wallet size={28} color={Colors.primary} />}
          title="No loans yet"
          description="Start by adding your first loan to keep track of your friends."
          actionTitle="Add Your First Loan"
          onAction={() => router.push('/(app)/loans/new')}
        />
      ) : (
        <View style={styles.loansList}>
          {recentLoans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onPress={() => router.push(`/(app)/loans/${loan.id}`)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    paddingVertical: 4,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(52, 224, 161, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(52, 224, 161, 0.25)',
  },
  greetingSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: Radii.full,
    backgroundColor: Colors.danger,
  },
  summarySkeleton: {
    marginVertical: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 4,
  },
  overdueAlertCard: {
    backgroundColor: 'rgba(255, 99, 112, 0.08)',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 112, 0.28)',
    padding: 14,
    marginBottom: Spacing.md,
  },
  overdueAlertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  overdueAlertBadge: {
    backgroundColor: 'rgba(255, 99, 112, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  overdueAlertBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.danger,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overdueAmountHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.danger,
    fontVariant: ['tabular-nums'],
  },
  overdueAlertDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  overdueItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121A24',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: Radii.sm,
    marginTop: 6,
  },
  overdueItemLeft: {},
  overdueItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  overdueItemDays: {
    fontSize: 11,
    color: Colors.danger,
    fontWeight: '500',
  },
  overdueItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  overdueItemAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  dueSoonCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.22)',
    padding: 14,
    marginBottom: Spacing.md,
  },
  dueSoonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  dueSoonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FBBF24',
  },
  dueSoonItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#141A22',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: Radii.sm,
    marginTop: 4,
  },
  dueSoonName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dueSoonDue: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  dueSoonAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  delightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 224, 161, 0.06)',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(52, 224, 161, 0.16)',
    padding: 12,
    marginBottom: Spacing.md,
  },
  delightIconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(52, 224, 161, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  delightTextCol: {
    flex: 1,
  },
  delightTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  delightSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  largestLoanCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0E1724',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#192638',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: Spacing.md,
  },
  largestLoanLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  largestLoanText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  activitySection: {
    marginBottom: Spacing.md,
  },
  activityList: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  activityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIconRepaid: {
    backgroundColor: 'rgba(52, 224, 161, 0.12)',
  },
  activityIconCreated: {
    backgroundColor: 'rgba(96, 165, 250, 0.12)',
  },
  activityTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  activityFriendName: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  activityDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  activityRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  activityAmountRepaid: {
    color: Colors.primary,
  },
  loansList: {
    marginBottom: Spacing.lg,
  },
});
