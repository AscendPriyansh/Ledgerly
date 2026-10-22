import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { FileText } from 'lucide-react-native';
import { Colors, Radii, Spacing, Typography } from '../constants/theme';
import { Button } from './Button';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title = 'No loans yet',
  description = 'Start by adding your first loan to keep track of your friends.',
  actionTitle = 'Add Your First Loan',
  onAction,
  style,
}: EmptyStateProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: isDark ? '#111A26' : colors.surfaceElevated,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
          },
        ]}
      >
        {icon || <FileText size={28} color={colors.textSecondary} />}
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          size="md"
          style={styles.actionButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: Spacing.xl,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: Radii.full,
    backgroundColor: '#111A26',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    maxWidth: 240,
  },
  actionButton: {
    minWidth: 180,
  },
});
