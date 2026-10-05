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
  const securityScore = useSecurityStore((state) => state.securityScore);
  const unverifiedPermissionsCount = useSecurityStore(
    (state) => state.unverifiedPermissionsCount,
  );
  const activityTimeline = useSecurityStore((state) => state.activityTimeline);
  const improveSecurityAutomatically = useSecurityStore(
    (state) => state.improveSecurityAutomatically,
  );

  const [tipIndex, setTipIndex] = useState(0);
  const currentTip = typedTips[tipIndex % typedTips.length];
  const firstName = user.fullName.split(' ')[0] || 'Friend';
  const scoreMeta = getScoreVisualMeta(score);

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
            Good morning, {firstName} 👋
          </Text>
          <Text style={styles.greetingSubtitle}>
            Let's keep you safe today.
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('CyberAssistant')}
          style={styles.assistantShortcut}>
          <Text style={styles.assistantShortcutText}>Ask Cyber Assistant</Text>
        </Pressable>
      </View>

      {/* 2. SECURITY SCORE OVERVIEW CARD */}
      <View style={styles.scoreSectionCard}>
        <View style={[styles.scoreMainRow, isWide && styles.scoreMainRowWide]}>
          <View style={styles.gaugeColumn}>
            <SecurityScoreGauge size={168} />
            <Text style={[styles.scoreStatusLabel, { color: scoreMeta.color }]}>
              {scoreMeta.symbol} {scoreMeta.label}
            </Text>
            <Text style={styles.scorePlainHeadline}>{scoreMeta.headline}</Text>
          </View>

          <View style={styles.breakdownColumn}>
            <Text style={styles.breakdownHeading}>Security Breakdown</Text>
            <View style={styles.breakdownList}>
              <AppProgressBar
                label="Permissions"
                value={securityScore.breakdown.permissions ?? 85}
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
          </View>
        </View>

        <View style={styles.scoreFooterRow}>
          <Text style={styles.attentionBannerTitle}>
            ⚠️ 2 items need your attention
          </Text>
          <Text style={styles.attentionBannerSubtitle}>
            App permissions & network encryption
          </Text>
          <AppButton
            label="Improve Security"
            onPress={() => {
              if (unverifiedPermissionsCount > 0) {
                improveSecurityAutomatically();
              } else {
                navigation.navigate('SecurityCenter');
              }
            }}
            variant="primary"
            fullWidth
          />
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

      {/* 4. SECURITY STATUS */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderInline}>
          <Text style={styles.sectionTitle}>Security Status</Text>
          <Pressable onPress={() => navigation.navigate('SecurityCenter')}>
            <Text style={styles.sectionLink}>Open Security Center →</Text>
          </Pressable>
        </View>

        <StatusCard
          title="Device"
          subtitle="Operating system and app checks are up to date"
          status="SAFE"
          statusLabel="✓ Good"
          onPress={() => navigation.navigate('DeviceSecurity')}
        />
        <StatusCard
          title="Network"
          subtitle="Connected to WPA2/WPA3 protected home Wi-Fi"
          status="SAFE"
          statusLabel="✓ Good"
          onPress={() => navigation.navigate('NetworkSecurity')}
        />
        <StatusCard
          title="Account"
          subtitle="Two-Factor Authentication is enabled"
          status="SAFE"
          statusLabel="✓ Good"
          onPress={() => navigation.navigate('PasswordSecurity')}
        />
        <StatusCard
          title="Privacy"
          subtitle={
            unverifiedPermissionsCount > 0
              ? `${unverifiedPermissionsCount} apps have microphone or contact access to review`
              : 'All app permissions have been reviewed'
          }
          status={unverifiedPermissionsCount > 0 ? 'ATTENTION' : 'SAFE'}
          statusLabel={
            unverifiedPermissionsCount > 0 ? '⚠ Needs attention' : '✓ Good'
          }
          onPress={() => navigation.navigate('PermissionAnalyzer')}
        />
      </View>

      {/* 5. RECENT ACTIVITY */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderInline}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Pressable onPress={() => navigation.navigate('ActivityTimeline')}>
            <Text style={styles.sectionLink}>View all activity →</Text>
          </Pressable>
        </View>

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
          <View style={{ marginTop: Spacing.md }}>
            <AppButton
              label="View all activity"
              onPress={() => navigation.navigate('ActivityTimeline')}
              variant="secondary"
              fullWidth
            />
          </View>
        </View>
      </View>

      {/* 6. DAILY SECURITY TIP */}
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
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 15,
    color: SecurityPalette.textSecondary,
  },
  assistantShortcut: {
    backgroundColor: SecurityPalette.primarySoft,
    borderColor: SecurityPalette.primary,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.pill,
  },
  assistantShortcutText: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.primary,
  },
  scoreSectionCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.xl,
  },
  scoreMainRow: {
    flexDirection: 'column',
    gap: Spacing.xl,
  },
  scoreMainRowWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gaugeColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 210,
  },
  scoreStatusLabel: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: Spacing.sm,
  },
  scorePlainHeadline: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  breakdownColumn: {
    flex: 1,
  },
  breakdownHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: Spacing.md,
  },
  breakdownList: {
    gap: 12,
  },
  scoreFooterRow: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  attentionBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: SecurityPalette.warning,
    marginBottom: 4,
    textAlign: 'center',
  },
  attentionBannerSubtitle: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
    marginBottom: Spacing.md,
    textAlign: 'center',
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
    fontSize: 19,
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
    justifyContent: 'space-between',
    rowGap: 12,
  },
  activityCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  tipCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  tipTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.interactive,
  },
  tipTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 6,
  },
  tipBody: {
    fontSize: 14,
    color: SecurityPalette.textSecondary,
    lineHeight: 21,
    marginBottom: Spacing.md,
  },
  tipTakeawayBox: {
    backgroundColor: SecurityPalette.safeSoft,
    borderRadius: Radius.md,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: SecurityPalette.safe,
  },
  tipTakeawayText: {
    fontSize: 13,
    fontWeight: '600',
    color: SecurityPalette.textPrimary,
  },
});

export default DashboardScreen;
