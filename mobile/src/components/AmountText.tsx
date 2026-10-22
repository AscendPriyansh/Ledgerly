import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { formatINR } from '../lib/formatters';
import { Colors } from '../constants/theme';

interface AmountTextProps {
  amount: number | string | null | undefined;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  color?: 'default' | 'primary' | 'danger' | 'warning' | 'muted';
  style?: TextStyle;
}

export function AmountText({
  amount,
  size = 'md',
  color = 'default',
  style,
}: AmountTextProps) {
  const formatted = formatINR(amount);

  const getColor = () => {
    switch (color) {
      case 'primary':
        return Colors.primary;
      case 'danger':
        return Colors.danger;
      case 'warning':
        return Colors.warning;
      case 'muted':
        return Colors.textMuted;
      default:
        return Colors.textPrimary;
    }
  };

  return (
    <Text style={[styles.base, styles[size], { color: getColor() }, style]}>
      {formatted}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  sm: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  md: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  lg: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  hero: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -1,
  },
});
