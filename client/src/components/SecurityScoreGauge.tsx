import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';
import { useSecurityStore } from '../store/useSecurityStore';
import { getScoreVisualMeta, SecurityPalette } from '../theme/theme';

export interface SecurityScoreGaugeProps {
  readonly size?: number;
  readonly strokeWidth?: number;
  readonly scoreOverride?: number;
}

export const SecurityScoreGauge: React.FC<SecurityScoreGaugeProps> = ({
  size = 168,
  strokeWidth = 14,
  scoreOverride,
}) => {
  const storeScore = useSecurityStore((state) => state.score);
  const rawScore = scoreOverride !== undefined ? scoreOverride : storeScore;
  const normalizedScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  const { color, badgeBg, label } = getScoreVisualMeta(normalizedScore);

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (normalizedScore / 100) * circumference;

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Holistic Security Score ${normalizedScore} out of 100, status ${label}`}
      accessibilityValue={{ min: 0, max: 100, now: normalizedScore }}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Track Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={SecurityPalette.surfaceVariant}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Foreground Progress Arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
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
        <Text style={[styles.scoreNumber, { color }]}>{normalizedScore}</Text>
        <Text style={styles.scoreScale}>/ 100</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: badgeBg, borderColor: color },
          ]}>
          <View style={[styles.statusDot, { backgroundColor: color }]} />
          <Text style={[styles.statusText, { color }]}>{label}</Text>
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
  scoreNumber: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 46,
  },
  scoreScale: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
    fontWeight: '600',
    marginTop: -2,
    marginBottom: 6,
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
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});

export default SecurityScoreGauge;
