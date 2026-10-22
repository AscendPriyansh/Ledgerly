import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Keyboard,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lightbulb, ArrowRight } from 'lucide-react-native';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { MiniLedgerLogo } from '../../src/components/MiniLedgerLogo';
import { Colors, Radii, Spacing, Typography } from '../../src/constants/theme';
import { phoneSchema, PhoneFormData } from '../../src/schemas';
import { authApi } from '../../src/api/auth';
import { ApiError } from '../../src/api/client';
import { useTheme } from '../../src/context/ThemeContext';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: '+919876543210',
    },
  });

  const onSubmit = async (data: PhoneFormData) => {
    Keyboard.dismiss();
    setApiError(null);

    try {
      let fullPhone = data.phone.trim();
      if (!fullPhone.startsWith('+')) {
        fullPhone = `+91${fullPhone.replace(/^0+/, '')}`;
      }

      const res = await authApi.requestOtp(fullPhone);
      const returnedOtp = res.mockOtp || res.otp;

      router.push({
        pathname: '/(auth)/verify-otp',
        params: {
          phone: fullPhone,
          ...(returnedOtp ? { mockOtp: returnedOtp } : {}),
        },
      });
    } catch (err: any) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError(err?.message || 'Failed to request OTP. Please check your network and server.');
      }
    }
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      {/* Brand Header matching reference Panel 2 */}
      <View style={styles.header}>
        <MiniLedgerLogo size={48} style={styles.logo} />
        <Text style={[styles.brandName, { color: colors.textPrimary }]}>MiniLedger</Text>

        <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome back!</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter your mobile number to get started.
        </Text>
      </View>

      {/* Input Group */}
      <View style={styles.formSection}>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <View
              style={[
                styles.phoneInputRow,
                { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                !!errors.phone && styles.inputError,
              ]}
            >
              <View style={styles.countryCodeBadge}>
                <Text style={styles.flagEmoji}>🇮🇳</Text>
                <Text style={[styles.countryCodeText, { color: colors.textPrimary }]}>+91</Text>
              </View>
              <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="98765 43210"
                placeholderTextColor={isDark ? '#5E6F80' : '#94A3B8'}
                keyboardType="phone-pad"
                autoComplete="tel"
                value={value.replace(/^\+91/, '')}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  onChange(`+91${cleaned}`);
                }}
              />
            </View>
          )}
        />

        {errors.phone && (
          <Text style={styles.errorText}>{errors.phone.message}</Text>
        )}

        {apiError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{apiError}</Text>
          </View>
        )}

        {/* Continue Button */}
        <Button
          title="Continue"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          variant="primary"
          size="lg"
          style={styles.continueButton}
        />

        {/* Tips card matching reference Panel 2 */}
        <View
          style={[
            styles.tipCard,
            {
              backgroundColor: isDark ? '#0C1622' : colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.tipIconCircle}>
            <Lightbulb size={16} color={colors.primary} />
          </View>
          <View style={styles.tipTextCol}>
            <Text style={[styles.tipTitle, { color: colors.textPrimary }]}>
              We'll send you a 6-digit OTP to your phone number.
            </Text>
            <Text style={[styles.tipSubtitle, { color: colors.textSecondary }]}>
              (Check your server terminal for the mock OTP during development)
            </Text>
          </View>
        </View>
      </View>

      {/* Version footer */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>1.1.0</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  logo: {
    marginBottom: Spacing.xs,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 28,
  },
  title: {
    ...Typography.h1,
    fontSize: 26,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  formSection: {
    marginTop: 28,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 52,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  flagEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginBottom: 12,
    marginLeft: 4,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 99, 112, 0.12)',
    padding: Spacing.md,
    borderRadius: Radii.sm,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 112, 0.25)',
  },
  errorBannerText: {
    fontSize: 13,
    color: Colors.danger,
    lineHeight: 18,
  },
  continueButton: {
    marginBottom: 24,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#0D1722',
    borderRadius: Radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(52, 224, 161, 0.18)',
    alignItems: 'flex-start',
  },
  tipIconCircle: {
    width: 28,
    height: 28,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(52, 224, 161, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  tipTextCol: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 17,
    marginBottom: 2,
  },
  tipSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  versionText: {
    fontSize: 12,
    color: '#4B5563',
  },
});
