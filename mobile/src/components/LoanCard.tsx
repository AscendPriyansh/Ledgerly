import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { User } from 'lucide-react-native';
import { Colors, Radii, Spacing, Typography } from '../constants/theme';
import { Loan } from '../types/api';
import { formatDate, formatINR, getDueStatus } from '../lib/formatters';
import { StatusBadge } from './StatusBadge';
import { useTheme } from '../context/ThemeContext';

interface LoanCardProps {
  loan: Loan;
  onPress: () => void;
  style?: ViewStyle;
}

export function LoanCard({ loan, onPress, style }: LoanCardProps) {
  const { colors, isDark } = useTheme();
  const isRepaid = loan.status === 'REPAID';
  const dueInfo = getDueStatus(loan.dueDate, isRepaid);
  const isOverdue = loan.isOverdue || (!isRepaid && dueInfo.isOverdue);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
        },
        isOverdue && {
          backgroundColor: colors.dangerMuted,
          borderColor: isDark ? 'rgba(255, 99, 112, 0.25)' : 'rgba(225, 29, 72, 0.25)',
        },
        style,
      ]}
    >
      {/* Left Avatar circle */}
      <View
        style={[
          styles.avatar,
          isOverdue
            ? styles.avatarOverdue
            : isRepaid
            ? styles.avatarRepaid
            : styles.avatarDefault,
        ]}
      >
        <User
          size={18}
          color={isOverdue ? colors.danger : isRepaid ? colors.primary : colors.textMuted}
        />
      </View>

      {/* Middle info */}
      <View style={styles.centerInfo}>
        <Text style={[styles.friendName, { color: colors.textPrimary }]} numberOfLines={1}>
          {loan.friendName}
        </Text>
        <Text style={[styles.dueDateText, { color: colors.textSecondary }]}>
          Due {formatDate(loan.dueDate)}
        </Text>
      </View>

      {/* Right financial column */}
      <View style={styles.rightCol}>
        <Text style={[styles.amountText, { color: colors.textPrimary }]}>
          {formatINR(loan.amount)}
        </Text>
        <View style={styles.badgeWrapper}>
          <StatusBadge
            status={loan.status}
            isOverdue={isOverdue}
            overdueText={isOverdue ? `${dueInfo.daysDifference} days` : undefined}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  cardOverdue: {
    borderColor: 'rgba(255, 99, 112, 0.22)',
    backgroundColor: 'rgba(255, 99, 112, 0.04)',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarDefault: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
  avatarRepaid: {
    backgroundColor: 'rgba(52, 224, 161, 0.14)',
  },
  avatarOverdue: {
    backgroundColor: 'rgba(255, 99, 112, 0.15)',
  },
  centerInfo: {
    flex: 1,
    marginRight: 8,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  dueDateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  badgeWrapper: {
    alignItems: 'flex-end',
  },
});
