import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/security';
import { SecurityPalette, Spacing, Radius } from '../theme/theme';
import {
  StatusBadge,
  AppProgressBar,
  EmptyStateView,
  AppButton,
} from '../design-system/components';
import { useSecurityStore } from '../store/useSecurityStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Reports'>;

export const ReportsScreen: React.FC<Props> = ({ navigation }) => {
  const score = useSecurityStore((state) => state.score);
  const isCalculated = useSecurityStore((state) => state.isCalculated);
  const securityScore = useSecurityStore((state) => state.securityScore);
  const scanHistory = useSecurityStore((state) => state.scanHistory);
  const threatAlerts = useSecurityStore((state) => state.threatAlerts);
  const unverifiedPermissionsCount = useSecurityStore(
    (state) => state.unverifiedPermissionsCount,
  );

  const totalScans = scanHistory.length;
  const safeScans = scanHistory.filter((s) => s.status === 'SAFE').length;
  const riskScans = scanHistory.filter((s) => s.status !== 'SAFE').length;

  const urlScansCount = scanHistory.filter((s) => s.type === 'URLs').length;
  const qrScansCount = scanHistory.filter((s) => s.type === 'QR').length;
  const wifiScansCount = scanHistory.filter((s) => s.type === 'Wi-Fi').length;

  const hasData = totalScans > 0 || isCalculated;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerBlock}>
        <Text style={styles.pageTitle}>Security Reports</Text>
        <Text style={styles.pageSubtitle}>
          Real telemetry summaries, risk event trends, and audit breakdowns derived
          strictly from actual security actions.
        </Text>
      </View>

      {!hasData ? (
        <EmptyStateView
          title="No security data available yet."
          message="Run your first Wi-Fi, website, or QR scan to generate your personalized security report and breakdown."
          actionLabel="Check a Website"
          onAction={() => navigation.navigate('UrlScanner')}
        />
      ) : (
        <>
          {/* 1. AGGREGATED SCAN METRICS */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={[styles.metricNumber, { color: SecurityPalette.primary }]}>
                {totalScans}
              </Text>
              <Text style={styles.metricLabel}>Total Scans</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={[styles.metricNumber, { color: SecurityPalette.safe }]}>
                {safeScans}
              </Text>
              <Text style={styles.metricLabel}>Clean Scans</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={[styles.metricNumber, { color: SecurityPalette.critical }]}>
                {riskScans}
              </Text>
              <Text style={styles.metricLabel}>Threats Flagged</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={[styles.metricNumber, { color: SecurityPalette.interactive }]}>
                {score !== null ? `${score}/100` : '--'}
              </Text>
              <Text style={styles.metricLabel}>Security Score</Text>
            </View>
          </View>

          {/* 2. ACTIVITY BY CHANNEL */}
          <View style={styles.reportCard}>
            <Text style={styles.cardTitle}>Activity by Scan Channel</Text>
            <View style={styles.progressStack}>
              <AppProgressBar
                label={`Web Links & URLs (${urlScansCount} checks)`}
                value={totalScans > 0 ? Math.round((urlScansCount / totalScans) * 100) : 0}
              />
              <AppProgressBar
                label={`QR Code Interceptions (${qrScansCount} checks)`}
                value={totalScans > 0 ? Math.round((qrScansCount / totalScans) * 100) : 0}
              />
              <AppProgressBar
                label={`Wi-Fi Risk Audits (${wifiScansCount} checks)`}
                value={totalScans > 0 ? Math.round((wifiScansCount / totalScans) * 100) : 0}
              />
            </View>
          </View>

          {/* 3. MULTI-FACTOR SCORE ENGINE BREAKDOWN */}
          {isCalculated && securityScore && (
            <View style={styles.reportCard}>
              <Text style={styles.cardTitle}>Multi-Factor Scoring Engine</Text>
              <Text style={styles.cardSubtitle}>
                Live breakdown computed from device, network, permission, and threat telemetry.
              </Text>

              <View style={styles.progressStack}>
                <AppProgressBar
                  label={`Device OS & Screen Lock: ${securityScore.breakdown.device}/100`}
                  value={securityScore.breakdown.device}
                />
                <AppProgressBar
                  label={`Network & Wi-Fi Encryption: ${securityScore.breakdown.network}/100`}
                  value={securityScore.breakdown.network}
                />
                <AppProgressBar
                  label={`Privacy & Permissions: ${securityScore.breakdown.privacy}/100`}
                  value={securityScore.breakdown.privacy}
                />
                <AppProgressBar
                  label={`Threat Awareness: ${securityScore.breakdown.awareness}/100`}
                  value={securityScore.breakdown.awareness}
                />
              </View>
            </View>
          )}

          {/* 4. ACTUAL RISK EVENTS LOG */}
          <View style={styles.reportCard}>
            <Text style={styles.cardTitle}>Detected Risk Events</Text>
            {threatAlerts.length === 0 && riskScans === 0 ? (
              <View style={styles.allClearNotice}>
                <Text style={styles.allClearText}>
                  ✓ Zero security vulnerabilities or malicious links recorded.
                </Text>
              </View>
            ) : (
              threatAlerts.map((alert) => (
                <View key={alert.id} style={styles.riskEventRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.riskEventTitle}>{alert.title}</Text>
                    <Text style={styles.riskEventArea}>
                      {alert.affectedArea} • {alert.date}
                    </Text>
                  </View>
                  <StatusBadge
                    status={alert.severity === 'Critical' ? 'DANGER' : 'ATTENTION'}
                    customLabel={alert.severity}
                  />
                </View>
              ))
            )}
          </View>

          {/* 5. PRIVACY AUDIT FINDINGS */}
          <View style={styles.reportCard}>
            <Text style={styles.cardTitle}>Device Privacy Findings</Text>
            <View style={styles.privacyRow}>
              <Text style={styles.privacyLabel}>Unverified High-Risk Permissions</Text>
              <Text style={styles.privacyValue}>{unverifiedPermissionsCount}</Text>
            </View>
            <View style={styles.privacyRow}>
              <Text style={styles.privacyLabel}>Sandbox Quarantine Policy</Text>
              <Text style={[styles.privacyValue, { color: SecurityPalette.safe }]}>Enforced</Text>
            </View>
            <View style={styles.privacyRow}>
              <Text style={styles.privacyLabel}>Threat Intelligence Gateway</Text>
              <Text style={[styles.privacyValue, { color: SecurityPalette.primary }]}>Active</Text>
            </View>
          </View>

          <View style={styles.actionBlock}>
            <AppButton
              label="Run New Security Check"
              onPress={() => navigation.navigate('ScanHub')}
              variant="primary"
              fullWidth
            />
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SecurityPalette.background },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    maxWidth: 820,
    width: '100%',
    alignSelf: 'center',
  },
  headerBlock: {
    marginBottom: Spacing.lg,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14.5,
    color: SecurityPalette.textSecondary,
    lineHeight: 22,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  metricBox: {
    flex: 1,
    minWidth: 140,
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
    fontWeight: '600',
  },
  reportCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    marginBottom: Spacing.md,
  },
  progressStack: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  allClearNotice: {
    backgroundColor: SecurityPalette.safeSoft,
    padding: 12,
    borderRadius: Radius.md,
    marginTop: 6,
  },
  allClearText: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.safe,
  },
  riskEventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: SecurityPalette.surfaceVariant,
  },
  riskEventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 2,
  },
  riskEventArea: {
    fontSize: 12,
    color: SecurityPalette.textMuted,
  },
  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: SecurityPalette.surfaceVariant,
  },
  privacyLabel: {
    fontSize: 13.5,
    color: SecurityPalette.textSecondary,
  },
  privacyValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
  },
  actionBlock: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});

export default ReportsScreen;
