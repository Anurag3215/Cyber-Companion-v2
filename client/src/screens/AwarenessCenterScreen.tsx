import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, CyberAwarenessTip } from '../types/security';
import { SecurityPalette, Spacing, Radius } from '../theme/theme';
import {
  AppButton,
  AppProgressBar,
  StatusBadge,
} from '../design-system/components';
import { LEARNING_TOPICS } from '../data/mockSecurityData';
import { useSecurityStore } from '../store/useSecurityStore';
import cyberTipsData from '../data/cyberTips.json';

type Props = NativeStackScreenProps<RootStackParamList, 'AwarenessCenter'>;

const typedTips = cyberTipsData as readonly CyberAwarenessTip[];

/**
 * SECTION 19: LEARN / AWARENESS HUB (/learn)
 * Includes: Daily Tip, 8 Cybersecurity Topics, Learning Progress (Beginner/Intermediate/Advanced),
 * Recommended Lessons, and shortcuts to Quiz, Threat Alerts, and Security News.
 */
export const AwarenessCenterScreen: React.FC<Props> = ({ navigation }) => {
  const completedLessons = useSecurityStore((state) => state.completedLessons);
  const dailyTip = typedTips[0];

  const totalTopics = LEARNING_TOPICS.length;
  const progressPercent = Math.round(
    (completedLessons.length / totalTopics) * 100,
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Learn & Awareness</Text>
      <Text style={styles.pageSubtitle}>
        Simple, everyday guides to help you recognize scams and stay safe
        online.
      </Text>

      {/* Quick Navigation Pills for Quiz, Threat Alerts, Security News */}
      <View style={styles.hubNavRow}>
        <AppButton
          label="Take Security Quiz"
          onPress={() => navigation.navigate('SecurityQuiz')}
          variant="primary"
        />
        <AppButton
          label="Threat Alerts"
          onPress={() => navigation.navigate('ThreatAlerts')}
          variant="secondary"
        />
        <AppButton
          label="Security News"
          onPress={() => navigation.navigate('SecurityNews')}
          variant="secondary"
        />
      </View>

      {/* 1. DAILY TIP */}
      <View style={styles.card}>
        <Text style={styles.overline}>DAILY TIP</Text>
        <Text style={styles.cardTitle}>{dailyTip.title}</Text>
        <Text style={styles.cardBody}>{dailyTip.body}</Text>
        <View style={styles.takeawayBox}>
          <Text style={styles.takeawayText}>
            ✓ {dailyTip.actionableTakeaway}
          </Text>
        </View>
      </View>

      {/* 2. LEARNING PROGRESS (Beginner / Intermediate / Advanced) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Learning Progress</Text>
        <AppProgressBar
          label={`${completedLessons.length} of ${totalTopics} lessons completed`}
          value={progressPercent}
        />

        <View style={styles.tiersRow}>
          {(['Beginner', 'Intermediate', 'Advanced'] as const).map((tier) => {
            const tierTopics = LEARNING_TOPICS.filter(
              (t) => t.difficulty === tier,
            );
            const doneCount = tierTopics.filter((t) =>
              completedLessons.includes(t.id),
            ).length;
            return (
              <View key={tier} style={styles.tierBox}>
                <Text style={styles.tierName}>{tier}</Text>
                <Text style={styles.tierStats}>
                  {doneCount}/{tierTopics.length} done
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 3. CYBERSECURITY TOPICS & RECOMMENDED LESSONS */}
      <Text style={styles.sectionTitle}>Cybersecurity Topics</Text>
      <Text style={styles.sectionSubtitle}>
        Tap any topic to open its full plain-language lesson.
      </Text>

      {LEARNING_TOPICS.map((topic) => {
        const isCompleted = completedLessons.includes(topic.id);
        return (
          <Pressable
            key={topic.id}
            onPress={() =>
              navigation.navigate('LessonDetail', { topicId: topic.id })
            }
            style={styles.topicCard}>
            <View style={styles.topicTopRow}>
              <Text style={styles.topicCategory}>{topic.category}</Text>
              <StatusBadge
                status={isCompleted ? 'SAFE' : 'ATTENTION'}
                customLabel={
                  isCompleted
                    ? '✓ Completed'
                    : `${topic.difficulty} • ${topic.readingTime}`
                }
              />
            </View>
            <Text style={styles.topicTitle}>{topic.title}</Text>
            <Text style={styles.topicSummary}>{topic.summary}</Text>
            <Text style={styles.openLessonLink}>Read lesson →</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SecurityPalette.background },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 15,
    color: SecurityPalette.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  hubNavRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.lg,
  },
  overline: {
    fontSize: 11,
    fontWeight: '800',
    color: SecurityPalette.interactive,
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 14,
    color: SecurityPalette.textSecondary,
    lineHeight: 21,
    marginBottom: 12,
  },
  takeawayBox: {
    backgroundColor: SecurityPalette.safeSoft,
    padding: 12,
    borderRadius: Radius.md,
    borderLeftWidth: 3,
    borderLeftColor: SecurityPalette.safe,
  },
  takeawayText: {
    fontSize: 13,
    fontWeight: '600',
    color: SecurityPalette.textPrimary,
  },
  tiersRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.md,
  },
  tierBox: {
    flex: 1,
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
  },
  tierName: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 2,
  },
  tierStats: {
    fontSize: 12,
    color: SecurityPalette.interactive,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: SecurityPalette.textSecondary,
    marginBottom: Spacing.md,
  },
  topicCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.md,
  },
  topicTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  topicCategory: {
    fontSize: 12,
    fontWeight: '800',
    color: SecurityPalette.primary,
    textTransform: 'uppercase',
  },
  topicTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
  },
  topicSummary: {
    fontSize: 14,
    color: SecurityPalette.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  openLessonLink: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.interactive,
  },
});

export default AwarenessCenterScreen;
