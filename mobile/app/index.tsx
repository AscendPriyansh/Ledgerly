import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/features/auth/AuthContext';
import { Colors, Radii, Spacing, Typography } from '../src/constants/theme';
import { MiniLedgerLogo } from '../src/components/MiniLedgerLogo';
import { MascotIllustration } from '../src/components/MascotIllustration';

export default function StartupGateScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(app)/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, router]);

  return (
    <View style={styles.container}>
      {/* Top Branding Section */}
      <View style={styles.topSection}>
        <MiniLedgerLogo size={64} style={styles.logo} />
        <Text style={styles.brandTitle}>MiniLedger</Text>
        <Text style={styles.tagline}>Small loans. Big trust.</Text>
        <Text style={styles.description}>
          Track money you lend, never lose track of a friend.
        </Text>
      </View>

      {/* Mascot Cliff Illustration matching reference Panel 1 */}
      <View style={styles.illustrationWrapper}>
        <MascotIllustration height={260} />
      </View>

      {/* Bottom Loading Progress Pill */}
      <View style={styles.bottomBar}>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    paddingTop: 80,
  },
  topSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logo: {
    marginBottom: Spacing.md,
  },
  brandTitle: {
    ...Typography.h1,
    fontSize: 32,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 18,
  },
  illustrationWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  progressTrack: {
    width: 64,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    width: '60%',
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
  },
});
