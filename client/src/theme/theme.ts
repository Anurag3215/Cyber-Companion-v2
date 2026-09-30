import { MD3DarkTheme, MD3Theme } from 'react-native-paper';

export const SecurityPalette = {
  background: '#0A0F1D', // Deep Navy base
  surface: '#121A2D', // Elevated card surface
  surfaceVariant: '#19233C', // Secondary card / input container
  border: '#243252', // Subtle border hairline
  primary: '#38BDF8', // Calm Cyber Blue accent
  safe: '#00C853', // Emerald Green (80-100)
  warning: '#FFAB00', // Amber Orange (50-79)
  critical: '#D50000', // Crimson Red (0-49)
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
} as const;

export interface ScoreVisualMeta {
  readonly color: string;
  readonly badgeBg: string;
  readonly label: 'Safe' | 'Caution' | 'High Risk';
  readonly headline: string;
}

/**
 * Maps a normalized 0-100 security score to its semantic color and plain-language label.
 * - 80-100: Safe / Emerald Green (#00C853)
 * - 50-79: Caution / Amber Orange (#FFAB00)
 * - 0-49: High Risk / Crimson Red (#D50000)
 */
export const getScoreVisualMeta = (rawScore: number): ScoreVisualMeta => {
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  if (score >= 80) {
    return {
      color: SecurityPalette.safe,
      badgeBg: 'rgba(0, 200, 83, 0.14)',
      label: 'Safe',
      headline: 'Your digital environment looks healthy',
    };
  }

  if (score >= 50) {
    return {
      color: SecurityPalette.warning,
      badgeBg: 'rgba(255, 171, 0, 0.16)',
      label: 'Caution',
      headline: 'A few settings need your attention',
    };
  }

  return {
    color: SecurityPalette.critical,
    badgeBg: 'rgba(213, 0, 0, 0.18)',
    label: 'High Risk',
    headline: 'Immediate security action recommended',
  };
};

export const CyberCompanionTheme: MD3Theme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: SecurityPalette.primary,
    background: SecurityPalette.background,
    surface: SecurityPalette.surface,
    surfaceVariant: SecurityPalette.surfaceVariant,
    error: SecurityPalette.critical,
    onPrimary: '#061224',
    onBackground: SecurityPalette.textPrimary,
    onSurface: SecurityPalette.textPrimary,
    onSurfaceVariant: SecurityPalette.textSecondary,
    outline: SecurityPalette.border,
  },
};
