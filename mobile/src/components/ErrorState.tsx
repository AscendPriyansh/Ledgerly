import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Colors, Radii, Spacing, Typography } from '../constants/theme';
import { Button } from './Button';
import { useTheme } from '../context/ThemeContext';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorState({
  message = "We couldn't load your loans. Please check your connection and try again.",
  onRetry,
  style,
}: ErrorStateProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? 'rgba(255, 99, 112, 0.22)' : 'rgba(225, 29, 72, 0.25)',
        },
        style,
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.dangerMuted }]}>
        <AlertTriangle size={24} color={colors.danger} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Something went wrong</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {onRetry && (
        <Button
          title="Retry"
          onPress={onRetry}
          variant="outline"
          size="sm"
          style={styles.retryButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#111722',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 112, 0.18)',
    marginVertical: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255, 99, 112, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  message: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 16,
    maxWidth: 260,
  },
  retryButton: {
    minWidth: 110,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
});
