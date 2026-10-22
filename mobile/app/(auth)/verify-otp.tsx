import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Delete, RotateCcw, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Screen } from '../../src/components/Screen';
import { Radii, Spacing, Typography } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { authApi } from '../../src/api/auth';
import { useAuth } from '../../src/features/auth/AuthContext';
import { ApiError } from '../../src/api/client';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{ phone: string }>();
  const phone = params.phone || '+91 98765 43210';
  const { login } = useAuth();

  const [otp, setOtp] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(56);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleKeyPress = (num: string) => {
    if (otp.length >= 6) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const newOtp = otp + num;
    setOtp(newOtp);
    if (newOtp.length === 6) {
      verifyCode(newOtp);
    }
  };

  const handleDelete = () => {
    if (otp.length === 0) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setOtp(otp.slice(0, -1));
  };

  const verifyCode = async (codeToVerify: string) => {
    setIsVerifying(true);
    setApiError(null);

    try {
      const response = await authApi.verifyOtp(phone, codeToVerify);
      await login(response.token, response.user);
      router.replace('/(app)/(tabs)');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError(err?.message || 'Verification failed. Please check the code.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const onResend = async () => {
    if (resendCooldown > 0) return;
    setApiError(null);
    try {
      await authApi.requestOtp(phone);
      setResendCooldown(60);
    } catch (err: any) {
      setApiError(err?.message || 'Failed to resend OTP.');
    }
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      {/* Top back navigation */}
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Verify your number</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          We've sent a 6-digit code to{'\n'}
          <Text style={[styles.phoneHighlight, { color: colors.textPrimary }]}>{phone}</Text>
        </Text>
      </View>

      {/* 6 Digit Input Boxes */}
      <View style={styles.otpBoxesRow}>
        {Array.from({ length: 6 }).map((_, index) => {
          const digit = otp[index] || '';
          const isCurrent = otp.length === index;

          return (
            <View
              key={index}
              style={[
                styles.otpBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                isCurrent && {
                  borderColor: colors.primary,
                  backgroundColor: colors.primary + '14',
                },
                !!digit && {
                  borderColor: colors.primary,
                  backgroundColor: colors.primary + '1F',
                },
              ]}
            >
              <Text style={[styles.otpDigit, { color: colors.primary }]}>{digit}</Text>
            </View>
          );
        })}
      </View>

      {apiError && (
        <View style={[styles.errorBanner, { backgroundColor: colors.danger + '1A' }]}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{apiError}</Text>
        </View>
      )}

      {/* Resend Link */}
      <View style={styles.resendRow}>
        <Text style={[styles.resendPrompt, { color: colors.textSecondary }]}>Didn't receive the code? </Text>
        {resendCooldown > 0 ? (
          <Text style={[styles.resendCountdown, { color: colors.primary }]}>Resend ({resendCooldown}s)</Text>
        ) : (
          <TouchableOpacity onPress={onResend}>
            <Text style={[styles.resendActive, { color: colors.primary }]}>Resend OTP</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {[
          ['1', ''],
          ['2', 'ABC'],
          ['3', 'DEF'],
          ['4', 'GHI'],
          ['5', 'JKL'],
          ['6', 'MNO'],
          ['7', 'PQRS'],
          ['8', 'TUV'],
          ['9', 'WXYZ'],
        ].map(([digit, letters]) => (
          <TouchableOpacity
            key={digit}
            style={[
              styles.keypadKey,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => handleKeyPress(digit)}
            activeOpacity={0.65}
          >
            <Text style={[styles.keyDigit, { color: colors.textPrimary }]}>{digit}</Text>
            {letters ? <Text style={[styles.keyLetters, { color: colors.textMuted }]}>{letters}</Text> : null}
          </TouchableOpacity>
        ))}

        <View style={styles.keypadKeyEmpty} />
        <TouchableOpacity
          style={[
            styles.keypadKey,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => handleKeyPress('0')}
          activeOpacity={0.65}
        >
          <Text style={[styles.keyDigit, { color: colors.textPrimary }]}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.keypadKey,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={handleDelete}
          activeOpacity={0.65}
        >
          <Delete size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 48,
    justifyContent: 'space-between',
  },
  topNav: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  backButton: {
    padding: 6,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    ...Typography.h2,
    fontSize: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  phoneHighlight: {
    fontWeight: '600',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 52,
    borderRadius: Radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigit: {
    fontSize: 20,
    fontWeight: '700',
  },
  errorBanner: {
    padding: 10,
    borderRadius: Radii.sm,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resendPrompt: {
    fontSize: 13,
  },
  resendCountdown: {
    fontSize: 13,
    fontWeight: '600',
  },
  resendActive: {
    fontSize: 13,
    fontWeight: '700',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  keypadKey: {
    width: '30%',
    height: 60,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  keypadKeyEmpty: {
    width: '30%',
    height: 60,
    marginBottom: 12,
  },
  keyDigit: {
    fontSize: 20,
    fontWeight: '700',
  },
  keyLetters: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.8,
  },
});
