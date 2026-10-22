import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Colors, Radii, Spacing, Typography } from '../constants/theme';
import { formatINR } from '../lib/formatters';
import { useTheme } from '../context/ThemeContext';

interface PortfolioDonutChartProps {
  totalLent: number;
  totalRepaid: number;
  outstandingNormal: number;
  outstandingOverdue: number;
}

export function PortfolioDonutChart({
  totalLent,
  totalRepaid,
  outstandingNormal,
  outstandingOverdue,
}: PortfolioDonutChartProps) {
  const { colors, isDark } = useTheme();
  const [selectedSegment, setSelectedSegment] = useState<'outstanding' | 'repaid' | 'overdue' | null>(null);

  const totalOutstanding = outstandingNormal + outstandingOverdue;
  const isZeroData = totalLent <= 0;

  // Pie segments: Repaid, Outstanding Normal, Overdue
  // They cleanly partition Total Lent
  const repaidPct = totalLent > 0 ? (totalRepaid / totalLent) * 100 : 0;
  const normalPct = totalLent > 0 ? (outstandingNormal / totalLent) * 100 : 0;
  const overduePct = totalLent > 0 ? (outstandingOverdue / totalLent) * 100 : 0;

  const size = 180;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Segment stroke dashes
  const repaidDash = (repaidPct / 100) * circumference;
  const normalDash = (normalPct / 100) * circumference;
  const overdueDash = (overduePct / 100) * circumference;

  const handleSegmentTap = (seg: 'outstanding' | 'repaid' | 'overdue') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedSegment(selectedSegment === seg ? null : seg);
  };

  // Center display values
  const getCenterContent = () => {
    if (isZeroData) {
      return {
        label: 'No Loans',
        amount: '₹0.00',
        subtext: 'Add a loan to begin',
        color: Colors.textMuted,
      };
    }

    if (selectedSegment === 'repaid') {
      return {
        label: 'Total Repaid',
        amount: formatINR(totalRepaid),
        subtext: `${repaidPct.toFixed(0)}% of portfolio`,
        color: '#60A5FA',
      };
    }

    if (selectedSegment === 'overdue') {
      return {
        label: 'Overdue Debt',
        amount: formatINR(outstandingOverdue),
        subtext: `${overduePct.toFixed(0)}% of portfolio`,
        color: Colors.danger,
      };
    }

    // Default or 'outstanding'
    return {
      label: 'Outstanding',
      amount: formatINR(totalOutstanding),
      subtext: `${(normalPct + overduePct).toFixed(0)}% of total lent`,
      color: Colors.primary,
    };
  };

  const centerInfo = getCenterContent();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Portfolio Status</Text>
        <Text style={[styles.cardSublabel, { color: colors.textSecondary }]}>Breakdown by amount</Text>
      </View>

      {/* Donut graphic */}
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size}>
          <G transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {/* Background Track */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.chartTrack}
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {!isZeroData && (
              <>
                {/* 1. Repaid Segment (Blue) */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#60A5FA"
                  strokeWidth={selectedSegment === 'repaid' ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${repaidDash} ${circumference}`}
                  strokeDashoffset={0}
                  fill="transparent"
                  strokeLinecap="round"
                />

                {/* 2. Normal Outstanding Segment (Emerald Mint) */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={Colors.primary}
                  strokeWidth={selectedSegment === 'outstanding' ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${normalDash} ${circumference}`}
                  strokeDashoffset={-repaidDash}
                  fill="transparent"
                  strokeLinecap="round"
                />

                {/* 3. Overdue Segment (Coral Red) */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={Colors.danger}
                  strokeWidth={selectedSegment === 'overdue' ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${overdueDash} ${circumference}`}
                  strokeDashoffset={-(repaidDash + normalDash)}
                  fill="transparent"
                  strokeLinecap="round"
                />
              </>
            )}
          </G>
        </Svg>

        {/* Center label */}
        <View style={styles.centerContainer} pointerEvents="none">
          <Text style={[styles.centerLabel, { color: centerInfo.color }]}>
            {centerInfo.label}
          </Text>
          <Text style={[styles.centerAmount, { color: colors.textPrimary }]} numberOfLines={1}>
            {centerInfo.amount}
          </Text>
          <Text style={[styles.centerSubtext, { color: colors.textMuted }]}>{centerInfo.subtext}</Text>
        </View>
      </View>

      {/* Accessible Interactive Legend */}
      <View
        style={[
          styles.legendContainer,
          { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border },
        ]}
      >
        {/* Outstanding (Not overdue) */}
        <TouchableOpacity
          style={[
            styles.legendItem,
            selectedSegment === 'outstanding' && {
              backgroundColor: isDark ? '#162332' : colors.surfaceElevated,
            },
          ]}
          onPress={() => handleSegmentTap('outstanding')}
          activeOpacity={0.7}
        >
          <View style={styles.legendIndicatorRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.legendLabel, { color: colors.textPrimary }]}>Outstanding</Text>
          </View>
          <View style={styles.legendValuesRow}>
            <Text style={[styles.legendAmount, { color: colors.textPrimary }]}>
              {formatINR(outstandingNormal)}
            </Text>
            <Text style={[styles.legendPct, { color: colors.textSecondary }]}>
              {normalPct.toFixed(0)}%
            </Text>
          </View>
        </TouchableOpacity>

        {/* Overdue */}
        <TouchableOpacity
          style={[
            styles.legendItem,
            selectedSegment === 'overdue' && {
              backgroundColor: isDark ? '#162332' : colors.surfaceElevated,
            },
          ]}
          onPress={() => handleSegmentTap('overdue')}
          activeOpacity={0.7}
        >
          <View style={styles.legendIndicatorRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
            <Text style={[styles.legendLabel, { color: colors.textPrimary }]}>Overdue</Text>
          </View>
          <View style={styles.legendValuesRow}>
            <Text style={[styles.legendAmount, { color: colors.danger }]}>
              {formatINR(outstandingOverdue)}
            </Text>
            <Text style={[styles.legendPct, { color: colors.danger }]}>
              {overduePct.toFixed(0)}%
            </Text>
          </View>
        </TouchableOpacity>

        {/* Repaid */}
        <TouchableOpacity
          style={[
            styles.legendItem,
            selectedSegment === 'repaid' && {
              backgroundColor: isDark ? '#162332' : colors.surfaceElevated,
            },
          ]}
          onPress={() => handleSegmentTap('repaid')}
          activeOpacity={0.7}
        >
          <View style={styles.legendIndicatorRow}>
            <View style={[styles.legendDot, { backgroundColor: '#60A5FA' }]} />
            <Text style={[styles.legendLabel, { color: colors.textPrimary }]}>Repaid</Text>
          </View>
          <View style={styles.legendValuesRow}>
            <Text style={[styles.legendAmount, { color: colors.textPrimary }]}>
              {formatINR(totalRepaid)}
            </Text>
            <Text style={[styles.legendPct, { color: colors.textSecondary }]}>
              {repaidPct.toFixed(0)}%
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardSublabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    position: 'relative',
  },
  centerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
  },
  centerLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  centerAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.4,
    marginBottom: 2,
    textAlign: 'center',
  },
  centerSubtext: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  legendContainer: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: Radii.sm,
  },
  legendItemActive: {
    backgroundColor: '#162332',
  },
  legendIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: Radii.full,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  legendValuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  legendPct: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'right',
  },
});
