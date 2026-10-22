import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Check, CheckCircle2, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Screen } from '../../../../src/components/Screen';
import { Button } from '../../../../src/components/Button';
import { Colors, Radii, Spacing, Typography } from '../../../../src/constants/theme';
import { useLoanDetail, useRepayLoanMutation } from '../../../../src/hooks/useQueries';
import { formatINR, formatDate } from '../../../../src/lib/formatters';
import { ApiError } from '../../../../src/api/client';
import { useTheme } from '../../../../src/context/ThemeContext';

export default function RepayLoanScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const loanId = params.id;

  const { loan, isLoading } = useLoanDetail(loanId);
  const repayMutation = useRepayLoanMutation();

  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirmRepayment = async () => {
    if (!loanId) return;
    setApiError(null);

    try {
      await repayMutation.mutateAsync(loanId);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setIsSuccess(true);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError(err?.message || 'Failed to record repayment.');
      }
    }
  };

  if (isLoading || !loan) {
    return (
      <Screen contentContainerStyle={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </Screen>
    );
  }

  // Panel 9: Success Feedback
  if (isSuccess) {
    return (
      <Screen contentContainerStyle={styles.container}>
        <View style={styles.successContent}>
          {/* Glowing checkmark burst */}
          <View
            style={[
              styles.celebrationCircleOuter,
              { backgroundColor: isDark ? 'rgba(52, 224, 161, 0.1)' : 'rgba(5, 150, 105, 0.1)' },
            ]}
          >
            <View
              style={[
                styles.celebrationCircleMiddle,
                { backgroundColor: isDark ? 'rgba(52, 224, 161, 0.2)' : 'rgba(5, 150, 105, 0.2)' },
              ]}
            >
              <View style={[styles.celebrationCircleInner, { backgroundColor: colors.primary }]}>
                <Check size={42} color={colors.textInverse} strokeWidth={3.5} />
              </View>
            </View>
          </View>

          <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Loan Repaid!</Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
            You've successfully marked{' '}
            <Text style={[styles.successAmountHighlight, { color: colors.primary }]}>
              {formatINR(loan.outstandingAmount || loan.amount)}
            </Text>{' '}
            as repaid for {loan.friendName}.
          </Text>

          {/* Action buttons matching Panel 9 */}
          <View style={styles.successActions}>
            <Button
              title="View Loan Details"
              onPress={() => router.replace(`/(app)/loans/${loan.id}`)}
              variant="primary"
              size="lg"
              style={styles.actionBtnPrimary}
            />

            <TouchableOpacity
              style={styles.textActionBtn}
              onPress={() => router.replace('/(app)/(tabs)/loans')}
            >
              <Text style={[styles.textActionBtnLabel, { color: colors.textSecondary }]}>Back to Loans</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    );
  }

  // Panel 8: Repay Confirmation
  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.confirmContent}>
        {/* Glowing Checkmark Circle matching Panel 8 */}
        <View
          style={[
            styles.glowCircleWrapper,
            { backgroundColor: isDark ? 'rgba(52, 224, 161, 0.1)' : 'rgba(5, 150, 105, 0.1)' },
          ]}
        >
          <View
            style={[
              styles.glowCircleInner,
              { backgroundColor: isDark ? 'rgba(52, 224, 161, 0.2)' : 'rgba(5, 150, 105, 0.2)' },
            ]}
          >
            <Check size={36} color={colors.primary} strokeWidth={3} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>Mark as Repaid</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Are you sure you want to mark{' '}
          <Text style={[styles.highlightText, { color: colors.primary }]}>
            {formatINR(loan.outstandingAmount || loan.amount)}
          </Text>{' '}
          as repaid for {loan.friendName}?
        </Text>

        {/* Mini Summary Box */}
        <View
          style={[
            styles.summaryBox,
            {
              backgroundColor: colors.surface,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
            },
          ]}
        >
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Loan Amount</Text>
          <Text style={[styles.summaryAmount, { color: colors.textPrimary }]}>{formatINR(loan.amount)}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Due Date</Text>
          <Text style={[styles.summaryDate, { color: colors.textPrimary }]}>{formatDate(loan.dueDate)}</Text>
        </View>

        {apiError && (
          <View style={styles.errorBanner}>
            <AlertCircle size={15} color={colors.danger} style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{apiError}</Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.actionSection}>
          <Button
            title="Confirm"
            onPress={handleConfirmRepayment}
            loading={repayMutation.isPending}
            variant="primary"
            size="lg"
            style={styles.confirmButton}
          />

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={repayMutation.isPending}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
    flexGrow: 1,
  },
  loadingText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  confirmContent: {
    alignItems: 'center',
  },
  glowCircleWrapper: {
    width: 80,
    height: 80,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(52, 224, 161, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  glowCircleInner: {
    width: 60,
    height: 60,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(52, 224, 161, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.h2,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 280,
  },
  highlightText: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  summaryBox: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  summaryAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  summaryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 99, 112, 0.12)',
    padding: 10,
    borderRadius: Radii.sm,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    flex: 1,
  },
  actionSection: {
    width: '100%',
  },
  confirmButton: {
    marginBottom: 12,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  successContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  celebrationCircleOuter: {
    width: 120,
    height: 120,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(52, 224, 161, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  celebrationCircleMiddle: {
    width: 90,
    height: 90,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(52, 224, 161, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationCircleInner: {
    width: 68,
    height: 68,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    ...Typography.h1,
    fontSize: 26,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 36,
    maxWidth: 290,
  },
  successAmountHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
  successActions: {
    width: '100%',
  },
  actionBtnPrimary: {
    marginBottom: 12,
  },
  textActionBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  textActionBtnLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
