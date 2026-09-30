import { create } from 'zustand';
import {
  HolisticSecurityScore,
  UrlScanResult,
  WifiRiskAssessment,
  AppPermissionAuditItem,
  RiskSeverity,
  UserProfile,
  ScanHistoryEntry,
  ActivityTimelineEntry,
  PrivacyPermissionCategory,
  CyberAssistantMessage,
  PermissionAccessState,
} from '../types/security';
import {
  INITIAL_SCAN_HISTORY,
  INITIAL_ACTIVITY_TIMELINE,
  INITIAL_PRIVACY_PERMISSIONS,
} from '../data/mockSecurityData';
import { CyberSecurityService } from '../services/cyberService';

export interface SecurityState {
  // Authentication State
  readonly isAuthenticated: boolean;
  readonly pendingVerificationEmail: string;
  readonly user: UserProfile;
  signIn: (email: string, nameOverride?: string) => void;
  signUp: (fullName: string, email: string) => void;
  verifyOtpAndSignIn: () => void;
  signOut: () => void;
  updateProfile: (fullName: string, email: string) => void;

  // Holistic Security Score & Breakdown
  readonly score: number;
  readonly unverifiedPermissionsCount: number;
  readonly summaryMessage: string;
  readonly securityScore: HolisticSecurityScore;
  setScore: (newScore: number, customSummary?: string) => void;
  setSecurityScore: (score: HolisticSecurityScore) => void;
  improveSecurityAutomatically: () => void;

  // Scanners, History & Activity
  readonly lastWifiAssessment: WifiRiskAssessment | null;
  readonly recentUrlScans: readonly UrlScanResult[];
  readonly permissionAudits: readonly AppPermissionAuditItem[];
  readonly scanHistory: readonly ScanHistoryEntry[];
  readonly activityTimeline: readonly ActivityTimelineEntry[];
  setWifiAssessment: (assessment: WifiRiskAssessment) => void;
  addUrlScanResult: (result: UrlScanResult) => void;
  addScanHistoryItem: (item: Omit<ScanHistoryEntry, 'id' | 'date' | 'time'>) => void;
  deleteScanHistoryItem: (id: string) => void;
  clearScanHistory: () => void;
  setPermissionAudits: (audits: readonly AppPermissionAuditItem[]) => void;

  // Privacy Permissions
  readonly privacyPermissions: readonly PrivacyPermissionCategory[];
  cyclePrivacyPermission: (
    id: PrivacyPermissionCategory['id'],
  ) => void;
  reviewAndTightenPrivacy: () => void;

  // Learning & Quiz
  readonly completedLessons: readonly string[];
  readonly quizHighScore: number;
  markLessonCompleted: (topicId: string) => void;
  saveQuizScore: (score: number) => void;

  // Cyber AI Assistant
  readonly assistantMessages: readonly CyberAssistantMessage[];
  sendAssistantQuestion: (question: string) => void;

  // Settings
  readonly twoFactorEnabled: boolean;
  readonly biometricEnabled: boolean;
  readonly threatAlertsEnabled: boolean;
  readonly dailyTipsEnabled: boolean;
  readonly securityUpdatesEnabled: boolean;
  readonly appearanceMode: 'Dark' | 'Light' | 'System';
  readonly language: string;
  toggleSetting: (
    key:
      | 'twoFactorEnabled'
      | 'biometricEnabled'
      | 'threatAlertsEnabled'
      | 'dailyTipsEnabled'
      | 'securityUpdatesEnabled',
  ) => void;
  setAppearanceMode: (mode: 'Dark' | 'Light' | 'System') => void;
  setLanguage: (language: string) => void;

  // Common UI flags
  readonly isLoading: boolean;
  readonly error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const mapScoreToSeverity = (score: number): RiskSeverity => {
  if (score >= 80) return 'LOW';
  if (score >= 50) return 'MEDIUM';
  return 'CRITICAL';
};

const INITIAL_USER: UserProfile = {
  id: 'usr-01',
  fullName: 'Anurag Sharma',
  email: 'anurag@cybercompanion.app',
  avatarInitials: 'AS',
  memberSince: 'September 2026',
  completedLessons: ['phishing', 'public-wifi'],
  quizHighScore: 80,
  achievements: [
    {
      id: 'ach-1',
      title: 'First Link Checked',
      description: 'Verified a website address before opening it.',
      unlocked: true,
    },
    {
      id: 'ach-2',
      title: 'Wi-Fi Guardian',
      description: 'Checked your Wi-Fi network security.',
      unlocked: true,
    },
    {
      id: 'ach-3',
      title: 'Privacy Defender',
      description: 'Reviewed app permissions in the Privacy Center.',
      unlocked: true,
    },
    {
      id: 'ach-4',
      title: 'Quiz Champion',
      description: 'Score 100% on the Security Awareness Quiz.',
      unlocked: false,
    },
  ],
};

const INITIAL_SECURITY_SCORE: HolisticSecurityScore = {
  overallScore: 84,
  wifiSafetyScore: 88,
  urlHygieneScore: 90,
  appPermissionScore: 72,
  breakdown: {
    password: 86,
    device: 90,
    network: 88,
    privacy: 72,
    awareness: 84,
  },
  severity: 'LOW',
  updatedAt: new Date().toISOString(),
};

const INITIAL_ASSISTANT_MESSAGES: readonly CyberAssistantMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    text: "Hello! I'm your Cyber Assistant. Ask me anything about suspicious links, text messages, Wi-Fi safety, or account protection—I'll explain it simply.",
    timestamp: 'Just now',
  },
];

