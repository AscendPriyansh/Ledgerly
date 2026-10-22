import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, ViewStyle } from 'react-native';
import { Colors, Radii, Spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = Radii.sm,
  style,
}: SkeletonProps) {
  const { colors, isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.25,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          backgroundColor: isDark ? '#1C293A' : '#E2E8F0',
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function DashboardLoadingSkeleton() {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.dashboardSkeleton,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
        },
      ]}
    >
      <Text style={[styles.loadingLabel, { color: colors.textSecondary }]}>Loading your dashboard...</Text>
      <View style={styles.topTrack}>
        <Skeleton width="45%" height={8} borderRadius={Radii.full} style={{ marginBottom: 12 }} />
        <Skeleton width="85%" height={8} borderRadius={Radii.full} style={{ marginBottom: 10 }} />
        <Skeleton width="65%" height={8} borderRadius={Radii.full} style={{ marginBottom: 10 }} />
      </View>
    </View>
  );
}

export function LoanCardSkeleton() {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.cardSkeleton,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        <Skeleton width={38} height={38} borderRadius={Radii.full} />
        <View style={styles.col}>
          <Skeleton width="60%" height={14} style={{ marginBottom: 6 }} />
          <Skeleton width="40%" height={11} />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Skeleton width={65} height={16} style={{ marginBottom: 6 }} />
          <Skeleton width={50} height={14} borderRadius={Radii.full} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#1C293A',
  },
  dashboardSkeleton: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  loadingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  topTrack: {
    paddingVertical: 4,
  },
  cardSkeleton: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  col: {
    flex: 1,
    marginLeft: 12,
  },
});
