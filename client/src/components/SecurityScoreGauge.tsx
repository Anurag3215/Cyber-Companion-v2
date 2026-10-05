import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';
import { useSecurityStore } from '../store/useSecurityStore';
import { getScoreVisualMeta, SecurityPalette } from '../theme/theme';

export interface SecurityScoreGaugeProps {
  readonly size?: number;
  readonly strokeWidth?: number;
  readonly scoreOverride?: number | null;
}

export const SecurityScoreGauge: React.FC<SecurityScoreGaugeProps> = ({
  size = 184,
  strokeWidth = 14,
  scoreOverride,
}) => {
  const storeScore = useSecurityStore((state) => state.score);
  const rawScore = scoreOverride !== undefined ? scoreOverride : storeScore;
  const isUncalculated = rawScore === null || rawScore === undefined;
  const normalizedScore = isUncalculated ? 0 : Math.max(0, Math.min(100, Math.round(rawScore)));

  const meta = isUncalculated
    ? {
        color: SecurityPalette.textSecondary,
        badgeBg: SecurityPalette.surfaceVariant,
        label: 'Pending Scan',
      }
    : getScoreVisualMeta(normalizedScore);

  const center = size / 2;
  const outerRingRadius = center - 4;
  const radius = (size - strokeWidth * 2 - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isUncalculated
    ? circumference
    : circumference - (normalizedScore / 100) * circumference;

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={
        isUncalculated
          ? 'Security score not calculated yet'
          : `Holistic Security Score ${normalizedScore} out of 100, status ${meta.label}`
      }
      accessibilityValue={{ min: 0, max: 100, now: normalizedScore }}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Subtle Outer Telemetry Ring */}
        <Circle
          cx={center}
          cy={center}
          r={outerRingRadius}
          stroke={SecurityPalette.border}
          strokeWidth={1}
          strokeDasharray="3 6"
          fill="transparent"
        />

        {/* Soft Ambient Halo Behind Progress Arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={meta.color}
          strokeOpacity={0.14}
          strokeWidth={strokeWidth + 8}
          fill="transparent"
        />

        {/* Track Ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={SecurityPalette.surfaceVariant}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Dynamic Semantic Progress Arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={meta.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>

      <View style={styles.centerContent}>
        <Text style={styles.caption}>SECURITY SCORE</Text>
        {isUncalculated ? (
          <View style={styles.uncalculatedBox}>
            <Text style={styles.uncalculatedText}>Not calculated yet</Text>
          </View>
        ) : (
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreNumber, { color: meta.color }]}>{normalizedScore}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
        )}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: meta.badgeBg, borderColor: meta.color },
          ]}>
          <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
          <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: SecurityPalette.textSecondary,
    marginBottom: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  scoreNumber: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  scoreMax: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    fontWeight: '700',
    marginLeft: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  uncalculatedBox: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 4,
  },
  uncalculatedText: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.textSecondary,
    textAlign: 'center',
  },
});

export default SecurityScoreGauge;
