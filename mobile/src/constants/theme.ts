export const DarkColors = {
  // Backgrounds matching reference
  background: '#090D14',
  surface: '#111A26',
  surfaceElevated: '#152232',
  surfaceCard: '#111B27',
  surfaceHover: '#1B2A3D',

  // Accent (Emerald Mint matching reference button #34E0A1)
  primary: '#34E0A1',
  primaryHover: '#2ED496',
  primaryMuted: 'rgba(52, 224, 161, 0.14)',
  primaryGlow: 'rgba(52, 224, 161, 0.28)',

  // Overdue / Danger (Coral red matching reference #FF6370)
  danger: '#FF6370',
  dangerMuted: 'rgba(255, 99, 112, 0.15)',
  dangerGlow: 'rgba(255, 99, 112, 0.28)',

  // Warning (Amber)
  warning: '#FFBF69',
  warningMuted: 'rgba(255, 191, 105, 0.15)',

  // Neutral Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8A9BAA',
  textMuted: '#5E6F80',
  textInverse: '#061510',

  // Borders
  border: '#1A283B',
  borderSubtle: 'rgba(255, 255, 255, 0.07)',
  borderActive: '#34E0A1',

  // Badges matching reference
  badgeOutstandingBg: 'rgba(52, 224, 161, 0.12)',
  badgeOutstandingText: '#34E0A1',
  badgeRepaidBg: 'rgba(52, 224, 161, 0.18)',
  badgeRepaidText: '#34E0A1',
  badgeOverdueBg: 'rgba(255, 99, 112, 0.16)',
  badgeOverdueText: '#FF6370',

  // Inputs & Cards
  inputBg: '#0F1822',
  inputBorder: '#19283B',
  cardBg: '#111A26',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
  chartTrack: '#142130',
  chartBarEmpty: '#141D28',
};

export const LightColors: typeof DarkColors = {
  // Clean, crisp slate canvas
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  surfaceCard: '#FFFFFF',
  surfaceHover: '#E2E8F0',

  // Vibrant Emerald with strong contrast on light canvas
  primary: '#059669',
  primaryHover: '#047857',
  primaryMuted: 'rgba(5, 150, 105, 0.12)',
  primaryGlow: 'rgba(5, 150, 105, 0.22)',

  // Crisp ruby red for overdue
  danger: '#E11D48',
  dangerMuted: 'rgba(225, 29, 72, 0.1)',
  dangerGlow: 'rgba(225, 29, 72, 0.2)',

  // Warning (Amber)
  warning: '#D97706',
  warningMuted: 'rgba(217, 119, 6, 0.12)',

  // Neutral Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E2E8F0',
  borderSubtle: 'rgba(0, 0, 0, 0.06)',
  borderActive: '#059669',

  // Badges
  badgeOutstandingBg: 'rgba(5, 150, 105, 0.1)',
  badgeOutstandingText: '#059669',
  badgeRepaidBg: 'rgba(5, 150, 105, 0.15)',
  badgeRepaidText: '#047857',
  badgeOverdueBg: 'rgba(225, 29, 72, 0.1)',
  badgeOverdueText: '#E11D48',

  // Inputs & Cards
  inputBg: '#F1F5F9',
  inputBorder: '#E2E8F0',
  cardBg: '#FFFFFF',
  cardBorder: 'rgba(0, 0, 0, 0.06)',
  chartTrack: '#E2E8F0',
  chartBarEmpty: '#E2E8F0',
};

export type ThemeColors = typeof DarkColors;
export const Colors: ThemeColors = DarkColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const Radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400' as const,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    color: Colors.textPrimary,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as const,
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  amountHero: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.8,
  },
  amountCard: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
};
