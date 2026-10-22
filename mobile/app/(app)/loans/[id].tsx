import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Share2,
  FileText,
  CheckCircle2,
  Clock,
} from 'lucide-react-native';
import { Screen } from '../../../src/components/Screen';
import { Button } from '../../../src/components/Button';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { ErrorState } from '../../../src/components/ErrorState';
import { Skeleton } from '../../../src/components/LoadingSkeleton';
import { Colors, Radii, Spacing, Typography } from '../../../src/constants/theme';
import { useLoanDetail } from '../../../src/hooks/useQueries';
import { formatDate, formatINR, getDueStatus } from '../../../src/lib/formatters';
import { useTheme } from '../../../src/context/ThemeContext';

export default function LoanDetailScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const loanId = params.id;

  const [historyExpanded, setHistoryExpanded] = React.useState(true);
  const { loan, isLoading, error, refetch, notFound } = useLoanDetail(loanId);

  if (isLoading) {
    return (
      <Screen contentContainerStyle={styles.container}>
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={{ paddingVertical: 20 }}>
          <Skeleton height={60} borderRadius={Radii.full} style={{ marginBottom: 20 }} />
          <Skeleton height={140} borderRadius={Radii.lg} style={{ marginBottom: 16 }} />
          <Skeleton height={80} borderRadius={Radii.md} />
        </View>
      </Screen>
    );
  }

  if (notFound || !loan) {
    return (
      <Screen contentContainerStyle={styles.container}>
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <ErrorState
          message="This loan record could not be found or may have been deleted."
          onRetry={refetch}
        />
      </Screen>
    );
  }

  const isRepaid = loan.status === 'REPAID';
  const dueInfo = getDueStatus(loan.dueDate, isRepaid);
  const isOverdue = loan.isOverdue || (!isRepaid && dueInfo.isOverdue);
  const initials = loan.friendName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const totalAmountNum = parseFloat(loan.amount) || 0;
  const repaidAmountNum = parseFloat(loan.repaidAmount) || 0;
  const progressRatio = totalAmountNum > 0 ? Math.min(repaidAmountNum / totalAmountNum, 1) : 0;
  const repaymentsList = loan.repayments || [];

  const handleShareReminder = async () => {
    const remaining = formatINR(loan.outstandingAmount || loan.amount);
    const message = isRepaid
      ? `Hi ${loan.friendName}, just confirming that your loan of ${formatINR(loan.amount)} on MiniLedger has been marked as fully settled. Thank you!`
      : isOverdue
      ? `Hi ${loan.friendName}, gentle reminder regarding the friendly loan of ${remaining} which was due on ${formatDate(loan.dueDate)}. Whenever you get a chance, you can settle it. Thanks!`
      : `Hi ${loan.friendName}, friendly reminder about the loan of ${remaining} due on ${formatDate(loan.dueDate)}. Thank you!`;

    try {
      await Share.share({
        message,
        title: `MiniLedger: Payment Reminder for ${loan.friendName}`,
      });
    } catch (err) {
      // User dismissed or share error
    }
  };

  return (
    <Screen scrollable contentContainerStyle={styles.container}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.shareIconButton,
            {
              backgroundColor: isDark ? 'rgba(52, 224, 161, 0.12)' : 'rgba(5, 150, 105, 0.1)',
              borderColor: isDark ? 'rgba(52, 224, 161, 0.25)' : 'rgba(5, 150, 105, 0.25)',
            },
          ]}
          activeOpacity={0.7}
          onPress={handleShareReminder}
        >
          <Share2 size={19} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Friend Header */}
      <View style={styles.friendProfileRow}>
        <View
          style={[
            styles.avatarCircle,
            isOverdue ? styles.avatarOverdue : isRepaid ? styles.avatarRepaid : styles.avatarDefault,
          ]}
        >
          <Text
            style={[
              styles.avatarText,
              isOverdue
                ? { color: colors.danger }
                : isRepaid
                ? { color: colors.primary }
                : { color: colors.textPrimary },
            ]}
          >
            {initials}
          </Text>
        </View>
        <View style={styles.friendTextCol}>
          <Text style={[styles.friendName, { color: colors.textPrimary }]}>{loan.friendName}</Text>
          <Text style={[styles.friendSubtitle, { color: colors.textSecondary }]}>
            Recorded on {formatDate(loan.createdAt)}
          </Text>
        </View>
      </View>

      {/* Main Amount Card */}
      <View
        style={[
          styles.amountHeaderRow,
          {
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.amountValue, { color: colors.textPrimary }]}>{formatINR(loan.amount)}</Text>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Original principal</Text>
        </View>

        <StatusBadge
          status={loan.status}
          isOverdue={isOverdue}
          overdueText={isOverdue ? `${dueInfo.daysDifference} days` : undefined}
        />
      </View>

      {/* Two Metric Summary Boxes */}
      <View style={styles.metricBoxesRow}>
        <View
          style={[
            styles.metricBox,
            {
              backgroundColor: colors.surface,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
            },
          ]}
        >
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Due Date</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{formatDate(loan.dueDate)}</Text>
        </View>

        <View
          style={[
            styles.metricBox,
            {
              backgroundColor: colors.surface,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
            },
          ]}
        >
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Days Overdue</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }, isOverdue && { color: colors.danger }]}>
            {isOverdue ? dueInfo.daysDifference : 0}
          </Text>
        </View>
      </View>

      {/* Visual Progress Bar */}
      <View style={styles.progressSection}>
        <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#162232' : colors.surfaceElevated }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: colors.primary,
                width: `${isRepaid ? 100 : Math.round(progressRatio * 100)}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.remainingText, { color: colors.textPrimary }]}>
          {isRepaid ? 'Fully settled' : `${formatINR(loan.outstandingAmount)} remaining`}
        </Text>
      </View>

      {/* Note / Memo Section if present */}
      {!!loan.note && (
        <View
          style={[
            styles.noteCard,
            {
              backgroundColor: isDark ? '#0F1A26' : colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.noteHeader}>
            <FileText size={15} color={colors.primary} />
            <Text style={[styles.noteLabel, { color: colors.primary }]}>Memo / Purpose</Text>
          </View>
          <Text style={[styles.noteContent, { color: colors.textSecondary }]}>{loan.note}</Text>
        </View>
      )}

      {/* Repayment History Section */}
      <View
        style={[
          styles.historyCard,
          {
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.historyRow}
          activeOpacity={0.7}
          onPress={() => setHistoryExpanded(!historyExpanded)}
        >
          <View>
            <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>Repayment History</Text>
            <Text style={[styles.historySubtitle, { color: colors.textSecondary }]}>
              {isRepaid
                ? `Paid ${formatINR(loan.repaidAmount || loan.amount)}`
                : repaymentsList.length > 0
                ? `${repaymentsList.length} payment recorded (${formatINR(loan.repaidAmount)} paid)`
                : 'No repayments yet'}
            </Text>
          </View>
          {historyExpanded ? (
            <ChevronDown size={18} color={colors.textSecondary} />
          ) : (
            <ChevronRight size={18} color={colors.textSecondary} />
          )}
        </TouchableOpacity>

        {historyExpanded && (
          <View
            style={[
              styles.historyContent,
              { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border },
            ]}
          >
            {repaymentsList.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Clock size={16} color={colors.textMuted} />
                <Text style={[styles.emptyHistoryText, { color: colors.textMuted }]}>
                  {isRepaid ? 'Marked as repaid directly' : 'No partial or full payments logged yet.'}
                </Text>
              </View>
            ) : (
              repaymentsList.map((rep, idx) => (
                <View
                  key={rep.id || idx}
                  style={[
                    styles.repaymentItem,
                    { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border },
                  ]}
                >
                  <View style={styles.repaymentLeft}>
                    <CheckCircle2 size={16} color={colors.primary} />
                    <View style={styles.repaymentDetails}>
                      <Text style={[styles.repaymentAmount, { color: colors.textPrimary }]}>
                        {formatINR(rep.amount)}
                      </Text>
                      <Text style={[styles.repaymentDate, { color: colors.textMuted }]}>
                        {formatDate(rep.repaidAt)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.settledBadge,
                      {
                        backgroundColor: isDark ? 'rgba(52, 224, 161, 0.1)' : 'rgba(5, 150, 105, 0.1)',
                      },
                    ]}
                  >
                    <Text style={[styles.settledBadgeText, { color: colors.primary }]}>Recorded</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {!isRepaid ? (
          <>
            <Button
              title="Mark as Repaid"
              onPress={() => router.push(`/(app)/loans/${loan.id}/repay`)}
              variant="primary"
              size="lg"
              style={styles.repayButton}
            />

            <TouchableOpacity
              style={styles.shareReminderButton}
              onPress={handleShareReminder}
              activeOpacity={0.8}
            >
              <Share2 size={16} color={Colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.shareReminderText}>Share Reminder with {loan.friendName.split(' ')[0]}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.shareReminderButton}
              onPress={handleShareReminder}
              activeOpacity={0.8}
            >
              <Share2 size={16} color={Colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.shareReminderText}>Share Settlement Receipt</Text>
            </TouchableOpacity>

            <Button
              title="Back to All Loans"
              onPress={() => router.replace('/(app)/(tabs)/loans')}
              variant="secondary"
              size="md"
              style={{ marginTop: 10 }}
            />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 48,
    paddingBottom: 32,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
  },
  shareIconButton: {
    padding: 8,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(52, 224, 161, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(52, 224, 161, 0.25)',
  },
  friendProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarDefault: {
    backgroundColor: 'rgba(148, 163, 184, 0.14)',
  },
  avatarRepaid: {
    backgroundColor: 'rgba(52, 224, 161, 0.15)',
  },
  avatarOverdue: {
    backgroundColor: 'rgba(255, 99, 112, 0.16)',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  avatarTextDefault: {
    color: Colors.textPrimary,
  },
  avatarTextRepaid: {
    color: Colors.primary,
  },
  avatarTextOverdue: {
    color: Colors.danger,
  },
  friendTextCol: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  friendSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  amountHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  amountValue: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  amountLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  metricBoxesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  metricBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#162232',
    borderRadius: Radii.full,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
  },
  remainingText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  noteCard: {
    backgroundColor: '#0F1A26',
    borderRadius: Radii.md,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#1C2C3F',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  noteLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteContent: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 24,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  historySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  historyContent: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyHistory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  emptyHistoryText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  repaymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  repaymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  repaymentDetails: {},
  repaymentAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  repaymentDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  settledBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(52, 224, 161, 0.1)',
  },
  settledBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
  },
  actionSection: {
    marginTop: 'auto',
    paddingBottom: 16,
  },
  repayButton: {
    marginBottom: 10,
  },
  shareReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radii.md,
    backgroundColor: 'rgba(52, 224, 161, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(52, 224, 161, 0.25)',
  },
  shareReminderText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
