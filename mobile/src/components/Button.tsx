import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radii, Spacing, Typography } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}: ButtonProps) {
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    if (disabled || loading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onPress();
  };

  const getContainerStyles = (): ViewStyle[] => {
    const list: ViewStyle[] = [styles.base, styles[size]];

    switch (variant) {
      case 'primary':
        list.push({
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.25 : 0.2,
          shadowRadius: 8,
          elevation: 3,
        });
        break;
      case 'secondary':
        list.push({
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.border,
        });
        break;
      case 'danger':
        list.push({
          backgroundColor: colors.danger,
          shadowColor: colors.danger,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 3,
        });
        break;
      case 'outline':
        list.push({
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
        });
        break;
      case 'ghost':
        list.push({
          backgroundColor: 'transparent',
        });
        break;
    }

    if (disabled || loading) {
      list.push(styles.disabled);
    }

    return list;
  };

  const getTextStyles = (): TextStyle[] => {
    const list: TextStyle[] = [styles.baseText, styles[`${size}Text` as keyof typeof styles] as TextStyle];

    switch (variant) {
      case 'primary':
        list.push({ color: colors.textInverse });
        break;
      case 'secondary':
        list.push({ color: colors.textPrimary });
        break;
      case 'danger':
        list.push({ color: '#FFFFFF' });
        break;
      case 'outline':
        list.push({ color: colors.textPrimary });
        break;
      case 'ghost':
        list.push({ color: colors.textSecondary });
        break;
    }

    if (disabled) {
      list.push({ color: colors.textMuted });
    }

    return list;
  };

  const spinnerColor =
    variant === 'primary' ? colors.textInverse : variant === 'danger' ? '#FFFFFF' : colors.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[...getContainerStyles(), style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[...getTextStyles(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sm: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  md: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  lg: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  primary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  secondary: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  danger: {
    backgroundColor: Colors.danger,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  smText: {
    fontSize: 13,
  },
  mdText: {
    fontSize: 15,
  },
  lgText: {
    fontSize: 16,
  },
  primaryText: {
    color: Colors.textInverse,
  },
  secondaryText: {
    color: Colors.textPrimary,
  },
  dangerText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: Colors.textPrimary,
  },
  ghostText: {
    color: Colors.textSecondary,
  },
  disabledText: {
    color: Colors.textMuted,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
});