export const useSecurityStore = create<SecurityState>((set) => ({
  isAuthenticated: true,
  pendingVerificationEmail: 'anurag@cybercompanion.app',
  user: INITIAL_USER,

  signIn: (email, nameOverride) => {
    const cleanEmail = email.trim() || 'anurag@cybercompanion.app';
    const derivedName =
      nameOverride?.trim() ||
      (cleanEmail.includes('@')
        ? cleanEmail
            .split('@')[0]
            .replace(/[._-]/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase())
        : 'Anurag Sharma');
    const initials = derivedName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    set((state) => ({
      isAuthenticated: true,
      user: {
        ...state.user,
        fullName: derivedName,
        email: cleanEmail,
        avatarInitials: initials || 'CC',
      },
    }));
  },

  signUp: (fullName, email) => {
    const cleanName = fullName.trim() || 'Anurag Sharma';
    const cleanEmail = email.trim() || 'anurag@cybercompanion.app';
    const initials = cleanName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    set((state) => ({
      pendingVerificationEmail: cleanEmail,
      user: {
        ...state.user,
        fullName: cleanName,
        email: cleanEmail,
        avatarInitials: initials || 'CC',
      },
    }));
  },

  verifyOtpAndSignIn: () => set({ isAuthenticated: true }),

  signOut: () => set({ isAuthenticated: false }),

  updateProfile: (fullName, email) =>
    set((state) => ({
      user: {
        ...state.user,
        fullName: fullName.trim() || state.user.fullName,
        email: email.trim() || state.user.email,
      },
    })),

  score: INITIAL_SECURITY_SCORE.overallScore,
  unverifiedPermissionsCount: 2,
  summaryMessage: 'Your device has 2 permissions that need attention.',
  securityScore: INITIAL_SECURITY_SCORE,

  setScore: (rawScore, customSummary) => {
    const normalized = Math.max(0, Math.min(100, Math.round(rawScore)));
    set((state) => ({
      score: normalized,
      summaryMessage:
        customSummary ??
        (normalized >= 80
          ? 'Your digital safety is in good shape.'
          : normalized >= 50
            ? 'A few privacy and network settings need attention.'
            : 'Important security items need your attention.'),
      securityScore: {
        ...state.securityScore,
        overallScore: normalized,
        severity: mapScoreToSeverity(normalized),
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  setSecurityScore: (securityScore) =>
    set({
      score: securityScore.overallScore,
      securityScore,
    }),

  improveSecurityAutomatically: () =>
    set((state) => ({
      score: 94,
      unverifiedPermissionsCount: 0,
      summaryMessage: 'All device, network, and privacy checks look good.',
      securityScore: {
        ...state.securityScore,
        overallScore: 94,
        appPermissionScore: 95,
        breakdown: {
          password: 92,
          device: 96,
          network: 94,
          privacy: 95,
          awareness: 93,
        },
        severity: 'LOW',
        updatedAt: new Date().toISOString(),
      },
      privacyPermissions: state.privacyPermissions.map((p) =>
        p.id === 'microphone' || p.id === 'contacts'
          ? { ...p, status: 'Limited', flaggedApps: [], plainDescription: 'Restricted to trusted use only.' }
          : p,
      ),
    })),

  lastWifiAssessment: null,
  recentUrlScans: [],
  permissionAudits: [],
  scanHistory: INITIAL_SCAN_HISTORY,
  activityTimeline: INITIAL_ACTIVITY_TIMELINE,

  setWifiAssessment: (lastWifiAssessment) => set({ lastWifiAssessment }),

  addUrlScanResult: (result) =>
    set((state) => ({
      recentUrlScans: [result, ...state.recentUrlScans].slice(0, 25),
    })),

  addScanHistoryItem: (item) =>
    set((state) => {
      const newEntry: ScanHistoryEntry = {
        ...item,
        id: `scan-${Date.now()}`,
        date: 'Today',
        time: 'Just now',
      };
      const newActivity: ActivityTimelineEntry = {
        id: `act-${Date.now()}`,
        title:
          item.type === 'URLs'
            ? `Website checked — ${item.result}`
            : item.type === 'QR'
              ? `QR scanned — ${item.result}`
              : `Wi-Fi checked — ${item.result}`,
        subtitle: item.target,
        status: item.status,
        statusLabel: item.result === 'Dangerous' ? 'Suspicious' : item.result,
        timestamp: 'Just now',
      };
      return {
        scanHistory: [newEntry, ...state.scanHistory],
        activityTimeline: [newActivity, ...state.activityTimeline],
      };
    }),

  deleteScanHistoryItem: (id) =>
    set((state) => ({
      scanHistory: state.scanHistory.filter((item) => item.id !== id),
    })),

  clearScanHistory: () => set({ scanHistory: [] }),

  setPermissionAudits: (permissionAudits) => set({ permissionAudits }),

  privacyPermissions: INITIAL_PRIVACY_PERMISSIONS,

  cyclePrivacyPermission: (id) =>
    set((state) => {
      const nextOrder: Record<PermissionAccessState, PermissionAccessState> = {
        Allowed: 'Limited',
        Limited: 'Denied',
        Denied: 'Allowed',
      };
      const updated = state.privacyPermissions.map((perm) =>
        perm.id === id
          ? {
              ...perm,
              status: nextOrder[perm.status],
              flaggedApps:
                nextOrder[perm.status] === 'Allowed' ? perm.flaggedApps : [],
            }
          : perm,
      );
      return { privacyPermissions: updated };
    }),

  reviewAndTightenPrivacy: () =>
    set((state) => ({
      unverifiedPermissionsCount: 0,
      score: Math.min(100, Math.max(state.score, 92)),
      summaryMessage: 'Privacy permissions reviewed and secured.',
      securityScore: {
        ...state.securityScore,
        overallScore: Math.min(100, Math.max(state.score, 92)),
        appPermissionScore: 94,
        breakdown: {
          ...state.securityScore.breakdown,
          privacy: 94,
        },
      },
      privacyPermissions: state.privacyPermissions.map((perm) =>
        perm.status === 'Allowed' && perm.flaggedApps.length > 0
          ? {
              ...perm,
              status: 'Limited',
              flaggedApps: [],
              plainDescription: 'Reviewed and limited to active use only.',
            }
          : perm,
      ),
    })),

  completedLessons: INITIAL_USER.completedLessons,
  quizHighScore: INITIAL_USER.quizHighScore,

  markLessonCompleted: (topicId) =>
    set((state) => {
      if (state.completedLessons.includes(topicId)) return state;
      const nextLessons = [...state.completedLessons, topicId];
      return {
        completedLessons: nextLessons,
        securityScore: {
          ...state.securityScore,
          breakdown: {
            ...state.securityScore.breakdown,
            awareness: Math.min(100, state.securityScore.breakdown.awareness + 4),
          },
        },
      };
    }),

  saveQuizScore: (quizScore) =>
    set((state) => ({
      quizHighScore: Math.max(state.quizHighScore, quizScore),
    })),

  assistantMessages: INITIAL_ASSISTANT_MESSAGES,

  sendAssistantQuestion: (question) =>
    set((state) => {
      const trimmed = question.trim();
      if (!trimmed) return state;
      const userMsg: CyberAssistantMessage = {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: trimmed,
        timestamp: 'Just now',
      };
      const aiReply = CyberSecurityService.askCyberAssistant(trimmed);
      const botMsg: CyberAssistantMessage = {
        id: `a-${Date.now() + 1}`,
        sender: 'assistant',
        text: aiReply.text,
        timestamp: 'Just now',
        structuredReply: aiReply.structured,
      };
      return {
        assistantMessages: [...state.assistantMessages, userMsg, botMsg],
      };
    }),

  twoFactorEnabled: true,
  biometricEnabled: true,
  threatAlertsEnabled: true,
  dailyTipsEnabled: true,
  securityUpdatesEnabled: true,
  appearanceMode: 'Dark',
  language: 'English',

  toggleSetting: (key) =>
    set((state) => ({
      [key]: !state[key],
    })),

  setAppearanceMode: (appearanceMode) => set({ appearanceMode }),
  setLanguage: (language) => set({ language }),

  isLoading: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
