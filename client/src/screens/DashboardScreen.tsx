import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  StatusBar,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, CyberAwarenessTip } from '../types/security';
import { useSecurityStore } from '../store/useSecurityStore';
import { SecurityScoreGauge } from '../components/SecurityScoreGauge';
import {
  ShieldCheckIcon,
  WifiSignalIcon,
  GlobeLinkIcon,
  QrMatrixIcon,
  LockSlidersIcon,
  BulbSparkIcon,
  ChevronRightIcon,
} from '../components/SecurityIcons';
import { getScoreVisualMeta, SecurityPalette } from '../theme/theme';
import cyberTipsData from '../data/cyberTips.json';

type DashboardProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

interface ActionCardItem {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly ctaLabel: string;
  readonly badge: string;
  readonly accentColor: string;
  readonly tintBg: string;
  readonly route: keyof Omit<RootStackParamList, 'Dashboard'>;
}

const ACTION_CARDS: readonly ActionCardItem[] = [
  {
    id: 'wifi',
    title: 'Wi-Fi Risk Analyzer',
    subtitle: 'Inspect SSID & WPA2/WPA3 encryption safety',
    ctaLabel: 'Inspect Network',
    badge: 'ENCRYPTED',
    accentColor: '#38BDF8',
    tintBg: 'rgba(56, 189, 248, 0.12)',
    route: 'WifiAnalyzer',
  },
  {
    id: 'url',
    title: 'Malicious URL Scanner',
    subtitle: 'Verify suspicious links against cloud threat intel',
    ctaLabel: 'Scan Web Link',
    badge: 'THREAT INTEL',
    accentColor: '#00C853',
    tintBg: 'rgba(0, 200, 83, 0.12)',
    route: 'UrlScanner',
  },
  {
    id: 'qr',
    title: 'QR Verification Sandbox',
    subtitle: 'Preview QR code destinations before opening',
    ctaLabel: 'Launch Sandbox',
    badge: 'ANTI-QISHING',
    accentColor: '#FFAB00',
    tintBg: 'rgba(255, 171, 0, 0.12)',
    route: 'QrScanner',
  },
  {
    id: 'permissions',
    title: 'App Permissions Auditor',
    subtitle: 'Detect apps with excessive camera, SMS, or mic access',
    ctaLabel: 'Audit 2 Alerts',
    badge: '2 UNVERIFIED',
    accentColor: '#F43F5E',
    tintBg: 'rgba(244, 63, 94, 0.12)',
    route: 'PermissionAnalyzer',
  },
];

const typedTips = cyberTipsData as readonly CyberAwarenessTip[];

