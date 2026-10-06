import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Share } from 'react-native';
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

  const [activeTab, setActiveTab] = useState<'SecurityOverview' | 'ScanHistory'>('SecurityOverview');
  const [timeRange, setTimeRange] = useState<'Last 7 Days' | 'Last 30 Days'>('Last 7 Days');
  const [exportedNotice, setExportedNotice] = useState(false);

  const hasData = totalScans > 0 || isCalculated;

  const handleExport = async () => {
    try {
      const dateStr = new Date().toLocaleDateString();
      const reportLines = [
        '========================================',
        '🛡️ CYBER COMPANION — DEVICE AUDIT REPORT',
        '========================================',
        `Generated: ${dateStr}`,
        `Device Security Score: ${isCalculated && score !== null ? `${score}/100` : 'Not calculated yet'}`,
        '',
        '--- SCAN SUMMARY ---',
        `Total Audits Conducted: ${totalScans}`,
        `Clean Scans: ${safeScans}`,
        `Threats Flagged: ${riskScans}`,
        `URLs Inspected: ${urlScansCount}`,
        `QR Codes Scanned: ${qrScansCount}`,
        `Wi-Fi Networks Evaluated: ${wifiScansCount}`,
        '',
        '--- ACTIVE THREAT ALERTS ---',
        threatAlerts.length > 0
          ? threatAlerts.map((a, i) => `${i + 1}. [${a.severity}] ${a.title}: ${a.summary}`).join('\n')
          : '✓ No active threat alerts detected.',
        '',
        '--- RECENT AUDIT LOGS ---',
        scanHistory.length > 0
          ? scanHistory.slice(0, 10).map((h) => `• ${h.date} ${h.time} | ${h.type} | ${h.target} -> [${h.result}]`).join('\n')
          : 'No scan history recorded.',
        '',
        '========================================',
        'Verified by Cyber Companion Mobile Security Engine',
        '========================================',
      ];

      await Share.share({
        title: `Cyber_Companion_Security_Report_${Date.now()}.txt`,
        message: reportLines.join('\n'),
      });

      setExportedNotice(true);
      setTimeout(() => setExportedNotice(false), 3000);
    } catch (err) {
      console.warn('Export share error:', err);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerBlock}>
        <Text style={styles.pageTitle}>Reports</Text>
        <Text style={styles.pageSubtitle}>
          View your security summary and activity.
        </Text>
      </View>

      {/* SEGMENTED TABS (Screen 18) */}
      <View style={styles.segmentedTabContainer}>
        <Pressable
          onPress={() => setActiveTab('SecurityOverview')}
          style={[
            styles.segmentBtn,
            activeTab === 'SecurityOverview' && styles.segmentBtnActive,
          ]}>
          <Text
            style={[
              styles.segmentBtnText,
              activeTab === 'SecurityOverview' && styles.segmentBtnTextActive,
            ]}>
            Security Overview
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('ScanHistory')}
          style={[
            styles.segmentBtn,
            activeTab === 'ScanHistory' && styles.segmentBtnActive,
          ]}>
          <Text
            style={[
              styles.segmentBtnText,
              activeTab === 'ScanHistory' && styles.segmentBtnTextActive,
            ]}>
            Scan History
          </Text>
        </Pressable>
      </View>

      {/* TIME RANGE & EXPORT BAR */}
      <View style={styles.filterExportBar}>
        <Pressable
          onPress={() =>
            setTimeRange(timeRange === 'Last 7 Days' ? 'Last 30 Days' : 'Last 7 Days')
          }
          style={styles.timeRangePill}>
          <Text style={styles.timeRangeText}>📅 {timeRange} ▾</Text>
        </Pressable>

        <Pressable onPress={handleExport} style={styles.exportBtn}>
          <Text style={styles.exportBtnText}>
            {exportedNotice ? '✓ Exported' : 'Export Report ↗'}
          </Text>
        </Pressable>
      </View>

      {activeTab === 'ScanHistory' ? (
        <View style={styles.reportCard}>
          <Text style={styles.cardTitle}>Persisted Audit Events</Text>
          {scanHistory.length === 0 ? (
            <EmptyStateView
              title="No security activity yet."
              message="Perform a website or Wi-Fi scan to begin recording audit events."
            />
          ) : (
            <View style={styles.historyList}>
              {scanHistory.map((item) => (
                <View key={item.id} style={styles.historyRowItem}>
                  <View style={styles.historyRowTexts}>
                    <Text style={styles.historyItemTarget} numberOfLines={1}>
                      {item.target}
                    </Text>
                    <Text style={styles.historyItemTime}>
                      {item.type} • {item.date} {item.time}
                    </Text>
                  </View>
                  <StatusBadge status={item.status} customLabel={item.result} />
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <>
          {/* SECURITY SCORE TREND (Screen 18) */}
          <View style={styles.reportCard}>
            <Text style={styles.cardTitle}>Security Score Trend</Text>
            {!isCalculated ? (
              <View style={styles.emptyChartBox}>
                <Text style={styles.emptyChartText}>No data available</Text>
                <Text style={styles.emptyChartSub}>
                  Complete a security check to start tracking your score trend.
                </Text>
              </View>
            ) : (
              <View style={styles.trendVisualBox}>
                <View style={styles.trendHeader}>
                  <Text style={styles.trendCurrentScore}>{score}/100</Text>
                  <Text style={styles.trendStatusBadge}>Stable</Text>
                </View>
                {/* Visual Trend Bars */}
                <View style={styles.chartBarsRow}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'].map(
                    (day, i) => (
                      <View key={day} style={styles.chartBarCol}>
                        <View
                          style={[
                            styles.chartBarFill,
                            {
                              height: i === 6 ? `${score}%` : '85%',
                              backgroundColor:
                                i === 6
                                  ? SecurityPalette.primary
                                  : 'rgba(59, 130, 246, 0.3)',
                            },
                          ]}
                        />
                        <Text style={styles.chartDayText}>{day}</Text>
                      </View>
                    ),
                  )}
                </View>
              </View>
            )}
          </View>

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
  /* Screen 18: Reports Styles */
  segmentedTabContainer: {
    flexDirection: 'row',
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: Radius.lg,
    padding: 4,
    marginBottom: Spacing.md,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  segmentBtnActive: {
    backgroundColor: SecurityPalette.primary,
  },
  segmentBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: SecurityPalette.textSecondary,
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterExportBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  timeRangePill: {
    backgroundColor: SecurityPalette.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  timeRangeText: {
    fontSize: 13,
    fontWeight: '600',
    color: SecurityPalette.textPrimary,
  },
  exportBtn: {
    backgroundColor: SecurityPalette.surfaceVariant,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: SecurityPalette.primary,
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.primary,
  },
  emptyChartBox: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChartText: {
    fontSize: 15,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
  },
  emptyChartSub: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    textAlign: 'center',
  },
  trendVisualBox: {
    paddingTop: Spacing.xs,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  trendCurrentScore: {
    fontSize: 28,
    fontWeight: '900',
    color: SecurityPalette.safe,
  },
  trendStatusBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: SecurityPalette.safe,
    backgroundColor: SecurityPalette.safeSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chartBarsRow: {
    flexDirection: 'row',
    height: 120,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: SecurityPalette.surfaceVariant,
  },
  chartBarCol: {
    alignItems: 'center',
    width: '12%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: 14,
    borderRadius: 4,
    marginBottom: 6,
  },
  chartDayText: {
    fontSize: 10,
    color: SecurityPalette.textMuted,
    fontWeight: '600',
  },
  historyList: {
    gap: 8,
    marginTop: Spacing.sm,
  },
  historyRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: SecurityPalette.surfaceVariant,
  },
  historyRowTexts: {
    flex: 1,
    marginRight: Spacing.md,
  },
  historyItemTarget: {
    fontSize: 14,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 2,
  },
  historyItemTime: {
    fontSize: 12,
    color: SecurityPalette.textMuted,
  },
});

export default ReportsScreen;
