import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  RootStackParamList,
  ThreatAlertCategory,
} from '../types/security';
import { SecurityPalette, Spacing, Radius } from '../theme/theme';
import {
  AppButton,
  AppProgressBar,
  ThreatCard,
  ScanResultCard,
  StatusBadge,
  EmptyStateView,
} from '../design-system/components';
import {
  LEARNING_TOPICS,
  QUIZ_QUESTIONS,
  SECURITY_NEWS,
} from '../data/mockSecurityData';
import { useSecurityStore } from '../store/useSecurityStore';

/* ============================================================================
 * 1. LESSON PAGE (/learn/topic/:id) — Section 20
 * ========================================================================== */
type LessonProps = NativeStackScreenProps<RootStackParamList, 'LessonDetail'>;

export const LessonDetailScreen: React.FC<LessonProps> = ({
  route,
  navigation,
}) => {
  const markLessonCompleted = useSecurityStore(
    (state) => state.markLessonCompleted,
  );
  const currentIndex = Math.max(
    0,
    LEARNING_TOPICS.findIndex((t) => t.id === route.params.topicId),
  );
  const lesson = LEARNING_TOPICS[currentIndex] ?? LEARNING_TOPICS[0];
  const prevTopic =
    currentIndex > 0 ? LEARNING_TOPICS[currentIndex - 1] : null;
  const nextTopic =
    currentIndex < LEARNING_TOPICS.length - 1
      ? LEARNING_TOPICS[currentIndex + 1]
      : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.metaRow}>
        <StatusBadge
          status="SAFE"
          customLabel={`${lesson.difficulty} • ${lesson.readingTime}`}
        />
        <Text style={styles.categoryLabel}>{lesson.category}</Text>
      </View>

      <Text style={styles.pageTitle}>{lesson.title}</Text>

      {/* Simple Explanation */}
      <View style={styles.lessonBlock}>
        <Text style={styles.blockHeading}>Simple Explanation</Text>
        <Text style={styles.blockBody}>{lesson.simpleExplanation}</Text>
      </View>

      {/* Real-World Example */}
      <View
        style={[
          styles.lessonBlock,
          { borderLeftWidth: 3, borderLeftColor: SecurityPalette.interactive },
        ]}>
        <Text style={styles.blockHeading}>Real-World Example</Text>
        <Text style={styles.blockBody}>{lesson.realWorldExample}</Text>
      </View>

      {/* Warning Signs */}
      <View
        style={[
          styles.lessonBlock,
          { borderLeftWidth: 3, borderLeftColor: SecurityPalette.warning },
        ]}>
        <Text style={[styles.blockHeading, { color: SecurityPalette.warning }]}>
          Warning Signs
        </Text>
        {lesson.warningSigns.map((sign, i) => (
          <Text key={i} style={styles.bulletLine}>
            ⚠ {sign}
          </Text>
        ))}
      </View>

      {/* What To Do */}
      <View
        style={[
          styles.lessonBlock,
          { borderLeftWidth: 3, borderLeftColor: SecurityPalette.safe },
        ]}>
        <Text style={[styles.blockHeading, { color: SecurityPalette.safe }]}>
          What To Do
        </Text>
        {lesson.whatToDo.map((step, i) => (
          <Text key={i} style={styles.bulletLine}>
            ✓ {step}
          </Text>
        ))}
      </View>

      {/* Key Takeaways */}
      <View style={styles.lessonBlock}>
        <Text style={styles.blockHeading}>Key Takeaways</Text>
        {lesson.keyTakeaways.map((item, i) => (
          <Text key={i} style={styles.bulletLine}>
            • {item}
          </Text>
        ))}
      </View>

      <AppButton
        label="Mark Lesson Complete"
        onPress={() => markLessonCompleted(lesson.id)}
        variant="primary"
        fullWidth
      />

      {/* Previous / Next Navigation */}
      <View style={styles.prevNextRow}>
        <View style={{ flex: 1 }}>
          <AppButton
            label={prevTopic ? '← Previous Lesson' : '← All Topics'}
            onPress={() =>
              prevTopic
                ? navigation.navigate('LessonDetail', {
                    topicId: prevTopic.id,
                  })
                : navigation.navigate('AwarenessCenter')
            }
            variant="secondary"
            fullWidth
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppButton
            label={nextTopic ? 'Next Lesson →' : 'Take Quiz →'}
            onPress={() =>
              nextTopic
                ? navigation.navigate('LessonDetail', {
                    topicId: nextTopic.id,
                  })
                : navigation.navigate('SecurityQuiz')
            }
            variant="primary"
            fullWidth
          />
        </View>
      </View>
    </ScrollView>
  );
};

/* ============================================================================
 * 2. SECURITY QUIZ (/learn/quiz) — Section 22
 * ========================================================================== */
type QuizProps = NativeStackScreenProps<RootStackParamList, 'SecurityQuiz'>;