export const DashboardScreen: React.FC<DashboardProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const score = useSecurityStore((state) => state.score);
  const summaryMessage = useSecurityStore((state) => state.summaryMessage);
  const securityScore = useSecurityStore((state) => state.securityScore);
  const setScore = useSecurityStore((state) => state.setScore);

  const [tipIndex, setTipIndex] = useState<number>(0);
  const currentTip = typedTips[tipIndex % typedTips.length];

  const { color: statusColor, badgeBg, headline } = getScoreVisualMeta(score);

  // Responsive calculations for 360dp, 390dp, 412dp+ viewports
  const horizontalPadding = width <= 360 ? 14 : 18;
  const gridGap = width <= 360 ? 10 : 12;
  const cardWidth = Math.floor((width - horizontalPadding * 2 - gridGap) / 2);
  const gaugeSize = width <= 360 ? 168 : 184;

  const renderCardIcon = (id: string, color: string) => {
    switch (id) {
      case 'wifi':
        return <WifiSignalIcon size={22} color={color} />;
      case 'url':
        return <GlobeLinkIcon size={22} color={color} />;
      case 'qr':
        return <QrMatrixIcon size={22} color={color} />;
      default:
        return <LockSlidersIcon size={22} color={color} />;
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: horizontalPadding },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* 1. HEADER: Brand Identity + Real-Time Protection Status */}
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <View
              style={[
                styles.brandLogoBox,
                { borderColor: statusColor, backgroundColor: badgeBg },
              ]}>
              <ShieldCheckIcon size={22} color={statusColor} />
            </View>
            <View>
              <Text style={styles.brandOverline}>PROACTIVE DEFENSE</Text>
              <Text style={styles.brandTitle}>Cyber Companion</Text>
            </View>
          </View>

          <View
            style={[
              styles.protectionBadge,
              { borderColor: statusColor, backgroundColor: badgeBg },
            ]}>
            <View
              style={[styles.pulseDot, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.protectionBadgeText, { color: statusColor }]}>
              SHIELD ON
            </Text>
          </View>
        </View>

        {/* 2. HERO SECTION: Centered Holistic Security Score & Plain-Language Summary */}
        <Surface style={styles.heroCard} elevation={2}>
          <View style={styles.heroGaugeWrap}>
            <SecurityScoreGauge size={gaugeSize} />
          </View>

          <Text style={styles.heroHeadline}>{headline}</Text>

          <View
            style={[
              styles.summaryBanner,
              { borderColor: statusColor, backgroundColor: badgeBg },
            ]}>
            <View
              style={[styles.summaryDot, { backgroundColor: statusColor }]}
            />
            <Text style={styles.summaryBannerText}>{summaryMessage}</Text>
          </View>

          {/* 3-Factor Breakdown Pillars */}
          <View style={styles.pillarsRow}>
            <View style={styles.pillarBox}>
              <View style={styles.pillarHeader}>
                <Text style={styles.pillarLabel}>Wi-Fi</Text>
                <Text style={[styles.pillarValue, { color: '#38BDF8' }]}>
                  {securityScore.wifiSafetyScore}%
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${securityScore.wifiSafetyScore}%`,
                      backgroundColor: '#38BDF8',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.pillarBox}>
              <View style={styles.pillarHeader}>
                <Text style={styles.pillarLabel}>Links</Text>
                <Text
                  style={[
                    styles.pillarValue,
                    { color: SecurityPalette.safe },
                  ]}>
                  {securityScore.urlHygieneScore}%
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${securityScore.urlHygieneScore}%`,
                      backgroundColor: SecurityPalette.safe,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.pillarBox}>
              <View style={styles.pillarHeader}>
                <Text style={styles.pillarLabel}>Permissions</Text>
                <Text
                  style={[
                    styles.pillarValue,
                    { color: SecurityPalette.warning },
                  ]}>
                  {securityScore.appPermissionScore}%
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${securityScore.appPermissionScore}%`,
                      backgroundColor: SecurityPalette.warning,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Segmented Score State Switcher */}
          <View style={styles.segmentedControl}>
            <Pressable
              onPress={() =>
                setScore(84, 'Your device has 2 unverified permissions')
              }
              style={[
                styles.segmentButton,
                score >= 80 && {
                  backgroundColor: 'rgba(0, 200, 83, 0.18)',
                  borderColor: SecurityPalette.safe,
                },
              ]}>
              <Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      score >= 80
                        ? SecurityPalette.safe
                        : SecurityPalette.textSecondary,
                  },
                ]}>
                Safe (84)
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                setScore(64, 'Your device has 3 unverified permissions')
              }
              style={[
                styles.segmentButton,
                score >= 50 &&
                  score < 80 && {
                    backgroundColor: 'rgba(255, 171, 0, 0.18)',
                    borderColor: SecurityPalette.warning,
                  },
              ]}>
              <Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      score >= 50 && score < 80
                        ? SecurityPalette.warning
                        : SecurityPalette.textSecondary,
                  },
                ]}>
                Caution (64)
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                setScore(
                  36,
                  'Unencrypted Wi-Fi & 4 high-risk app permissions detected',
                )
              }
              style={[
                styles.segmentButton,
                score < 50 && {
                  backgroundColor: 'rgba(213, 0, 0, 0.2)',
                  borderColor: SecurityPalette.critical,
                },
              ]}>
              <Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      score < 50
                        ? SecurityPalette.critical
                        : SecurityPalette.textSecondary,
                  },
                ]}>
                High Risk (36)
              </Text>
            </Pressable>
          </View>
        </Surface>

        {/* 3. ACTION GRID: 4 Core Protection Modules */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Protection Modules</Text>
          <Text style={styles.sectionSubtitle}>Real-time telemetry</Text>
        </View>

        <View style={[styles.actionGrid, { gap: gridGap }]}>
          {ACTION_CARDS.map((card) => (
            <Pressable
              key={card.id}
              onPress={() => navigation.navigate(card.route)}
              accessibilityRole="button"
              accessibilityLabel={`${card.title}. ${card.subtitle}`}
              style={({ pressed }) => [
                styles.actionCard,
                {
                  width: cardWidth,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}>
              <View>
                <View style={styles.cardTopRow}>
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: card.tintBg,
                        borderColor: card.accentColor,
                      },
                    ]}>
                    {renderCardIcon(card.id, card.accentColor)}
                  </View>
                  <View
                    style={[
                      styles.cardBadge,
                      { backgroundColor: card.tintBg },
                    ]}>
                    <Text
                      style={[
                        styles.cardBadgeText,
                        { color: card.accentColor },
                      ]}>
                      {card.badge}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardTitle} numberOfLines={1}>
                  {card.title}
                </Text>
                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  {card.subtitle}
                </Text>
              </View>

              <View style={styles.cardFooterRow}>
                <Text
                  style={[styles.cardCtaText, { color: card.accentColor }]}>
                  {card.ctaLabel}
                </Text>
                <ChevronRightIcon size={15} color={card.accentColor} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* 4. MICRO-LEARNING CARD: Dynamic "Daily Cyber Tip" */}
        <Surface style={styles.tipCard} elevation={1}>
          <View style={styles.tipHeaderRow}>
            <View style={styles.tipBadgeRow}>
              <View style={styles.tipIconWrap}>
                <BulbSparkIcon size={16} color={SecurityPalette.primary} />
              </View>
              <Text style={styles.tipCategoryText}>
                DAILY CYBER TIP • {(tipIndex % typedTips.length) + 1}/
                {typedTips.length}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                setTipIndex((prev) => (prev + 1) % typedTips.length)
              }
              style={styles.nextTipPill}>
              <Text style={styles.nextTipText}>Next Tip</Text>
            </Pressable>
          </View>

          <Text style={styles.tipTitle}>{currentTip.title}</Text>
          <Text style={styles.tipBody}>{currentTip.body}</Text>

          <View style={styles.takeawayContainer}>
            <Text style={styles.takeawayHeading}>RECOMMENDED HABIT</Text>
            <Text style={styles.takeawayBody}>
              {currentTip.actionableTakeaway}
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate('AwarenessCenter')}
            style={styles.awarenessCenterBtn}>
            <Text style={styles.awarenessCenterBtnText}>
              Browse All Security Guides
            </Text>
            <ChevronRightIcon size={16} color={SecurityPalette.primary} />
          </Pressable>
        </Surface>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SecurityPalette.background,
  },
  scrollContent: {
    paddingTop: 14,
    paddingBottom: 34,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandOverline: {
    fontSize: 9,
    fontWeight: '800',
    color: SecurityPalette.primary,
    letterSpacing: 1.2,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    letterSpacing: -0.3,
  },
  protectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  protectionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  heroCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: 22,
    alignItems: 'center',
  },
  heroGaugeWrap: {
    marginVertical: 4,
  },
  heroHeadline: {
    fontSize: 16,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 7,
  },
  summaryBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: SecurityPalette.textPrimary,
  },
  pillarsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginBottom: 14,
  },
  pillarBox: {
    flex: 1,
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  pillarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pillarLabel: {
    fontSize: 11,
    color: SecurityPalette.textSecondary,
    fontWeight: '600',
  },
  pillarValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  progressTrack: {
    height: 4,
    backgroundColor: SecurityPalette.background,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  segmentedControl: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: SecurityPalette.background,
    borderRadius: 12,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
    fontWeight: '500',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 22,
  },
  actionCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    minHeight: 154,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: SecurityPalette.textSecondary,
    lineHeight: 16,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: SecurityPalette.border,
  },
  cardCtaText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tipCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  tipHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  tipIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipCategoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: SecurityPalette.primary,
    letterSpacing: 0.6,
  },
  nextTipPill: {
    backgroundColor: SecurityPalette.surfaceVariant,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  nextTipText: {
    fontSize: 11,
    fontWeight: '700',
    color: SecurityPalette.primary,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 6,
  },
  tipBody: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  takeawayContainer: {
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: SecurityPalette.safe,
    marginBottom: 12,
  },
  takeawayHeading: {
    fontSize: 9.5,
    fontWeight: '800',
    color: SecurityPalette.safe,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  takeawayBody: {
    fontSize: 12,
    color: SecurityPalette.textPrimary,
    fontWeight: '600',
    lineHeight: 17,
  },
  awarenessCenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: SecurityPalette.surfaceVariant,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  awarenessCenterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: SecurityPalette.primary,
  },
});

export default DashboardScreen;
