import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, CyberAwarenessTip } from '../types/security';
import { useSecurityStore } from '../store/useSecurityStore';
import { SecurityScoreGauge } from '../components/SecurityScoreGauge';
import {
  WifiSignalIcon,
  GlobeLinkIcon,
  QrMatrixIcon,
  LockSlidersIcon,
  BulbSparkIcon,
} from '../components/SecurityIcons';
import {
  AppButton,
  AppProgressBar,
  StatusCard,
  QuickActionCard,
  ActivityItemRow,
  EmptyStateView,
  StatusBadge,
} from '../design-system/components';
import {
  getScoreVisualMeta,
  SecurityPalette,
  Spacing,
  Radius,
} from '../theme/theme';
import cyberTipsData from '../data/cyberTips.json';

type DashboardProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const typedTips = cyberTipsData as readonly CyberAwarenessTip[];

export const DashboardScreen: React.FC<DashboardProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const user = useSecurityStore((state) => state.user);
  const score = useSecurityStore((state) => state.score);
  const isCalculated = useSecurityStore((state) => state.isCalculated);
  const securityScore = useSecurityStore((state) => state.securityScore);
  const unverifiedPermissionsCount = useSecurityStore(
    (state) => state.unverifiedPermissionsCount,
  );
  const lastWifiAssessment = useSecurityStore((state) => state.lastWifiAssessment);
  const threatAlerts = useSecurityStore((state) => state.threatAlerts);
  const activityTimeline = useSecurityStore((state) => state.activityTimeline);
  const calculateLiveScore = useSecurityStore((state) => state.calculateLiveScore);
  const improveSecurityAutomatically = useSecurityStore(
    (state) => state.improveSecurityAutomatically,
  );

  const [tipIndex, setTipIndex] = useState(0);
  const currentTip = typedTips[tipIndex % typedTips.length];
  const firstName = user.fullName && user.fullName !== 'User' ? user.fullName.split(' ')[0] : 'there';
  const scoreMeta = score !== null ? getScoreVisualMeta(score) : null;

  const isWide = width >= 720;
  const quickCardWidth = isWide ? '23.5%' : '48%';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* 1. CALM PERSONAL HEADER */}
      <View style={styles.greetingHeader}>
        <View>
          <Text style={styles.greetingTitle}>
            Hello, {firstName} 👋
          </Text>
          <Text style={styles.greetingSubtitle}>
            Let's keep your device and identity secure.
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('CyberAssistant')}
          style={styles.assistantShortcut}>
          <Text style={styles.assistantShortcutText}>Ask Cyber AI</Text>
        </Pressable>
      </View>

      {/* 2. DYNAMIC SECURITY SCORE CARD */}
      <View style={styles.scoreSectionCard}>
        <View style={[styles.scoreMainRow, isWide && styles.scoreMainRowWide]}>
          <View style={styles.gaugeColumn}>
            <SecurityScoreGauge size={168} scoreOverride={score} />
            {isCalculated && scoreMeta ? (
              <>
                <Text style={[styles.scoreStatusLabel, { color: scoreMeta.color }]}>
                  {scoreMeta.symbol} {scoreMeta.label}
                </Text>
                <Text style={styles.scorePlainHeadline}>{scoreMeta.headline}</Text>
              </>
            ) : (
              <>
                <Text style={[styles.scoreStatusLabel, { color: SecurityPalette.textSecondary }]}>
                  ⚪ Security score unavailable
                </Text>
                <Text style={styles.scorePlainHeadline}>
                  Complete a security check to build your score.
                </Text>
              </>
            )}
          </View>

          <View style={styles.breakdownColumn}>
            <Text style={styles.breakdownHeading}>Security Breakdown</Text>
            {isCalculated && securityScore ? (
              <View style={styles.breakdownList}>
                <AppProgressBar
                  label="Permissions"
                  value={securityScore.breakdown.permissions}
                />
                <AppProgressBar
                  label="Device"
                  value={securityScore.breakdown.device}
                />
                <AppProgressBar
                  label="Network"
                  value={securityScore.breakdown.network}
                />
                <AppProgressBar
                  label="Privacy"
                  value={securityScore.breakdown.privacy}
                />
                <AppProgressBar
                  label="Awareness"
                  value={securityScore.breakdown.awareness}
                />
              </View>
            ) : (
              <View style={styles.emptyBreakdownBox}>
                <Text style={styles.emptyBreakdownText}>
                  Breakdown factors (Network, Device, Privacy, Awareness) will appear once your first check is complete.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.scoreFooterRow}>
          {threatAlerts.length > 0 ? (
            <>
              <Text style={styles.attentionBannerTitle}>
                ⚠️ {threatAlerts.length} item{threatAlerts.length > 1 ? 's' : ''} need{threatAlerts.length === 1 ? 's' : ''} your attention
              </Text>
              <Text style={styles.attentionBannerSubtitle}>
                {threatAlerts[0]?.title}
              </Text>
              <AppButton
                label="Improve Security"
                onPress={() => {
                  if (unverifiedPermissionsCount > 0) {
                    improveSecurityAutomatically();
                  } else {
                    navigation.navigate('ThreatAlerts');
                  }
                }}
                variant="primary"
                fullWidth
              />
            </>
          ) : (
            <>
              <Text style={[styles.attentionBannerTitle, { color: SecurityPalette.safe }]}>
                {isCalculated ? '✓ All checked areas are protected' : 'Ready for initial assessment'}
              </Text>
              <Text style={styles.attentionBannerSubtitle}>
                {isCalculated
                  ? 'No critical risks detected on active monitors.'
                  : 'Calculate your personalized security score now.'}
              </Text>
              <AppButton
                label={isCalculated ? 'Run Live Re-Check' : 'Run First Security Check'}
                onPress={() => calculateLiveScore()}
                variant={isCalculated ? 'secondary' : 'primary'}
                fullWidth
              />
            </>
          )}
        </View>
      </View>

      {/* 3. QUICK ACTIONS */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <View style={{ width: quickCardWidth }}>
            <QuickActionCard
              title="Check Website"
              subtitle="Verify any link before opening it"
              icon={<GlobeLinkIcon size={22} color={SecurityPalette.primary} />}
              onPress={() => navigation.navigate('UrlScanner')}
            />
          </View>
          <View style={{ width: quickCardWidth }}>
            <QuickActionCard
              title="Scan QR"
              subtitle="Inspect QR codes safely"
              icon={<QrMatrixIcon size={22} color={SecurityPalette.interactive} />}
              onPress={() => navigation.navigate('QrScanner')}
            />
          </View>
          <View style={{ width: quickCardWidth }}>
            <QuickActionCard
              title="Check Wi-Fi"
              subtitle="See if your Wi-Fi is private"
              icon={<WifiSignalIcon size={22} color={SecurityPalette.safe} />}
              onPress={() => navigation.navigate('WifiAnalyzer')}
            />
          </View>
          <View style={{ width: quickCardWidth }}>
            <QuickActionCard
              title="Permission Analyzer"
              subtitle="Audit sensitive app access & risks"
              icon={<LockSlidersIcon size={22} color={SecurityPalette.warning} />}
              onPress={() => navigation.navigate('PermissionAnalyzer')}
            />
          </View>
        </View>
      </View>

      {/* 4. CURRENT SECURITY STATUS */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderInline}>
          <Text style={styles.sectionTitle}>Current Security Status</Text>
          <Pressable onPress={() => navigation.navigate('SecurityCenter')}>
            <Text style={styles.sectionLink}>Open Security Center →</Text>
          </Pressable>
        </View>

        <StatusCard
          title="Device"
          subtitle="Operating system and hardware sensors protected"
          status="SAFE"
          statusLabel="✓ Good"
          onPress={() => navigation.navigate('DeviceSecurity')}
        />

        <StatusCard
          title="Network"
          subtitle={
            lastWifiAssessment
              ? `Current Wi-Fi: ${lastWifiAssessment.ssid}`
              : 'Wi-Fi not analyzed yet — tap to check network security'
          }
          status={
            lastWifiAssessment
              ? lastWifiAssessment.status
              : 'ATTENTION'
          }
          statusLabel={
            lastWifiAssessment
              ? lastWifiAssessment.status === 'SAFE'
                ? '✓ Good'
                : '⚠ Action needed'
              : 'Pending check'
          }
          onPress={() => navigation.navigate('WifiAnalyzer')}
        />

        <StatusCard
          title="Account"
          subtitle="Two-Factor Authentication is active"
          status="SAFE"
          statusLabel="✓ Good"
          onPress={() => navigation.navigate('PasswordSecurity')}
        />

        <StatusCard
          title="Privacy"
          subtitle={
            unverifiedPermissionsCount > 0
              ? `${unverifiedPermissionsCount} high-risk hardware permission(s) granted`
              : 'System permissions audited and restricted'
          }
          status={unverifiedPermissionsCount > 0 ? 'ATTENTION' : 'SAFE'}
          statusLabel={
            unverifiedPermissionsCount > 0 ? '⚠ Needs attention' : '✓ Good'
          }
          onPress={() => navigation.navigate('PermissionAnalyzer')}
        />
      </View>

      {/* 5. CURRENT ALERTS */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderInline}>
          <Text style={styles.sectionTitle}>Current Alerts</Text>
          <Pressable onPress={() => navigation.navigate('ThreatAlerts')}>
            <Text style={styles.sectionLink}>View all alerts →</Text>
          </Pressable>
        </View>

        {threatAlerts.length === 0 ? (
          <View style={styles.clearCard}>
            <Text style={styles.clearTitle}>✓ You're all clear.</Text>
            <Text style={styles.clearSubtitle}>
              No security threats, rogue networks, or dangerous permission combinations detected.
            </Text>
          </View>
        ) : (
          threatAlerts.slice(0, 2).map((alert) => (
            <Pressable
              key={alert.id}
              onPress={() => navigation.navigate('ThreatDetail', { alertId: alert.id })}
              style={styles.alertCard}>
              <View style={styles.alertHeaderRow}>
                <Text style={styles.alertCardTitle}>{alert.title}</Text>
                <StatusBadge
                  status={alert.severity === 'Critical' ? 'DANGER' : 'ATTENTION'}
                  customLabel={alert.severity}
                />
              </View>
              <Text style={styles.alertCardSummary}>{alert.summary}</Text>
              <Text style={styles.alertCardAction}>
                👉 {alert.explanation.whatShouldIDo[0]}
              </Text>
            </Pressable>
          ))
        )}
      </View>

      {/* 6. RECENT ACTIVITY */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderInline}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Pressable onPress={() => navigation.navigate('ActivityTimeline')}>
            <Text style={styles.sectionLink}>View timeline →</Text>
          </Pressable>
        </View>

        {activityTimeline.length === 0 ? (
          <EmptyStateView
            title="No scans yet"
            message="Run your first security check (Wi-Fi, website, or QR) to see real-time activity here."
            actionLabel="Check a Website"
            onAction={() => navigation.navigate('UrlScanner')}
          />
        ) : (
          <View style={styles.activityCard}>
            {activityTimeline.slice(0, 3).map((item) => (
              <ActivityItemRow
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                status={item.status}
                statusLabel={item.statusLabel}
                timestamp={item.timestamp}
                onPress={() =>
                  item.routeTarget
                    ? navigation.navigate(item.routeTarget as never)
                    : navigation.navigate('ActivityTimeline')
                }
              />
            ))}
          </View>
        )}
      </View>

      {/* 7. SECURITY RECOMMENDATIONS */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Security Recommendations</Text>
        <View style={styles.recommendationCard}>
          {!isCalculated ? (
            <Text style={styles.recommendationText}>
              • Run your first Wi-Fi or website scan to receive personalized recommendations based on live telemetry.
            </Text>
          ) : lastWifiAssessment && !lastWifiAssessment.isSafe ? (
            <Text style={styles.recommendationText}>
              • Switch to cellular data or use a VPN when connected to unencrypted public networks.
            </Text>
          ) : unverifiedPermissionsCount > 0 ? (
            <Text style={styles.recommendationText}>
              • Review background SMS and location permissions in the Permission Analyzer to prevent OTP leakage.
            </Text>
          ) : (
            <Text style={styles.recommendationText}>
              • You're doing great! Keep your operating system updated and verify unfamiliar links with Cyber Companion before opening.
            </Text>
          )}
        </View>
      </View>

      {/* 8. DAILY SECURITY TIP */}
      <View style={styles.sectionBlock}>
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <View style={styles.tipTagRow}>
              <BulbSparkIcon size={18} color={SecurityPalette.interactive} />
              <Text style={styles.tipTagText}>Daily Security Tip</Text>
            </View>
            <Pressable
              onPress={() =>
                setTipIndex((prev) => (prev + 1) % typedTips.length)
              }>
              <Text style={styles.sectionLink}>Next tip →</Text>
            </Pressable>
          </View>
          <Text style={styles.tipTitle}>{currentTip.title}</Text>
          <Text style={styles.tipBody}>{currentTip.body}</Text>
          <View style={styles.tipTakeawayBox}>
            <Text style={styles.tipTakeawayText}>
              ✓ {currentTip.actionableTakeaway}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SecurityPalette.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    maxWidth: 980,
    width: '100%',
    alignSelf: 'center',
  },
  greetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: SecurityPalette.textSecondary,
    marginTop: 2,
  },
  assistantShortcut: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  assistantShortcutText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: SecurityPalette.interactive,
  },
  scoreSectionCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.xl,
  },
  scoreMainRow: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  scoreMainRowWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },
  gaugeColumn: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  scoreStatusLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scorePlainHeadline: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  breakdownColumn: {
    width: '100%',
    maxWidth: 360,
  },
  breakdownHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  breakdownList: {
    gap: Spacing.sm,
  },
  emptyBreakdownBox: {
    backgroundColor: SecurityPalette.surfaceVariant,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  emptyBreakdownText: {
    fontSize: 12.5,
    color: SecurityPalette.textMuted,
    lineHeight: 18,
  },
  scoreFooterRow: {
    borderTopWidth: 1,
    borderTopColor: SecurityPalette.border,
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
  },
  attentionBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: SecurityPalette.warning,
    marginBottom: 2,
  },
  attentionBannerSubtitle: {
    fontSize: 12.5,
    color: SecurityPalette.textSecondary,
    marginBottom: Spacing.md,
  },
  sectionBlock: {
    marginBottom: Spacing.xl,
  },
  sectionHeaderInline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: Spacing.sm,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.primary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  clearCard: {
    backgroundColor: SecurityPalette.safeSoft,
    borderColor: SecurityPalette.safe,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  clearTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: SecurityPalette.safe,
    marginBottom: 4,
  },
  clearSubtitle: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    lineHeight: 18,
  },
  alertCard: {
    backgroundColor: SecurityPalette.surface,
    borderColor: SecurityPalette.border,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  alertCardSummary: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  alertCardAction: {
    fontSize: 12.5,
    fontWeight: '700',
    color: SecurityPalette.primary,
  },
  activityCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  recommendationCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  recommendationText: {
    fontSize: 13.5,
    color: SecurityPalette.textSecondary,
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: SecurityPalette.interactive,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tipTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 6,
  },
  tipBody: {
    fontSize: 13.5,
    color: SecurityPalette.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  tipTakeawayBox: {
    backgroundColor: SecurityPalette.safeSoft,
    padding: 10,
    borderRadius: Radius.md,
  },
  tipTakeawayText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: SecurityPalette.safe,
  },
});

export default DashboardScreen;