export const SecurityQuizScreen: React.FC<QuizProps> = () => {
  const saveQuizScore = useSecurityStore((state) => state.saveQuizScore);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [currentChoice, setCurrentChoice] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [showMistakes, setShowMistakes] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentIdx];
  const progressPercent = Math.round(
    ((currentIdx + (finished ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100,
  );

  const handleNext = () => {
    if (currentChoice === null) return;
    const nextAnswers = [...selectedAnswers, currentChoice];
    setSelectedAnswers(nextAnswers);
    setCurrentChoice(null);

    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      const correctCount = nextAnswers.filter(
        (ans, idx) => ans === QUIZ_QUESTIONS[idx].correctIndex,
      ).length;
      const finalPct = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);
      saveQuizScore(finalPct);
      setFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setSelectedAnswers([]);
    setCurrentChoice(null);
    setFinished(false);
    setShowMistakes(false);
  };

  const correctCount = selectedAnswers.filter(
    (ans, idx) => ans === QUIZ_QUESTIONS[idx].correctIndex,
  ).length;
  const finalScore = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Security Awareness Quiz</Text>
      <Text style={styles.pageSubtitle}>
        Friendly, real-life scenarios to practice spotting scams.
      </Text>

      <View style={styles.quizProgressBox}>
        <AppProgressBar
          label={
            finished
              ? 'Quiz Completed'
              : `Question ${currentIdx + 1} of ${QUIZ_QUESTIONS.length}`
          }
          value={progressPercent}
        />
      </View>

      {!finished ? (
        <View style={styles.lessonBlock}>
          <Text style={styles.quizQuestionText}>
            {currentQuestion.question}
          </Text>

          <View style={styles.optionsList}>
            {currentQuestion.options.map((opt, idx) => {
              const selected = currentChoice === idx;
              return (
                <Pressable
                  key={idx}
                  onPress={() => setCurrentChoice(idx)}
                  style={[
                    styles.optionButton,
                    selected && styles.optionButtonSelected,
                  ]}>
                  <Text
                    style={[
                      styles.optionText,
                      selected && { color: '#FFFFFF', fontWeight: '700' },
                    ]}>
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <AppButton
            label={
              currentIdx + 1 === QUIZ_QUESTIONS.length
                ? 'Finish Quiz'
                : 'Next Question'
            }
            onPress={handleNext}
            disabled={currentChoice === null}
            variant="primary"
            fullWidth
          />
        </View>
      ) : (
        <View style={styles.lessonBlock}>
          <Text style={styles.finalScoreNumber}>{finalScore}%</Text>
          <Text style={styles.blockHeading}>
            You answered {correctCount} out of {QUIZ_QUESTIONS.length} correctly!
          </Text>
          <Text style={styles.blockBody}>
            Every question you practice makes it easier to spot phishing links
            and phone scams in real life.
          </Text>

          <View style={styles.prevNextRow}>
            <View style={{ flex: 1 }}>
              <AppButton
                label="Learn from mistakes"
                onPress={() => setShowMistakes((p) => !p)}
                variant="secondary"
                fullWidth
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppButton
                label="Try Quiz Again"
                onPress={resetQuiz}
                variant="primary"
                fullWidth
              />
            </View>
          </View>

          {showMistakes ? (
            <View style={{ marginTop: Spacing.lg, gap: 12 }}>
              {QUIZ_QUESTIONS.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctIndex;
                return (
                  <View key={q.id} style={styles.reviewBox}>
                    <Text
                      style={[
                        styles.reviewStatus,
                        {
                          color: isCorrect
                            ? SecurityPalette.safe
                            : SecurityPalette.warning,
                        },
                      ]}>
                      {isCorrect ? '✓ Correct' : '⚠ Good to review'}
                    </Text>
                    <Text style={styles.reviewQ}>{q.question}</Text>
                    <Text style={styles.reviewAns}>
                      Best answer: {q.options[q.correctIndex]}
                    </Text>
                    <Text style={styles.reviewExplain}>
                      {q.plainExplanation}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
};

/* ============================================================================
 * 3. THREAT ALERTS CENTER (/threats) & DETAIL (/threats/:id) — Section 21
 * ========================================================================== */
type ThreatsProps = NativeStackScreenProps<RootStackParamList, 'ThreatAlerts'>;

const ALERT_CATEGORIES: readonly ('All' | ThreatAlertCategory)[] = [
  'All',
  'Critical',
  'High',
  'Medium',
  'Low',
  'Resolved',
];

export const ThreatAlertsScreen: React.FC<ThreatsProps> = ({ navigation }) => {
  const threatAlerts = useSecurityStore((state) => state.threatAlerts);
  const [selectedCategory, setSelectedCategory] = useState<
    'All' | ThreatAlertCategory
  >('All');

  const filtered =
    selectedCategory === 'All'
      ? threatAlerts
      : threatAlerts.filter((a) => a.severity === selectedCategory);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Threat Alerts</Text>
      <Text style={styles.pageSubtitle}>
        Timely warnings and security items detected from live scans and device audits.
      </Text>

      <View style={styles.tabsRow}>
        {ALERT_CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.tabPill,
              selectedCategory === cat && styles.tabPillActive,
            ]}>
            <Text
              style={[
                styles.tabText,
                selectedCategory === cat && { color: '#FFFFFF' },
              ]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyStateView
          title="You're all clear."
          message="No active security threats, phishing attempts, or unsafe network risks detected on your device."
          actionLabel="Check a Website"
          onAction={() => navigation.navigate('UrlScanner')}
        />
      ) : (
        filtered.map((alert) => (
          <ThreatCard
            key={alert.id}
            title={alert.title}
            severity={alert.severity}
            date={alert.date}
            description={alert.summary}
            recommendedAction={alert.explanation.whatShouldIDo[0]}
            onPress={() =>
              navigation.navigate('ThreatDetail', { alertId: alert.id })
            }
          />
        ))
      )}
    </ScrollView>
  );
};

type ThreatDetailProps = NativeStackScreenProps<
  RootStackParamList,
  'ThreatDetail'
>;

export const ThreatDetailScreen: React.FC<ThreatDetailProps> = ({
  route,
  navigation,
}) => {
  const threatAlerts = useSecurityStore((state) => state.threatAlerts);
  const alert = threatAlerts.find((a) => a.id === route.params.alertId);

  if (!alert) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <EmptyStateView
          title="Threat alert not found"
          message="This alert has either been resolved or cleared from active monitors."
          actionLabel="Back to Threat Alerts"
          onAction={() => navigation.goBack()}
        />
      </ScrollView>
    );
  }

  const mappedStatus =
    alert.severity === 'Critical' || alert.severity === 'High'
      ? 'DANGER'
      : alert.severity === 'Resolved'
        ? 'SAFE'
        : 'ATTENTION';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.categoryLabel}>
        {alert.severity.toUpperCase()} ALERT • {alert.date}
      </Text>
      <Text style={styles.pageTitle}>{alert.title}</Text>

      <ScanResultCard
        status={mappedStatus}
        headline={alert.summary}
        targetLabel={`Affected Area: ${alert.affectedArea}`}
        explanation={alert.explanation}
        primaryActionLabel="Back to Threat Alerts"
        onPrimaryAction={() => navigation.goBack()}
      />
    </ScrollView>
  );
};

/* ============================================================================
 * 4. SECURITY NEWS (/learn/news)
 * ========================================================================== */
type NewsProps = NativeStackScreenProps<RootStackParamList, 'SecurityNews'>;

export const SecurityNewsScreen: React.FC<NewsProps> = () => {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Security News</Text>
      <Text style={styles.pageSubtitle}>
        Important digital safety updates translated for everyday citizens.
      </Text>

      {SECURITY_NEWS.map((item) => (
        <View key={item.id} style={styles.lessonBlock}>
          <Text style={styles.categoryLabel}>
            {item.date} • {item.readTime}
          </Text>
          <Text style={styles.blockHeading}>{item.title}</Text>
          <Text style={styles.blockBody}>{item.summary}</Text>
          <View style={styles.newsTakeaway}>
            <Text style={styles.newsTakeawayText}>
              What this means for you: {item.takeaway}
            </Text>
          </View>
        </View>
      ))}
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: SecurityPalette.interactive,
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: Spacing.md,
  },
  pageSubtitle: {
    fontSize: 15,
    color: SecurityPalette.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  lessonBlock: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.md,
  },
  blockHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 6,
  },
  blockBody: {
    fontSize: 15,
    color: SecurityPalette.textSecondary,
    lineHeight: 22,
  },
  bulletLine: {
    fontSize: 14.5,
    color: SecurityPalette.textPrimary,
    lineHeight: 22,
    marginBottom: 6,
  },
  prevNextRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.md,
  },
  quizProgressBox: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.md,
  },
  quizQuestionText: {
    fontSize: 18,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    lineHeight: 26,
    marginBottom: Spacing.lg,
  },
  optionsList: {
    gap: 10,
    marginBottom: Spacing.lg,
  },
  optionButton: {
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: SecurityPalette.border,
  },
  optionButtonSelected: {
    backgroundColor: SecurityPalette.primary,
    borderColor: SecurityPalette.primary,
  },
  optionText: {
    fontSize: 15,
    color: SecurityPalette.textPrimary,
    lineHeight: 21,
  },
  finalScoreNumber: {
    fontSize: 44,
    fontWeight: '800',
    color: SecurityPalette.safe,
    marginBottom: 8,
  },
  reviewBox: {
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  reviewStatus: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  reviewQ: {
    fontSize: 14,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
  },
  reviewAns: {
    fontSize: 13,
    fontWeight: '600',
    color: SecurityPalette.safe,
    marginBottom: 4,
  },
  reviewExplain: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    lineHeight: 19,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: SecurityPalette.surface,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  tabPillActive: {
    backgroundColor: SecurityPalette.primary,
    borderColor: SecurityPalette.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.textSecondary,
  },
  newsTakeaway: {
    marginTop: 10,
    backgroundColor: SecurityPalette.safeSoft,
    padding: 12,
    borderRadius: Radius.md,
  },
  newsTakeawayText: {
    fontSize: 13,
    fontWeight: '600',
    color: SecurityPalette.safe,
  },
});
