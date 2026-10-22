import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { Colors, Radii } from '../constants/theme';
import { LoanStatus } from '../types/api';
import { useTheme } from '../context/ThemeContext';

interface StatusBadgeProps {
  status: LoanStatus;
  isOverdue?: boolean;
  overdueText?: string;
  style?: ViewStyle;
}

export function StatusBadge({ status, isOverdue = false, overdueText, style }: StatusBadgeProps) {
  const { colors } = useTheme();

  if (status === 'REPAID') {
    return (
      <View style={[styles.badge, { backgroundColor: colors.badgeRepaidBg }, style]}>
        <Text style={[styles.badgeText, { color: colors.badgeRepaidText }]}>Repaid</Text>
      </View>
    );
  }

  if (isOverdue) {
    return (
      <View style={[styles.badge, { backgroundColor: colors.badgeOverdueBg }, style]}>
        <Text style={[styles.badgeText, { color: colors.badgeOverdueText }]}>Overdue</Text>
        {overdueText ? (
          <Text style={[styles.overdueDaysSub, { color: colors.badgeOverdueText }]}>
            {overdueText}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: colors.badgeOutstandingBg }, style]}>
      <Text style={[styles.badgeText, { color: colors.badgeOutstandingText }]}>Outstanding</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  repaidBadge: {
    backgroundColor: 'rgba(52, 224, 161, 0.15)',
  },
  repaidText: {
    color: Colors.primary,
  },
  overdueBadge: {
    backgroundColor: 'rgba(255, 99, 112, 0.15)',
  },
  overdueText: {
    color: Colors.danger,
  },
  overdueDaysSub: {
    fontSize: 10,
    color: Colors.danger,
    fontWeight: '600',
    marginTop: 1,
  },
  outstandingBadge: {
    backgroundColor: 'rgba(52, 224, 161, 0.12)',
  },
  outstandingText: {
    color: Colors.primary,
  },
});
