import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radii, Spacing, Typography } from '../constants/theme';
import { MonthlyBarData } from '../types/api';
import { formatINR } from '../lib/formatters';
import { useTheme } from '../context/ThemeContext';

interface MonthlyTrendsBarChartProps {
  series: MonthlyBarData[];
  selectedMonths: number;
  onRangeChange: (months: number) => void;
}

export function MonthlyTrendsBarChart({
  series,
  selectedMonths,
  onRangeChange,
}: MonthlyTrendsBarChartProps) {
  const { colors, isDark } = useTheme();
  const [activeMonthKey, setActiveMonthKey] = useState<string | null>(
    series.length > 0 ? series[series.length - 1].month : null
  );

  const activeData = series.find((s) => s.month === activeMonthKey) || series[series.length - 1];

  // Find max value across all months for proportional scaling
  let maxVal = 0;
  for (const s of series) {
    const l = parseFloat(s.lent) || 0;
    const r = parseFloat(s.repaid) || 0;
    if (l > maxVal) maxVal = l;
    if (r > maxVal) maxVal = r;
  }
  if (maxVal === 0) maxVal = 1000;

  const chartHeight = 110;

  const handleBarTap = (monthKey: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setActiveMonthKey(monthKey);
  };

  const isAllZero = series.every((s) => parseFloat(s.lent) === 0 && parseFloat(s.repaid) === 0);

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
      {/* Top Header & Range Filter */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Monthly Activity</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Lending vs Repayments</Text>
        </View>

        {/* 6M / 12M Range Switch */}
        <View
          style={[
            styles.rangeSelector,
            {
              backgroundColor: isDark ? '#0E1722' : colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.rangeTab,
              selectedMonths === 6 && { backgroundColor: colors.primary },
            ]}
            onPress={() => onRangeChange(6)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.rangeTabText,
                { color: colors.textSecondary },
                selectedMonths === 6 && { color: colors.textInverse, fontWeight: '700' },
              ]}
            >
              6M
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.rangeTab,
              selectedMonths === 12 && { backgroundColor: colors.primary },
            ]}
            onPress={() => onRangeChange(12)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.rangeTabText,
                { color: colors.textSecondary },
                selectedMonths === 12 && { color: colors.textInverse, fontWeight: '700' },
              ]}
            >
              12M
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Selected Month Details Tooltip Card */}
      {activeData && (
        <View
          style={[
            styles.activeDetailsCard,
            {
              backgroundColor: isDark ? '#111E2C' : colors.surfaceElevated,
              borderColor: isDark ? '#1C2C3E' : colors.border,
            },
          ]}
        >
          <Text style={[styles.activeMonthTitle, { color: colors.textPrimary }]}>
            {activeData.label} Summary
          </Text>
          <View style={styles.activeMetricsRow}>
            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Lent: </Text>
              <Text style={[styles.metricAmount, { color: colors.textPrimary }]}>
                {formatINR(activeData.lent)}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#60A5FA' }]} />
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Repaid: </Text>
              <Text style={[styles.metricAmount, { color: colors.textPrimary }]}>
                {formatINR(activeData.repaid)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Bars Container */}
      {isAllZero ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions recorded in the last {selectedMonths} months.</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.barsScroll}
        >
          {series.map((item) => {
            const lentVal = parseFloat(item.lent) || 0;
            const repaidVal = parseFloat(item.repaid) || 0;

            const lentHeight = Math.max(4, Math.round((lentVal / maxVal) * chartHeight));
            const repaidHeight = Math.max(4, Math.round((repaidVal / maxVal) * chartHeight));

            const isSelected = item.month === activeMonthKey;

            return (
              <TouchableOpacity
                key={item.month}
                style={[styles.barColumn, isSelected && styles.barColumnActive]}
                onPress={() => handleBarTap(item.month)}
                activeOpacity={0.7}
              >
                <View style={[styles.barsWrapper, { height: chartHeight }]}>
                  {/* Lent bar (Emerald) */}
                  <View
                    style={[
                      styles.barLent,
                      { backgroundColor: colors.primary, height: lentVal > 0 ? lentHeight : 4 },
                      lentVal === 0 && {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
                      },
                    ]}
                  />

                  {/* Repaid bar (Blue) */}
                  <View
                    style={[
                      styles.barRepaid,
                      { height: repaidVal > 0 ? repaidHeight : 4 },
                      repaidVal === 0 && {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
                      },
                    ]}
                  />
                </View>

                {/* Month Label */}
                <Text
                  style={[
                    styles.barMonthLabel,
                    { color: colors.textMuted },
                    isSelected && { color: colors.textPrimary, fontWeight: '700' },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Legend */}
      <View
        style={[
          styles.legendRow,
          { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border },
        ]}
      >
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Lent (Principal)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#60A5FA' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Repaid</Text>
        </View>
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
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#0F1822',
    borderRadius: Radii.full,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  rangeTab: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radii.full,
  },
  rangeTabActive: {
    backgroundColor: Colors.primary,
  },
  rangeTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  rangeTabTextActive: {
    color: Colors.textInverse,
  },
  activeDetailsCard: {
    backgroundColor: '#0D1620',
    borderRadius: Radii.md,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  activeMonthTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  activeMetricsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricDot: {
    width: 6,
    height: 6,
    borderRadius: Radii.full,
    marginRight: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  metricAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  barsScroll: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 8,
    minWidth: '100%',
  },
  barColumn: {
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  barColumnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  barsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: 8,
  },
  barLent: {
    width: 10,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barRepaid: {
    width: 10,
    backgroundColor: '#60A5FA',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barZero: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  barMonthLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  barMonthLabelActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: Radii.full,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});
