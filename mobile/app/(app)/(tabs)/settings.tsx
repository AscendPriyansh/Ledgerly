import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Info,
  HelpCircle,
  LogOut,
  ChevronRight,
  Server,
  CheckCircle2,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Screen } from '../../../src/components/Screen';
import { Button } from '../../../src/components/Button';
import { MiniLedgerLogo } from '../../../src/components/MiniLedgerLogo';
import { Colors, Radii, Spacing, Typography } from '../../../src/constants/theme';
import { useAuth } from '../../../src/features/auth/AuthContext';
import { useHealthQuery } from '../../../src/hooks/useQueries';
import { getApiBaseUrl } from '../../../src/api/client';
import { useTheme } from '../../../src/context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const { data: health } = useHealthQuery();
  const { themeMode, isDark, colors, setThemeMode } = useTheme();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const performLogout = async () => {
    try {
      setLogoutModalVisible(false);
      await logout();
      queryClient.clear();
      router.replace('/(auth)/login');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  return (
    <Screen scrollable contentContainerStyle={styles.container}>
      {/* Header matching reference Panel 10 */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <MiniLedgerLogo size={28} style={{ marginRight: 8 }} />
          <Text style={[styles.brandName, { color: colors.textPrimary }]}>MiniLedger</Text>
        </View>
        <Text style={[styles.versionTag, { color: colors.textMuted }]}>v1.1.0</Text>
      </View>

      {/* User Profile Card */}
      <TouchableOpacity
        style={[
          styles.profileCard,
          {
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
          },
        ]}
        activeOpacity={0.75}
        onPress={() => router.push('/(app)/profile')}
      >
        <View style={styles.userAvatar}>
          {user?.avatarUrl?.startsWith('preset:') ? (
            <Text style={{ fontSize: 20 }}>
              {user.avatarUrl === 'preset:leaf' ? '🌿' :
               user.avatarUrl === 'preset:owl' ? '🦉' :
               user.avatarUrl === 'preset:fox' ? '🦊' :
               user.avatarUrl === 'preset:tiger' ? '🐯' :
               user.avatarUrl === 'preset:panda' ? '🐼' :
               user.avatarUrl === 'preset:lion' ? '🦁' :
               user.avatarUrl === 'preset:astro' ? '🚀' :
               user.avatarUrl === 'preset:gem' ? '💎' : '🌿'}
            </Text>
          ) : user?.name ? (
            <Text style={[styles.avatarInitials, { color: colors.primary }]}>
              {user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
            </Text>
          ) : (
            <User size={22} color={colors.primary} />
          )}
        </View>
        <View style={styles.userInfoCol}>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>
            {user?.name || 'Account & Profile'}
          </Text>
          <Text style={[styles.userPhone, { color: colors.textSecondary }]}>
            {user?.phone || '+91 98765 43210'}
          </Text>
        </View>
        <View
          style={[
            styles.editProfileBadge,
            {
              backgroundColor: isDark ? 'rgba(52, 224, 161, 0.08)' : 'rgba(5, 150, 105, 0.08)',
              borderColor: isDark ? 'rgba(52, 224, 161, 0.2)' : 'rgba(5, 150, 105, 0.2)',
            },
          ]}
        >
          <Text style={[styles.editProfileText, { color: colors.primary }]}>Edit</Text>
          <ChevronRight size={15} color={colors.primary} />
        </View>
      </TouchableOpacity>

      {/* Theme / Appearance Section */}
      <View
        style={[
          styles.themeSection,
          {
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
          },
        ]}
      >
        <View style={styles.themeHeaderRow}>
          <View style={styles.themeTitleRow}>
            {isDark ? (
              <Moon size={18} color={colors.primary} />
            ) : (
              <Sun size={18} color={colors.primary} />
            )}
            <Text style={[styles.themeSectionTitle, { color: colors.textPrimary }]}>
              Appearance
            </Text>
          </View>
          <Text style={[styles.themeActiveTag, { color: colors.primary }]}>
            {themeMode === 'system' ? 'System Match' : isDark ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </View>

        <View
          style={[
            styles.themeSegmentRow,
            {
              backgroundColor: isDark ? '#0D1622' : colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.themeTab,
              themeMode === 'dark' && {
                backgroundColor: colors.surface,
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 3,
                elevation: 1,
              },
            ]}
            onPress={() => setThemeMode('dark')}
            activeOpacity={0.7}
          >
            <Moon size={14} color={themeMode === 'dark' ? colors.primary : colors.textMuted} />
            <Text
              style={[
                styles.themeTabText,
                { color: colors.textSecondary },
                themeMode === 'dark' && { color: colors.textPrimary, fontWeight: '700' },
              ]}
            >
              Dark
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeTab,
              themeMode === 'light' && {
                backgroundColor: colors.surface,
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 3,
                elevation: 1,
              },
            ]}
            onPress={() => setThemeMode('light')}
            activeOpacity={0.7}
          >
            <Sun size={14} color={themeMode === 'light' ? colors.primary : colors.textMuted} />
            <Text
              style={[
                styles.themeTabText,
                { color: colors.textSecondary },
                themeMode === 'light' && { color: colors.textPrimary, fontWeight: '700' },
              ]}
            >
              Light
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeTab,
              themeMode === 'system' && {
                backgroundColor: colors.surface,
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 3,
                elevation: 1,
              },
            ]}
            onPress={() => setThemeMode('system')}
            activeOpacity={0.7}
          >
            <Laptop size={14} color={themeMode === 'system' ? colors.primary : colors.textMuted} />
            <Text
              style={[
                styles.themeTabText,
                { color: colors.textSecondary },
                themeMode === 'system' && { color: colors.textPrimary, fontWeight: '700' },
              ]}
            >
              System
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Menu List matching reference Panel 10 */}
      <View
        style={[
          styles.menuList,
          {
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
          },
        ]}
      >
        {/* App Info */}
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuIconCircle}>
            <Info size={16} color={colors.textSecondary} />
          </View>
          <View style={styles.menuTextCol}>
            <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>App Info</Text>
            <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
              Track your lending records
            </Text>
          </View>
          <ChevronRight size={16} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Help & Support */}
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuIconCircle}>
            <HelpCircle size={16} color={colors.textSecondary} />
          </View>
          <View style={styles.menuTextCol}>
            <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Help & Support</Text>
            <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
              Get help or contact us
            </Text>
          </View>
          <ChevronRight size={16} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Server Status info */}
        <View style={styles.menuItem}>
          <View style={styles.menuIconCircle}>
            <Server size={16} color={colors.primary} />
          </View>
          <View style={styles.menuTextCol}>
            <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Backend Server</Text>
            <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{getApiBaseUrl()}</Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          style={[styles.menuItem, styles.logoutMenuItem]}
          onPress={() => setLogoutModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconCircle, styles.logoutIconCircle]}>
            <LogOut size={16} color={colors.danger} />
          </View>
          <View style={styles.menuTextCol}>
            <Text style={[styles.logoutTitle, { color: colors.danger }]}>Log Out</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Logout Bottom Sheet Confirmation Modal matching reference Panel 10 */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setLogoutModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalSheet}>
                <Text style={styles.modalTitle}>Log out</Text>
                <Text style={styles.modalSubtitle}>
                  Are you sure you want to log out?
                </Text>

                <Button
                  title="Log Out"
                  onPress={performLogout}
                  variant="danger"
                  size="lg"
                  style={styles.modalLogoutBtn}
                />

                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setLogoutModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 48,
    paddingBottom: 32,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  versionTag: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(52, 224, 161, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  editProfileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(52, 224, 161, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(52, 224, 161, 0.2)',
  },
  editProfileText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  themeSection: {
    borderRadius: Radii.lg,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  themeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  themeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  themeActiveTag: {
    fontSize: 12,
    fontWeight: '600',
  },
  themeSegmentRow: {
    flexDirection: 'row',
    borderRadius: Radii.md,
    padding: 4,
    borderWidth: 1,
    gap: 4,
  },
  themeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radii.sm,
  },
  themeTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  menuList: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  menuIconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    backgroundColor: '#162232',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
  },
  logoutMenuItem: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  logoutIconCircle: {
    backgroundColor: 'rgba(255, 99, 112, 0.12)',
  },
  logoutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0F1822',
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitle: {
    ...Typography.h2,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  modalLogoutBtn: {
    marginBottom: 12,
  },
  modalCancelBtn: {
    backgroundColor: '#162232',
    borderRadius: Radii.full,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
