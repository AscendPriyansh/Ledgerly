import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  FileText,
  Camera,
  CheckCircle2,
  Calendar,
  Wallet,
  ShieldCheck,
  Sparkles,
  X,
  Moon,
  Sun,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { MiniLedgerLogo } from '../../src/components/MiniLedgerLogo';
import { Colors, Radii, Spacing, Typography } from '../../src/constants/theme';
import { useAuth } from '../../src/features/auth/AuthContext';
import { useProfileQuery, useUpdateProfileMutation } from '../../src/hooks/useQueries';
import { formatDate } from '../../src/lib/formatters';
import { UserProfileResponse } from '../../src/types/api';
import { useTheme } from '../../src/context/ThemeContext';

const PRESET_AVATARS = [
  { id: 'leaf', label: 'Leafy', emoji: '🌿', color: '#10B981' },
  { id: 'owl', label: 'Wise Owl', emoji: '🦉', color: '#8B5CF6' },
  { id: 'fox', label: 'Quick Fox', emoji: '🦊', color: '#F97316' },
  { id: 'tiger', label: 'Brave Tiger', emoji: '🐯', color: '#EAB308' },
  { id: 'panda', label: 'Calm Panda', emoji: '🐼', color: '#06B6D4' },
  { id: 'lion', label: 'Royal Lion', emoji: '🦁', color: '#EF4444' },
  { id: 'astro', label: 'Astro', emoji: '🚀', color: '#3B82F6' },
  { id: 'gem', label: 'Emerald Gem', emoji: '💎', color: '#34E0A1' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user: authUser, updateUser } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { data: profile, isLoading: isProfileLoading, refetch } = useProfileQuery();
  const updateMutation = useUpdateProfileMutation();

  const [name, setName] = useState(profile?.name || authUser?.name || '');
  const [phone, setPhone] = useState(profile?.phone || authUser?.phone || '');
  const [email, setEmail] = useState(profile?.email || authUser?.email || '');
  const [bio, setBio] = useState(profile?.bio || authUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || authUser?.avatarUrl || '');

  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setEmail(profile.email || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatarUrl || '');
    }
  }, [profile]);

  const handleSelectPresetAvatar = (avatarId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setAvatarUrl(`preset:${avatarId}`);
    setAvatarModalVisible(false);
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setAvatarUrl(customUrlInput.trim());
      setCustomUrlInput('');
      setShowCustomUrlInput(false);
      setAvatarModalVisible(false);
    }
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res: UserProfileResponse = await updateMutation.mutateAsync({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl ? avatarUrl : null,
      });

      // Update auth context
      await updateUser({
        name: res.user.name,
        phone: res.user.phone,
        email: res.user.email,
        bio: res.user.bio,
        avatarUrl: res.user.avatarUrl,
      });

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      setSuccessMessage('Profile saved successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update profile. Please check your network.');
    }
  };

  // Render avatar graphic
  const renderAvatarContent = () => {
    if (avatarUrl?.startsWith('preset:')) {
      const presetId = avatarUrl.replace('preset:', '');
      const preset = PRESET_AVATARS.find((a) => a.id === presetId);
      return (
        <View style={[styles.avatarCircle, { backgroundColor: `${preset?.color || Colors.primary}20` }]}>
          <Text style={styles.presetEmojiText}>{preset?.emoji || '🌿'}</Text>
        </View>
      );
    }

    if (avatarUrl && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))) {
      return (
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatarImage}
          resizeMode="cover"
        />
      );
    }

    if (name.trim()) {
      const initials = name
        .trim()
        .split(' ')
        .map((p: string) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      return (
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitialsText}>{initials}</Text>
        </View>
      );
    }

    return (
      <View style={styles.avatarCircle}>
        <MiniLedgerLogo size={44} withGlow={false} />
      </View>
    );
  };

  return (
    <Screen scrollable contentContainerStyle={styles.container}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>My Profile</Text>
        <TouchableOpacity
          style={[styles.themePillBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={toggleTheme}
          activeOpacity={0.75}
        >
          {isDark ? (
            <Sun size={17} color={colors.warning} />
          ) : (
            <Moon size={17} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Avatar Header & Edit Trigger */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          {renderAvatarContent()}
          <TouchableOpacity
            style={[styles.cameraBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}
            activeOpacity={0.8}
            onPress={() => setAvatarModalVisible(true)}
          >
            <Camera size={14} color="#000" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.changeAvatarBtn,
            {
              backgroundColor: isDark ? 'rgba(52, 224, 161, 0.08)' : 'rgba(5, 150, 105, 0.08)',
              borderColor: isDark ? 'rgba(52, 224, 161, 0.2)' : 'rgba(5, 150, 105, 0.2)',
            },
          ]}
          onPress={() => setAvatarModalVisible(true)}
          activeOpacity={0.7}
        >
          <Sparkles size={14} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.changeAvatarText, { color: colors.primary }]}>Change Avatar</Text>
        </TouchableOpacity>

        <Text style={[styles.avatarUserGreeting, { color: colors.textPrimary }]}>
          {name.trim() || 'MiniLedger Member'}
        </Text>
        <Text style={[styles.avatarUserPhone, { color: colors.textSecondary }]}>{phone || authUser?.phone}</Text>
      </View>

      {/* Success Banner */}
      {successMessage && (
        <View style={styles.successBanner}>
          <CheckCircle2 size={16} color={colors.primary} />
          <Text style={[styles.successBannerText, { color: colors.primary }]}>{successMessage}</Text>
        </View>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={[styles.errorBannerText, { color: colors.danger }]}>{errorMessage}</Text>
        </View>
      )}

      {/* Form Fields */}
      <View style={styles.formContainer}>
        {/* Full Name */}
        <View style={styles.formGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Full Name</Text>
          <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            <User size={16} color={colors.textMuted} style={styles.fieldIcon} />
            <TextInput
              style={[styles.textInput, { color: colors.textPrimary }]}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor={isDark ? '#5E6F80' : '#94A3B8'}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Phone Number */}
        <View style={styles.formGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Phone Number</Text>
          <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            <Phone size={16} color={colors.textMuted} style={styles.fieldIcon} />
            <TextInput
              style={[styles.textInput, { color: colors.textPrimary }]}
              placeholder="+91 98765 43210"
              placeholderTextColor={isDark ? '#5E6F80' : '#94A3B8'}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>

        {/* Email Address */}
        <View style={styles.formGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Email Address <Text style={[styles.optionalText, { color: colors.textMuted }]}>(optional)</Text>
          </Text>
          <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            <Mail size={16} color={colors.textMuted} style={styles.fieldIcon} />
            <TextInput
              style={[styles.textInput, { color: colors.textPrimary }]}
              placeholder="e.g. rahul@example.com"
              placeholderTextColor={isDark ? '#5E6F80' : '#94A3B8'}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* Bio / Memo */}
        <View style={styles.formGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Personal Note / Bio <Text style={[styles.optionalText, { color: colors.textMuted }]}>(optional)</Text>
          </Text>
          <View style={[styles.inputBox, styles.inputBoxMultiline, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            <FileText size={16} color={colors.textMuted} style={styles.fieldIconMultiline} />
            <TextInput
              style={[styles.textInput, styles.textInputMultiline, { color: colors.textPrimary }]}
              placeholder="e.g. Tracking friendly debts with friends & flatmates."
              placeholderTextColor={isDark ? '#5E6F80' : '#94A3B8'}
              multiline
              numberOfLines={2}
              maxLength={200}
              value={bio}
              onChangeText={setBio}
            />
          </View>
        </View>
      </View>

      {/* Account Info Stats Card */}
      <View
        style={[
          styles.statsCard,
          {
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
          },
        ]}
      >
        <Text style={[styles.statsCardTitle, { color: colors.textPrimary }]}>Account Overview</Text>

        <View style={styles.statsRow}>
          <View style={styles.statsCol}>
            <View style={[styles.statsIconCircle, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceElevated }]}>
              <Wallet size={15} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.statsLabel, { color: colors.textMuted }]}>Total Loans</Text>
              <Text style={[styles.statsValue, { color: colors.textPrimary }]}>{profile?.totalLoans ?? 0} recorded</Text>
            </View>
          </View>

          <View style={styles.statsCol}>
            <View style={[styles.statsIconCircle, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceElevated }]}>
              <Calendar size={15} color="#60A5FA" />
            </View>
            <View>
              <Text style={[styles.statsLabel, { color: colors.textMuted }]}>Member Since</Text>
              <Text style={[styles.statsValue, { color: colors.textPrimary }]}>
                {profile?.createdAt ? formatDate(profile.createdAt) : 'Recently'}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.verifiedRow,
            { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border },
          ]}
        >
          <ShieldCheck size={14} color={colors.primary} />
          <Text style={[styles.verifiedText, { color: colors.primary }]}>Account verified with OTP login</Text>
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.actionSection}>
        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={updateMutation.isPending}
          variant="primary"
          size="lg"
        />
      </View>

      {/* Choose Avatar Modal */}
      <Modal
        visible={avatarModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAvatarModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalSheet,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Choose Avatar</Text>
                  <TouchableOpacity
                    onPress={() => setAvatarModalVisible(false)}
                    style={styles.modalCloseButton}
                  >
                    <X size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Select a friendly mascot or provide an image URL.
                </Text>

                {/* Preset Avatars Grid */}
                <View style={styles.avatarGrid}>
                  {PRESET_AVATARS.map((avatar) => {
                    const isSelected = avatarUrl === `preset:${avatar.id}`;
                    return (
                      <TouchableOpacity
                        key={avatar.id}
                        style={[
                          styles.presetItem,
                          isSelected && styles.presetItemActive,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleSelectPresetAvatar(avatar.id)}
                      >
                        <View
                          style={[
                            styles.presetCircle,
                            { backgroundColor: `${avatar.color}25` },
                            isSelected && { borderColor: colors.primary, borderWidth: 2 },
                          ]}
                        >
                          <Text style={styles.presetEmojiLarge}>{avatar.emoji}</Text>
                        </View>
                        <Text style={[styles.presetLabel, { color: colors.textSecondary }]}>
                          {avatar.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Custom URL Option */}
                {showCustomUrlInput ? (
                  <View style={styles.customUrlBox}>
                    <TextInput
                      style={[
                        styles.customUrlInput,
                        {
                          backgroundColor: colors.inputBg,
                          borderColor: colors.inputBorder,
                          color: colors.textPrimary,
                        },
                      ]}
                      placeholder="Paste image URL (https://...)"
                      placeholderTextColor={isDark ? '#5E6F80' : '#94A3B8'}
                      value={customUrlInput}
                      onChangeText={setCustomUrlInput}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={[styles.applyUrlBtn, { backgroundColor: colors.primary }]}
                      onPress={handleApplyCustomUrl}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.applyUrlText, { color: colors.textInverse }]}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.customUrlTrigger}
                    onPress={() => setShowCustomUrlInput(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.customUrlTriggerText, { color: colors.primary }]}>
                      Or use a custom Image URL
                    </Text>
                  </TouchableOpacity>
                )}
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
    paddingBottom: 40,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    ...Typography.h3,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  themePillBtn: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(52, 224, 161, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(52, 224, 161, 0.35)',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: Radii.full,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  presetEmojiText: {
    fontSize: 42,
  },
  avatarInitialsText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  changeAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 224, 161, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.full,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(52, 224, 161, 0.2)',
  },
  changeAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  avatarUserGreeting: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  avatarUserPhone: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 224, 161, 0.12)',
    padding: 12,
    borderRadius: Radii.md,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 224, 161, 0.3)',
  },
  successBannerText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 99, 112, 0.12)',
    padding: 12,
    borderRadius: Radii.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 112, 0.25)',
  },
  errorBannerText: {
    fontSize: 13,
    color: Colors.danger,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  optionalText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '400',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1822',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#19283B',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  fieldIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    paddingVertical: 10,
  },
  inputBoxMultiline: {
    alignItems: 'flex-start',
    minHeight: 70,
    paddingTop: 6,
  },
  fieldIconMultiline: {
    marginRight: 8,
    marginTop: 8,
  },
  textInputMultiline: {
    textAlignVertical: 'top',
    paddingVertical: 6,
    minHeight: 56,
  },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 24,
  },
  statsCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statsIconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  statsValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  verifiedText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
  },
  actionSection: {
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0F1822',
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    padding: 24,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: '#19283B',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 18,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    marginBottom: 20,
  },
  presetItem: {
    width: '23%',
    alignItems: 'center',
  },
  presetItemActive: {
    transform: [{ scale: 1.05 }],
  },
  presetCircle: {
    width: 60,
    height: 60,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  presetEmojiLarge: {
    fontSize: 28,
  },
  presetLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  customUrlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  customUrlInput: {
    flex: 1,
    backgroundColor: '#0A121A',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#19283B',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 13,
  },
  applyUrlBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.md,
  },
  applyUrlText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  customUrlTrigger: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  customUrlTriggerText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
});
