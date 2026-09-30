import { MD3DarkTheme, MD3Theme } from 'react-native-paper';

/**
 * CYBER COMPANION — "CALM SECURITY" DESIGN SYSTEM TOKENS
 * Tagline: "Stay Safe. Simply."
 * Philosophy: The technology should be complex. The experience should be simple.
 */
export const SecurityPalette = {
  // Primary Surfaces (Deep Navy & Dark Slate)
  background: '#0B1221', // Deep Navy main application background
  surface: '#131D31', // Dark Slate elevated card surface
  surfaceVariant: '#1A2742', // Secondary interactive surface
  surfaceHover: '#213152', // Subtle hover/active state
  border: '#243454', // Calm hairline border (never neon)

  // Brand & Interactive Accents (Soft Blue & Cyan)
  primary: '#3B82F6', // Soft Blue — primary actions
  primarySoft: 'rgba(59, 130, 246, 0.14)',
  interactive: '#06B6D4', // Blue/Cyan — interactive elements
  interactiveSoft: 'rgba(6, 182, 212, 0.14)',

  // Semantic Security Status Colors
  safe: '#10B981', // Calm Emerald Green — Safe / Good
  safeSoft: 'rgba(16, 185, 129, 0.14)',
  warning: '#F59E0B', // Warm Amber — Needs attention / Suspicious
  warningSoft: 'rgba(245, 158, 11, 0.15)',
  critical: '#EF4444', // Clear Red — Dangerous / Action required
  criticalSoft: 'rgba(239, 68, 68, 0.15)',

  // Typography Colors
  textPrimary: '#F8FAFC', // Crisp White / Light Gray
  textSecondary: '#94A3B8', // Calm Slate Gray
  textMuted: '#64748B', // Muted metadata text
} as const;

/**
 * Consistent 8pt-based Spacing Scale (4 / 8 / 12 / 16 / 24 / 32 / 48px)
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const TypographyScale = {
  mobile: {
    pageTitle: 26,
    sectionTitle: 19,
    cardTitle: 16,
    body: 15,
    secondary: 13,
    caption: 12,
  },
  desktop: {
    pageTitle: 30,
    sectionTitle: 20,
    cardTitle: 17,
    body: 15,
    secondary: 13,
    caption: 12,
  },
} as const;

export interface ScoreVisualMeta {
  readonly color: string;
  readonly badgeBg: string;
  readonly label: 'Good Security' | 'Needs Attention' | 'Action Required';
  readonly shortLabel: 'Safe' | 'Attention' | 'Action Required';
  readonly symbol: '✓' | '⚠' | '●';
  readonly headline: string;
}

/**
 * Translates a 0-100 security score into calm, non-frightening human language.
 */
export const getScoreVisualMeta = (rawScore: number): ScoreVisualMeta => {
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  if (score >= 80) {
    return {
      color: SecurityPalette.safe,
      badgeBg: SecurityPalette.safeSoft,
      label: 'Good Security',
      shortLabel: 'Safe',
      symbol: '✓',
      headline: 'Your digital safety is in good shape.',
    };
  }

  if (score >= 50) {
    return {
      color: SecurityPalette.warning,
      badgeBg: SecurityPalette.warningSoft,
      label: 'Needs Attention',
      shortLabel: 'Attention',
      symbol: '⚠',
      headline: 'A few simple steps will strengthen your safety.',
    };
  }

  return {
    color: SecurityPalette.critical,
    badgeBg: SecurityPalette.criticalSoft,
    label: 'Action Required',
    shortLabel: 'Action Required',
    symbol: '●',
    headline: 'Some important security settings need your review.',
  };
};

export const CyberCompanionTheme: MD3Theme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: SecurityPalette.primary,
    secondary: SecurityPalette.interactive,
    background: SecurityPalette.background,
    surface: SecurityPalette.surface,
    surfaceVariant: SecurityPalette.surfaceVariant,
    error: SecurityPalette.critical,
    onPrimary: '#FFFFFF',
    onBackground: SecurityPalette.textPrimary,
    onSurface: SecurityPalette.textPrimary,
    onSurfaceVariant: SecurityPalette.textSecondary,
    outline: SecurityPalette.border,
  },
};
