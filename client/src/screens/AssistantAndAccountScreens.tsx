import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/security';
import { SecurityPalette, Spacing, Radius } from '../theme/theme';
import {
  AppButton,
  AppInput,
  AppDropdown,
  ActivityItemRow,
  StatusCard,
  ConfirmModal,
  EmptyStateView,
} from '../design-system/components';
import { useSecurityStore } from '../store/useSecurityStore';
import { LEARNING_TOPICS } from '../data/mockSecurityData';

/* ============================================================================
 * 1. ACTIVITY TIMELINE SCREEN (/activity) — Section 23
 * ========================================================================== */
type ActivityProps = NativeStackScreenProps<
  RootStackParamList,
  'ActivityTimeline'
>;

export const ActivityTimelineScreen: React.FC<ActivityProps> = ({
  navigation,
}) => {
  const activityTimeline = useSecurityStore((state) => state.activityTimeline);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.pageTitle}>Activity</Text>
          <Text style={styles.pageSubtitle}>
            Timeline of your recent safety checks and reminders.
          </Text>
        </View>
        <AppButton
          label="Scan History"
          onPress={() => navigation.navigate('ScanHistory')}
          variant="secondary"
        />
      </View>

      {activityTimeline.length === 0 ? (
        <EmptyStateView
          title="You haven't scanned anything yet."
          message="Your recent website, QR, and Wi-Fi safety events will appear here."
          actionLabel="Check a Website"
          onAction={() => navigation.navigate('UrlScanner')}
        />
      ) : (
        <View style={styles.card}>
          {activityTimeline.map((item) => (
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
                  : undefined
              }
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

/* ============================================================================
 * 2. CYBER AI ASSISTANT (/assistant) — Section 24
 * ========================================================================== */
type AssistantProps = NativeStackScreenProps<
  RootStackParamList,
  'CyberAssistant'
>;

const SUGGESTED_QUESTIONS: readonly string[] = [
  'Is this website safe?',
  'I received a suspicious message.',
  'How do I secure my Wi-Fi?',
  'My account may have been hacked.',
];

export const CyberAssistantScreen: React.FC<AssistantProps> = () => {
  const messages = useSecurityStore((state) => state.assistantMessages);
  const sendQuestion = useSecurityStore((state) => state.sendAssistantQuestion);
  const [questionInput, setQuestionInput] = useState('');

  const handleSend = (textOverride?: string) => {
    const q = (textOverride ?? questionInput).trim();
    if (!q) return;
    sendQuestion(q);
    if (!textOverride) {
      setQuestionInput('');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Cyber Assistant</Text>
      <Text style={styles.pageSubtitle}>
        Your personal cybersecurity guide.
      </Text>

      {/* Suggested Questions */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>SUGGESTED QUESTIONS</Text>
        <View style={styles.suggestionsWrap}>
          {SUGGESTED_QUESTIONS.map((q) => (
            <Pressable
              key={q}
              onPress={() => handleSend(q)}
              style={styles.suggestionChip}>
              <Text style={styles.suggestionText}>"{q}"</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Conversational Thread */}
      <View style={styles.chatContainer}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.assistantBubble,
              ]}>
              <Text style={styles.messageSender}>
                {isUser ? 'You' : 'Cyber Assistant'} • {msg.timestamp}
              </Text>
              <Text style={styles.messageText}>{msg.text}</Text>

              {msg.structuredReply ? (
                <View style={styles.structuredBox}>
                  <Text style={styles.structLabel}>WHAT HAPPENED?</Text>
                  <Text style={styles.structBody}>
                    {msg.structuredReply.whatHappened}
                  </Text>

                  <Text style={[styles.structLabel, { marginTop: 8 }]}>
                    WHY DOES IT MATTER?
                  </Text>
                  <Text style={styles.structBody}>
                    {msg.structuredReply.whyItMatters}
                  </Text>

                  <Text
                    style={[
                      styles.structLabel,
                      { marginTop: 8, color: SecurityPalette.safe },
                    ]}>
                    WHAT SHOULD I DO?
                  </Text>
                  {msg.structuredReply.whatShouldIDo.map((step, i) => (
                    <Text key={i} style={styles.structBullet}>
                      • {step}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      {/* Ask Input Box */}
      <View style={styles.card}>
        <AppInput
          label="Ask a question in plain language"
          placeholder="e.g., Someone asked me for a 6-digit code..."
          value={questionInput}
          onChangeText={setQuestionInput}
        />
        <AppButton
          label="Ask Cyber Assistant"
          onPress={() => handleSend()}
          variant="primary"
          fullWidth
        />
      </View>
    </ScrollView>
  );
};

/* ============================================================================
 * 3. PROFILE SCREEN (/profile) — Section 25 & 27
 * ========================================================================== */
type ProfileProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<ProfileProps> = ({ navigation }) => {
  const user = useSecurityStore((state) => state.user);
  const score = useSecurityStore((state) => state.score);
  const completedLessons = useSecurityStore((state) => state.completedLessons);
  const scanHistory = useSecurityStore((state) => state.scanHistory);
  const quizHighScore = useSecurityStore((state) => state.quizHighScore);
  const signOut = useSecurityStore((state) => state.signOut);

  const [signOutModalVisible, setSignOutModalVisible] = useState(false);

  // Dynamic Gamification Metrics calculated strictly from actual user events
  const awarenessPoints =
    scanHistory.length * 20 +
    completedLessons.length * 25 +
    (quizHighScore > 0 ? quizHighScore : 0);
  const userLevel = Math.max(1, Math.floor(awarenessPoints / 100) + 1);
  const currentStreak = scanHistory.length > 0 ? 1 : 0;
  const weeklyGoalTarget = 5;
  const weeklyGoalCompleted = Math.min(weeklyGoalTarget, scanHistory.length);
  const hasUnlockedBadges = user.achievements.some((a) => a.unlocked);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Profile</Text>
      <Text style={styles.pageSubtitle}>
        Your personal safety milestones and account summary.
      </Text>

      {/* Identity Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{user.avatarInitials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{user.fullName}</Text>
          <Text style={styles.profileEmail}>{user.email || 'Local Secure Session'}</Text>
          <Text style={styles.profileSince}>
            Protected since {user.memberSince}
          </Text>
        </View>
      </View>

      {/* Key Statistics */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: SecurityPalette.safe }]}>
            {score !== null ? `${score}/100` : '--'}
          </Text>
          <Text style={styles.statLabel}>Security Score</Text>
        </View>
        <View style={styles.statBox}>
          <Text
            style={[styles.statNumber, { color: SecurityPalette.primary }]}>
            {completedLessons.length}/{LEARNING_TOPICS.length}
          </Text>
          <Text style={styles.statLabel}>Learning Progress</Text>
        </View>
        <View style={styles.statBox}>
          <Text
            style={[styles.statNumber, { color: SecurityPalette.interactive }]}>
            {scanHistory.length}
          </Text>
          <Text style={styles.statLabel}>Scans Completed</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: SecurityPalette.warning }]}>
            {quizHighScore}%
          </Text>
          <Text style={styles.statLabel}>Best Quiz Score</Text>
        </View>
      </View>

      {/* GAMIFICATION & PROGRESS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cyber Gamification</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: SecurityPalette.interactive }]}>
              {awarenessPoints}
            </Text>
            <Text style={styles.statLabel}>Awareness Points</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: SecurityPalette.primary }]}>
              Level {userLevel}
            </Text>
            <Text style={styles.statLabel}>Cyber Rank</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: SecurityPalette.safe }]}>
              {currentStreak}d
            </Text>
            <Text style={styles.statLabel}>Security Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: SecurityPalette.warning }]}>
              {weeklyGoalCompleted}/{weeklyGoalTarget}
            </Text>
            <Text style={styles.statLabel}>Weekly Goal</Text>
          </View>
        </View>
      </View>

      {/* Achievements / Badges */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Security Badges</Text>
        {!hasUnlockedBadges ? (
          <View style={styles.emptyBadgeBox}>
            <Text style={styles.emptyBadgeText}>
              Start your first security activity to earn your first badge.
            </Text>
          </View>
        ) : (
          user.achievements.map((ach) => (
            <StatusCard
              key={ach.id}
              title={ach.title}
              subtitle={ach.description}
              status={ach.unlocked ? 'SAFE' : 'ATTENTION'}
              statusLabel={ach.unlocked ? '✓ Unlocked' : 'In Progress'}
            />
          ))
        )}
      </View>

      <View style={styles.actionsStack}>
        <AppButton
          label="Open Settings"
          onPress={() => navigation.navigate('Settings')}
          variant="secondary"
          fullWidth
        />
        <AppButton
          label="Sign Out"
          onPress={() => setSignOutModalVisible(true)}
          variant="danger"
          fullWidth
        />
      </View>

      <ConfirmModal
        visible={signOutModalVisible}
        title="Sign out of Cyber Companion?"
        message="You can sign back in anytime with your email and password."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        isDanger
        onCancel={() => setSignOutModalVisible(false)}
        onConfirm={() => {
          setSignOutModalVisible(false);
          signOut();
        }}
      />
    </ScrollView>
  );
};

/* ============================================================================
 * 4. SETTINGS SCREEN (/settings) — Section 26 & 27
 * ========================================================================== */
type SettingsProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<SettingsProps> = ({ navigation }) => {
  const user = useSecurityStore((state) => state.user);
  const updateProfile = useSecurityStore((state) => state.updateProfile);
  const twoFactorEnabled = useSecurityStore((state) => state.twoFactorEnabled);
  const biometricEnabled = useSecurityStore((state) => state.biometricEnabled);
  const threatAlertsEnabled = useSecurityStore(
    (state) => state.threatAlertsEnabled,
  );
  const dailyTipsEnabled = useSecurityStore((state) => state.dailyTipsEnabled);
  const securityUpdatesEnabled = useSecurityStore(
    (state) => state.securityUpdatesEnabled,
  );
  const appearanceMode = useSecurityStore((state) => state.appearanceMode);
  const language = useSecurityStore((state) => state.language);
  const toggleSetting = useSecurityStore((state) => state.toggleSetting);
  const setAppearanceMode = useSecurityStore(
    (state) => state.setAppearanceMode,
  );
  const setLanguage = useSecurityStore((state) => state.setLanguage);
  const clearScanHistory = useSecurityStore((state) => state.clearScanHistory);
  const signOut = useSecurityStore((state) => state.signOut);

  const [nameInput, setNameInput] = useState(user.fullName);
  const [emailInput, setEmailInput] = useState(user.email);
  const [savedNotice, setSavedNotice] = useState('');
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Settings</Text>
      <Text style={styles.pageSubtitle}>
        Manage your account, security preferences, notifications, and data.
      </Text>

      {savedNotice ? (
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText}>✓ {savedNotice}</Text>
        </View>
      ) : null}

      {/* 1. ACCOUNT */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <AppInput
          label="Full name"
          value={nameInput}
          onChangeText={setNameInput}
        />
        <AppInput
          label="Email address"
          value={emailInput}
          onChangeText={setEmailInput}
        />
        <View style={styles.rowGap}>
          <View style={{ flex: 1 }}>
            <AppButton
              label="Save Profile"
              onPress={() => {
                updateProfile(nameInput, emailInput);
                setSavedNotice('Account profile updated.');
              }}
              variant="primary"
              fullWidth
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton
              label="Change Password"
              onPress={() => navigation.navigate('PasswordSecurity')}
              variant="secondary"
              fullWidth
            />
          </View>
        </View>
      </View>

      {/* 2. SECURITY */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Security</Text>
        <StatusCard
          title="Two-Factor Authentication (2FA)"
          subtitle="Extra verification code when signing in"
          status={twoFactorEnabled ? 'SAFE' : 'ATTENTION'}
          statusLabel={twoFactorEnabled ? '✓ Enabled' : 'Off'}
          onPress={() => toggleSetting('twoFactorEnabled')}
        />
        <StatusCard
          title="Biometric lock"
          subtitle="Unlock Cyber Companion with fingerprint or face"
          status={biometricEnabled ? 'SAFE' : 'ATTENTION'}
          statusLabel={biometricEnabled ? '✓ Enabled' : 'Off'}
          onPress={() => toggleSetting('biometricEnabled')}
        />
        <StatusCard
          title="Active sessions"
          subtitle="1 active device (This device)"
          status="SAFE"
          statusLabel="✓ Verified"
        />
      </View>

      {/* 3. NOTIFICATIONS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notifications</Text>
        <StatusCard
          title="Threat alerts"
          subtitle="Notify me about major phishing or scam waves"
          status={threatAlertsEnabled ? 'SAFE' : 'ATTENTION'}
          statusLabel={threatAlertsEnabled ? '✓ On' : 'Muted'}
          onPress={() => toggleSetting('threatAlertsEnabled')}
        />
        <StatusCard
          title="Daily tips"
          subtitle="One calm, helpful security habit each day"
          status={dailyTipsEnabled ? 'SAFE' : 'ATTENTION'}
          statusLabel={dailyTipsEnabled ? '✓ On' : 'Muted'}
          onPress={() => toggleSetting('dailyTipsEnabled')}
        />
        <StatusCard
          title="Security updates"
          subtitle="Monthly device and privacy check reminders"
          status={securityUpdatesEnabled ? 'SAFE' : 'ATTENTION'}
          statusLabel={securityUpdatesEnabled ? '✓ On' : 'Muted'}
          onPress={() => toggleSetting('securityUpdatesEnabled')}
        />
      </View>

      {/* 4. PRIVACY (Screen 20 Link) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Privacy</Text>
        <StatusCard
          title="Privacy Center"
          subtitle="Your data, your control — camera, network, and app sensor access"
          status="SAFE"
          statusLabel="Open →"
          onPress={() => navigation.navigate('PrivacyCenter')}
        />
        <StatusCard
          title="App permissions"
          subtitle="Review Camera, Microphone, Contacts, and Location access"
          status="SAFE"
          statusLabel="Audit →"
          onPress={() => navigation.navigate('PermissionAnalyzer')}
        />
        <StatusCard
          title="Data controls"
          subtitle="All checks run privately—your personal data is never sold"
          status="SAFE"
          statusLabel="✓ Protected"
        />
      </View>

      {/* 5. ADVANCED MODE & APPEARANCE (Screen 19) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preferences & Modes</Text>
        <StatusCard
          title="Advanced Mode"
          subtitle="Show deep technical telemetry (DNS, SSL ciphers, raw headers, threat hashes)"
          status={advancedMode ? 'SAFE' : 'ATTENTION'}
          statusLabel={advancedMode ? 'Active' : 'Simple'}
          onPress={() => setAdvancedMode((prev) => !prev)}
        />
        <AppDropdown
          label="Appearance"
          selectedValue={appearanceMode}
          options={['Dark', 'Light', 'System']}
          onSelect={(val) =>
            setAppearanceMode(val as 'Dark' | 'Light' | 'System')
          }
        />
        <AppDropdown
          label="Language"
          selectedValue={language}
          options={['English', 'Hindi', 'Spanish', 'French']}
          onSelect={setLanguage}
        />
      </View>

      {/* 7. DATA & 8. ABOUT */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data & About</Text>
        <View style={styles.rowGap}>
          <View style={{ flex: 1 }}>
            <AppButton
              label="Export data"
              onPress={() =>
                setSavedNotice('Your security summary report was exported.')
              }
              variant="secondary"
              fullWidth
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton
              label="Clear history"
              onPress={() => {
                clearScanHistory();
                setSavedNotice('Scan history cleared.');
              }}
              variant="secondary"
              fullWidth
            />
          </View>
        </View>
        <View style={styles.aboutList}>
          <Text style={styles.aboutItem}>Version: 2.0.0 (Calm Security Edition)</Text>
          <Text style={styles.aboutItem}>Help & Support • Privacy Policy • Terms of Use</Text>
        </View>
      </View>

      <AppButton
        label="Sign Out"
        onPress={() => setSignOutModalVisible(true)}
        variant="danger"
        fullWidth
      />

      <ConfirmModal
        visible={signOutModalVisible}
        title="Sign out of Cyber Companion?"
        message="You will be returned to the Sign In screen."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        isDanger
        onCancel={() => setSignOutModalVisible(false)}
        onConfirm={() => {
          setSignOutModalVisible(false);
          signOut();
        }}
      />
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 15,
    color: SecurityPalette.textSecondary,
    lineHeight: 22,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: SecurityPalette.interactive,
    letterSpacing: 0.7,
    marginBottom: 10,
  },
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: SecurityPalette.surfaceVariant,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: SecurityPalette.textPrimary,
  },
  chatContainer: {
    gap: 12,
    marginBottom: Spacing.lg,
  },
  messageBubble: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: SecurityPalette.primarySoft,
    borderColor: SecurityPalette.primary,
    alignSelf: 'flex-end',
    maxWidth: '90%',
  },
  assistantBubble: {
    backgroundColor: SecurityPalette.surface,
    borderColor: SecurityPalette.border,
    alignSelf: 'flex-start',
    width: '100%',
  },
  messageSender: {
    fontSize: 11,
    fontWeight: '700',
    color: SecurityPalette.textSecondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: SecurityPalette.textPrimary,
    lineHeight: 22,
  },
  structuredBox: {
    marginTop: 12,
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: Radius.md,
    padding: 12,
  },
  structLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: SecurityPalette.interactive,
    marginBottom: 2,
  },
  structBody: {
    fontSize: 14,
    color: SecurityPalette.textPrimary,
    lineHeight: 20,
  },
  structBullet: {
    fontSize: 14,
    color: SecurityPalette.textPrimary,
    lineHeight: 21,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.lg,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: SecurityPalette.primarySoft,
    borderWidth: 2,
    borderColor: SecurityPalette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: SecurityPalette.primary,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
  },
  profileEmail: {
    fontSize: 14,
    color: SecurityPalette.textSecondary,
    marginTop: 2,
  },
  profileSince: {
    fontSize: 12,
    color: SecurityPalette.textMuted,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  statBox: {
    flex: 1,
    minWidth: 140,
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
    fontWeight: '600',
  },
  actionsStack: {
    gap: 10,
  },
  rowGap: {
    flexDirection: 'row',
    gap: 10,
  },
  noticeBanner: {
    backgroundColor: SecurityPalette.safeSoft,
    borderColor: SecurityPalette.safe,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: Spacing.md,
  },
  noticeText: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.safe,
  },
  aboutList: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: SecurityPalette.border,
    gap: 4,
  },
  aboutItem: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
  },
  emptyBadgeBox: {
    padding: Spacing.md,
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emptyBadgeText: {
    fontSize: 13,
    color: SecurityPalette.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
