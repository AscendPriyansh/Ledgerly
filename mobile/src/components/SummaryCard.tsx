import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Clock, AlertCircle } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '../constants/theme';
import { SummaryResponse } from '../types/api';
import { formatINR } from '../lib/formatters';
import { useTheme } from '../context/ThemeContext';

interface SummaryCardProps {
  summary: SummaryResponse | null | undefined;
  onAddLoan: () => void;
  isLoading?: boolean;
}

export function SummaryCard({ summary, onAddLoan, isLoading = false }: SummaryCardProps) {
  const { colors, isDark } = useTheme();
  const totalLent = parseFloat(summary?.totalLent || '0');
  const totalRepaid = parseFloat(summary?.totalRepaid || '0');
  const outstanding = parseFloat(summary?.outstandingAmount || '0');
  const overdue = parseFloat(summary?.overdueAmount || '0');

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#0F2E23', '#0E212E', '#0B1722'] : ['#E6FBF3', '#F0FDFA', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.cardGradient,
          {
            borderColor: isDark ? 'rgba(52, 224, 161, 0.16)' : 'rgba(5, 150, 105, 0.2)',
            shadowOpacity: isDark ? 0.35 : 0.08,
          },
        ]}
      >
        <Text style={[styles.headerLabel, { color: isDark ? '#8CA5A5' : '#047857' }]}>
          Total Summary
        </Text>

        {/* 2 Main Columns: Total Lent and Total Repaid */}
        <View style={styles.mainFiguresRow}>
          <View style={styles.figureCol}>
            <Text style={[styles.mainAmount, { color: colors.textPrimary }]}>
              {formatINR(totalLent)}
            </Text>
            <Text style={[styles.figureSublabel, { color: colors.textSecondary }]}>Total Lent</Text>
          </View>

          <View style={styles.figureCol}>
            <Text style={[styles.mainAmount, { color: colors.textPrimary }]}>
              {formatINR(totalRepaid)}
            </Text>
            <Text style={[styles.figureSublabel, { color: colors.textSecondary }]}>Total Repaid</Text>
          </View>
        </View>

        {/* Bottom row: Outstanding & Overdue pills */}
        <View
          style={[
            styles.subFiguresRow,
            { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
          ]}
        >
          <View style={styles.pillStat}>
            <View
              style={[
                styles.clockCircle,
                {
                  backgroundColor: isDark
                    ? 'rgba(52, 224, 161, 0.15)'
                    : 'rgba(5, 150, 105, 0.12)',
                },
              ]}
            >
              <Clock size={11} color={colors.primary} />
            </View>
            <Text style={[styles.pillAmount, { color: colors.textPrimary }]}>
              {formatINR(outstanding)}
            </Text>
            <Text style={[styles.pillSublabel, { color: colors.textSecondary }]}>Outstanding</Text>
          </View>

          <View style={styles.pillStat}>
            <View
              style={[
                styles.alertCircle,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 99, 112, 0.15)'
                    : 'rgba(225, 29, 72, 0.1)',
                },
              ]}
            >
              <AlertCircle size={11} color={colors.danger} />
            </View>
            <Text style={[styles.pillAmount, { color: colors.danger }]}>
              {formatINR(overdue)}
            </Text>
            <Text style={[styles.pillSublabel, { color: colors.textSecondary }]}>Overdue</Text>
          </View>
        </View>

        {/* Emerald + Add Loan CTA button inside the card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onAddLoan}
          style={[
            styles.addLoanButton,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            },
          ]}
        >
          <Plus size={16} color={colors.textInverse} strokeWidth={2.8} />
          <Text style={[styles.addLoanButtonText, { color: colors.textInverse }]}>Add Loan</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  cardGradient: {
    borderRadius: Radii.xl,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(52, 224, 161, 0.16)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8CA5A5',
    marginBottom: 8,
  },
  mainFiguresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  figureCol: {
    flex: 1,
  },
  mainAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 2,
    fontVariant: ['tabular-nums'],
  },
  figureSublabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  subFiguresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  pillStat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clockCircle: {
    width: 16,
    height: 16,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(52, 224, 161, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  alertCircle: {
    width: 16,
    height: 16,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255, 99, 112, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  pillAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 4,
    fontVariant: ['tabular-nums'],
  },
  pillSublabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  addLoanButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  addLoanButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textInverse,
    marginLeft: 6,
    letterSpacing: -0.2,
  },
});
