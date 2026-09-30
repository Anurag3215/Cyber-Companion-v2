import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  StatusBar,
} from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, CyberAwarenessTip } from '../types/security';
import { useSecurityStore } from '../store/useSecurityStore';
import { SecurityScoreGauge } from '../components/SecurityScoreGauge';
import { getScoreVisualMeta, SecurityPalette } from '../theme/theme';
import cyberTipsData from '../data/cyberTips.json';

type DashboardProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

interface ActionCardItem {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly badge: string;
  readonly accentColor: string;
  readonly iconSymbol: string;
  readonly route: keyof Omit<RootStackParamList, 'Dashboard'>;
}

const ACTION_CARDS: readonly ActionCardItem[] = [
  {
    id: 'wifi',
    title: 'Wi-Fi Risk Analyzer',
    subtitle: 'SSID & encryption inspection',
    badge: 'WPA2 / WPA3',
    accentColor: '#38BDF8',
    iconSymbol: '📶',
    route: 'WifiAnalyzer',
  },
  {
    id: 'url',
    title: 'Malicious URL Scanner',
    subtitle: 'Check links before tapping',
    badge: 'Threat Intel',
    accentColor: '#00C853',
    iconSymbol: '🛡️',
    route: 'UrlScanner',
  },
  {
    id: 'qr',
    title: 'QR Verification Sandbox',
    subtitle: 'Preview QR destinations safely',
    badge: 'Anti-Qishing',
    accentColor: '#FFAB00',
    iconSymbol: '📷',
    route: 'QrScanner',
  },
  {
    id: 'permissions',
    title: 'Installed App Permissions Auditor',
    subtitle: 'Spot apps with excessive access',
    badge: '2 Unverified',
    accentColor: '#F43F5E',
    iconSymbol: '🔐',
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

  const { color: statusColor, headline } = getScoreVisualMeta(score);

  // Responsive layout math tested across 360dp, 390dp, 412dp+ widths
  const horizontalPadding = width <= 360 ? 14 : 18;
  const gridGap = width <= 360 ? 10 : 12;
  const cardWidth = Math.floor((width - horizontalPadding * 2 - gridGap) / 2);
  const gaugeSize = width <= 360 ? 152 : 168;

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % typedTips.length);
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
        {/* 1. HEADER: Application Brand + Real-Time Protection Badge */}
        <View style={styles.headerRow}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandOverline}>PROACTIVE DIGITAL DEFENSE</Text>
            <Text style={styles.brandTitle}>Cyber Companion</Text>
          </View>

          <View
            style={[
              styles.protectionBadge,
              { borderColor: statusColor },
            ]}>
            <View
              style={[
                styles.pulseDot,
                { backgroundColor: statusColor },
              ]}
            />
            <Text style={[styles.protectionBadgeText, { color: statusColor }]}>
              REAL-TIME SHIELD
            </Text>
          </View>
        </View>

        {/* 2. HERO SECTION: Holistic Security Score Widget & Plain-Language Summary */}
        <Surface style={styles.heroCard} elevation={2}>
          <View style={styles.heroTopRow}>
            <SecurityScoreGauge size={gaugeSize} />

            <View style={styles.heroTextColumn}>
              <Text style={styles.heroHeadline}>{headline}</Text>
              <Text style={styles.heroSummary}>{summaryMessage}</Text>

              <View style={styles.subMetricsList}>
                <View style={styles.subMetricItem}>
                  <Text style={styles.subMetricLabel}>Wi-Fi Safety</Text>
                  <Text style={styles.subMetricValue}>
                    {securityScore.wifiSafetyScore}%
                  </Text>
                </View>
                <View style={styles.subMetricItem}>
                  <Text style={styles.subMetricLabel}>Link Hygiene</Text>
                  <Text style={styles.subMetricValue}>
                    {securityScore.urlHygieneScore}%
                  </Text>
                </View>
                <View style={styles.subMetricItem}>
                  <Text style={styles.subMetricLabel}>App Privacy</Text>
                  <Text style={styles.subMetricValue}>
                    {securityScore.appPermissionScore}%
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Interactive Score State Simulator (Safe / Caution / High Risk) */}
          <View style={styles.simulatorRow}>
            <Text style={styles.simulatorLabel}>Preview Risk State:</Text>
            <View style={styles.simulatorButtons}>
              <Pressable
                onPress={() =>
                  setScore(84, 'Your device has 2 unverified permissions')
                }
                style={[
                  styles.simChip,
                  score >= 80 && {
                    borderColor: SecurityPalette.safe,
                    backgroundColor: 'rgba(0, 200, 83, 0.14)',
                  },
                ]}>
                <Text
                  style={[
                    styles.simChipText,
                    { color: SecurityPalette.safe },
                  ]}>
                  Safe (84)
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  setScore(64, 'Your device has 3 unverified permissions')
                }
                style={[
                  styles.simChip,
                  score >= 50 &&
                    score < 80 && {
                      borderColor: SecurityPalette.warning,
                      backgroundColor: 'rgba(255, 171, 0, 0.16)',
                    },
                ]}>
                <Text
                  style={[
                    styles.simChipText,
                    { color: SecurityPalette.warning },
                  ]}>
                  Caution (64)
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  setScore(
                    36,
                    'Open Wi-Fi & 4 risky app permissions need attention',
                  )
                }
                style={[
                  styles.simChip,
                  score < 50 && {
                    borderColor: SecurityPalette.critical,
                    backgroundColor: 'rgba(213, 0, 0, 0.18)',
                  },
                ]}>
                <Text
                  style={[
                    styles.simChipText,
                    { color: SecurityPalette.critical },
                  ]}>
                  Risk (36)
                </Text>
              </Pressable>
            </View>
          </View>
        </Surface>

        {/* 3. ACTION GRID: 4 Core Protection Modules */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Security Scanners & Tools</Text>
          <Text style={styles.sectionSubtitle}>Tap a tool to inspect</Text>
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
                  opacity: pressed ? 0.88 : 1,
                },
              ]}>
              <View style={styles.cardTopRow}>
                <View
                  style={[
                    styles.iconCircle,
                    { borderColor: card.accentColor },
                  ]}>
                  <Text style={styles.iconEmoji}>{card.iconSymbol}</Text>
                </View>
                <View
                  style={[
                    styles.cardBadge,
                    { borderColor: card.accentColor },
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

              <Text style={styles.cardTitle} numberOfLines={2}>
                {card.title}
              </Text>
              <Text style={styles.cardSubtitle} numberOfLines={2}>
                {card.subtitle}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 4. MICRO-LEARNING CARD: Dynamic "Daily Cyber Tip" from cyberTips.json */}
        <Surface style={styles.tipCard} elevation={1}>
          <View style={styles.tipHeaderRow}>
            <View style={styles.tipTagBadge}>
              <Text style={styles.tipTagText}>
                💡 DAILY CYBER TIP • {currentTip.category.replace('_', ' ')}
              </Text>
            </View>
            <Pressable onPress={handleNextTip} style={styles.nextTipButton}>
              <Text style={styles.nextTipButtonText}>Next Tip ↻</Text>
            </Pressable>
          </View>

          <Text style={styles.tipTitle}>{currentTip.title}</Text>
          <Text style={styles.tipBody}>{currentTip.body}</Text>

          <View style={styles.takeawayBox}>
            <Text style={styles.takeawayLabel}>PLAIN-LANGUAGE ACTION:</Text>
            <Text style={styles.takeawayText}>
              {currentTip.actionableTakeaway}
            </Text>
          </View>

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('AwarenessCenter')}
            textColor={SecurityPalette.primary}
            style={styles.awarenessButton}>
            Open Cyber Awareness Center
          </Button>
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
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  brandBlock: {
    flexShrink: 1,
  },
  brandOverline: {
    fontSize: 10,
    fontWeight: '700',
    color: SecurityPalette.primary,
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    letterSpacing: -0.4,
  },
  protectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SecurityPalette.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  protectionBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: 22,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 14,
  },
  heroTextColumn: {
    flex: 1,
    minWidth: 150,
  },
  heroHeadline: {
    fontSize: 16,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
    lineHeight: 21,
  },
  heroSummary: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  subMetricsList: {
    gap: 6,
  },
  subMetricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: SecurityPalette.surfaceVariant,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  subMetricLabel: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
    fontWeight: '500',
  },
  subMetricValue: {
    fontSize: 12,
    color: SecurityPalette.textPrimary,
    fontWeight: '700',
  },
  simulatorRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: SecurityPalette.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  simulatorLabel: {
    fontSize: 11,
    color: SecurityPalette.textSecondary,
    fontWeight: '600',
  },
  simulatorButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  simChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    backgroundColor: SecurityPalette.surfaceVariant,
  },
  simChipText: {
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
    fontSize: 17,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 22,
  },
  actionCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    minHeight: 136,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: SecurityPalette.surfaceVariant,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
  cardBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: SecurityPalette.surfaceVariant,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
    lineHeight: 19,
  },
  cardSubtitle: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
    lineHeight: 16,
  },
  tipCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: 18,
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
  tipTagBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tipTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: SecurityPalette.primary,
    letterSpacing: 0.5,
  },
  nextTipButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  nextTipButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: SecurityPalette.primary,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 6,
  },
  tipBody: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  takeawayBox: {
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: SecurityPalette.safe,
    marginBottom: 14,
  },
  takeawayLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: SecurityPalette.safe,
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  takeawayText: {
    fontSize: 12,
    color: SecurityPalette.textPrimary,
    lineHeight: 17,
    fontWeight: '500',
  },
  awarenessButton: {
    borderColor: SecurityPalette.border,
    borderRadius: 10,
  },
});

export default DashboardScreen;
