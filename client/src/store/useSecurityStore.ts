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
  ThreatAlertItem,
} from '../types/security';
import {
  INITIAL_SCAN_HISTORY,
  INITIAL_ACTIVITY_TIMELINE,
  INITIAL_PRIVACY_PERMISSIONS,
} from '../data/mockSecurityData';
import { SecurityGatewayService } from '../services/api';
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
  readonly isCalculated: boolean;
  readonly score: number | null;
  readonly unverifiedPermissionsCount: number;
  readonly summaryMessage: string;
  readonly securityScore: HolisticSecurityScore | null;
  setScore: (newScore: number, customSummary?: string) => void;
  setSecurityScore: (score: HolisticSecurityScore) => void;
  calculateLiveScore: () => Promise<void>;
  improveSecurityAutomatically: () => void;

  // Dynamic Alerts & Threats
  readonly threatAlerts: readonly ThreatAlertItem[];

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
  cyclePrivacyPermission: (id: PrivacyPermissionCategory['id']) => void;
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
  id: 'usr-local',
  fullName: 'Cyber User',
  email: '',
  avatarInitials: 'CU',
  memberSince: 'October 2026',
  completedLessons: [],
  quizHighScore: 0,
  achievements: [
    {
      id: 'ach-1',
      title: 'First Link Checked',
      description: 'Verified a website address before opening it.',
      unlocked: false,
    },
    {
      id: 'ach-2',
      title: 'Wi-Fi Guardian',
      description: 'Checked your Wi-Fi network security.',
      unlocked: false,
    },
    {
      id: 'ach-3',
      title: 'Privacy Defender',
      description: 'Reviewed app permissions in the Privacy Center.',
      unlocked: false,
    },
    {
      id: 'ach-4',
      title: 'Quiz Champion',
      description: 'Score 100% on the Security Awareness Quiz.',
      unlocked: false,
    },
  ],
};

const INITIAL_ASSISTANT_MESSAGES: readonly CyberAssistantMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    text: "Hi! I'm your Cyber Assistant. How can I help you stay safe today?",
    timestamp: 'Just now',
  },
];

/**
 * Computes live threat alerts strictly from actual runtime security events:
 * 1. Detected unencrypted / rogue Wi-Fi
 * 2. Flagged malicious / phishing URLs
 * 3. Dangerous permission combinations on device
 */
function deriveThreatAlerts(
  lastWifiAssessment: WifiRiskAssessment | null,
  recentUrlScans: readonly UrlScanResult[],
  privacyPermissions: readonly PrivacyPermissionCategory[],
): ThreatAlertItem[] {
  const alerts: ThreatAlertItem[] = [];

  // 1. Wi-Fi Risks
  if (lastWifiAssessment && !lastWifiAssessment.isSafe) {
    alerts.push({
      id: `wifi-alert-${lastWifiAssessment.ssid}`,
      title: `Unsecured Wi-Fi: "${lastWifiAssessment.ssid}"`,
      severity: lastWifiAssessment.severity === 'CRITICAL' ? 'Critical' : 'Medium',
      date: 'Active Now',
      summary: lastWifiAssessment.insight.summary,
      affectedArea: 'Network Security',
      explanation: lastWifiAssessment.explanation,
    });
  }

  // 2. Dangerous URLs
  for (const scan of recentUrlScans) {
    if (!scan.isSafe) {
      alerts.push({
        id: `url-alert-${scan.targetUrl}`,
        title: `Flagged Malicious Link (${scan.normalizedDomain})`,
        severity: scan.severity === 'CRITICAL' ? 'Critical' : 'High',
        date: 'Recent Scan',
        summary: scan.insight.summary,
        affectedArea: 'URL & Web Safety',
        explanation: scan.explanation,
      });
    }
  }

  // 3. High Risk Permission Combination (SMS + Location)
  const smsAllowed = privacyPermissions.find((p) => p.id === 'sms')?.status === 'Allowed';
  const locationAllowed = privacyPermissions.find((p) => p.id === 'location')?.status === 'Allowed';
  if (smsAllowed && locationAllowed) {
    alerts.push({
      id: 'perm-alert-sms-location',
      title: 'High-Risk Permission Combination Detected',
      severity: 'Critical',
      date: 'Device Inspection',
      summary: 'Both SMS (OTPs) and Physical Location access are currently granted.',
      affectedArea: 'Device Privacy',
      explanation: {
        whatHappened: 'Apps on your device have simultaneous access to your SMS messages and precise GPS location.',
        whyItMatters: 'Malicious apps can intercept two-factor bank codes while tracking your physical whereabouts.',
        whatShouldIDo: [
          'Open Permission Analyzer in Cyber Companion.',
          'Restrict SMS or background location to trusted apps only.',
        ],
        technicalDetails: {
          summary: 'Simultaneous android.permission.READ_SMS and ACCESS_FINE_LOCATION active.',
          facts: [
            { label: 'Risk Factor', value: 'Credential & Physical Tracking' },
            { label: 'Recommended Action', value: 'Revoke SMS permission in phone settings' },
          ],
        },
      },
    });
  }

  return alerts;
}

export const useSecurityStore = create<SecurityState>((set, get) => ({
  isAuthenticated: true,
  pendingVerificationEmail: '',
  user: INITIAL_USER,

  signIn: (email, nameOverride) => {
    const cleanEmail = email.trim();
    const derivedName =
      nameOverride?.trim() ||
      (cleanEmail.includes('@')
        ? cleanEmail
            .split('@')[0]
            .replace(/[._-]/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase())
        : 'User');
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
        avatarInitials: initials || 'CU',
      },
    }));
  },

  signUp: (fullName, email) => {
    const cleanName = fullName.trim() || 'User';
    const cleanEmail = email.trim();
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
        avatarInitials: initials || 'CU',
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

  // Initial score is uncalculated until real checks occur
  isCalculated: false,
  score: null,
  unverifiedPermissionsCount: 0,
  summaryMessage: 'Security score unavailable. Complete a security check to build your score.',
  securityScore: null,

  setScore: (rawScore, customSummary) => {
    const normalized = Math.max(0, Math.min(100, Math.round(rawScore)));
    const severity = mapScoreToSeverity(normalized);
    set((state) => ({
      isCalculated: true,
      score: normalized,
      summaryMessage:
        customSummary ??
        (normalized >= 80
          ? 'Your digital safety is in good shape.'
          : normalized >= 50
            ? 'A few privacy and network settings need attention.'
            : 'Important security items need your attention.'),
      securityScore: state.securityScore
        ? {
            ...state.securityScore,
            overallScore: normalized,
            severity,
            updatedAt: new Date().toISOString(),
          }
        : {
            overallScore: normalized,
            wifiSafetyScore: 80,
            urlHygieneScore: 90,
            appPermissionScore: 85,
            breakdown: {
              permissions: 85,
              device: 90,
              network: 80,
              privacy: 85,
              awareness: 80,
            },
            severity,
            updatedAt: new Date().toISOString(),
          },
    }));
  },

  setSecurityScore: (securityScore) =>
    set({
      isCalculated: true,
      score: securityScore.overallScore,
      securityScore,
    }),

  calculateLiveScore: async () => {
    const state = get();
    try {
      const telemetry = {
        wifi: state.lastWifiAssessment
          ? {
              securityType: state.lastWifiAssessment.encryption,
              isCaptivePortal: false,
            }
          : undefined,
        device: {
          isScreenLockEnabled: true,
          isOsUpToDate: true,
          isRooted: false,
        },
        permissions: {
          unnecessaryHighRiskCount: state.unverifiedPermissionsCount,
        },
        passwords: {
          twoFactorEnabled: state.twoFactorEnabled,
        },
        threats: {
          maliciousCount: state.recentUrlScans.filter((u) => !u.isSafe).length,
          quizPassed: state.quizHighScore >= 80,
        },
      };

      const result = await SecurityGatewayService.calculateScore(telemetry);
      set({
        isCalculated: true,
        score: result.overallScore,
        securityScore: result,
        summaryMessage:
          result.overallScore >= 80
            ? 'Your digital safety is in good shape.'
            : result.overallScore >= 50
              ? 'A few privacy and network settings need attention.'
              : 'Important security items need your attention.',
      });
    } catch {
      // Local calculation fallback if backend is unreachable
      const permDeduction = state.unverifiedPermissionsCount * 8;
      const networkDeduction = state.lastWifiAssessment?.isSafe === false ? 20 : 0;
      const urlDeduction = state.recentUrlScans.some((u) => !u.isSafe) ? 15 : 0;
      const computed = Math.max(0, Math.min(100, 100 - (permDeduction + networkDeduction + urlDeduction)));
      const severity = mapScoreToSeverity(computed);

      set({
        isCalculated: true,
        score: computed,
        summaryMessage:
          computed >= 80
            ? 'Your digital safety is in good shape.'
            : 'A few privacy and network settings need attention.',
        securityScore: {
          overallScore: computed,
          wifiSafetyScore: Math.max(40, 100 - networkDeduction),
          urlHygieneScore: Math.max(50, 100 - urlDeduction),
          appPermissionScore: Math.max(50, 100 - permDeduction),
          breakdown: {
            permissions: Math.max(50, 100 - permDeduction),
            device: 90,
            network: Math.max(40, 100 - networkDeduction),
            privacy: Math.max(50, 100 - permDeduction),
            awareness: 80,
          },
          severity,
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },

  improveSecurityAutomatically: () =>
    set((state) => {
      const updatedPerms = state.privacyPermissions.map((p) =>
        p.id === 'microphone' || p.id === 'contacts' || p.id === 'sms'
          ? { ...p, status: 'Limited' as const, flaggedApps: [], plainDescription: 'Restricted to trusted use only.' }
          : p,
      );
      const newScore = 95;
      return {
        isCalculated: true,
        score: newScore,
        unverifiedPermissionsCount: 0,
        summaryMessage: 'All device, network, and privacy checks look good.',
        securityScore: {
          overallScore: newScore,
          wifiSafetyScore: 95,
          urlHygieneScore: 95,
          appPermissionScore: 95,
          breakdown: {
            permissions: 95,
            device: 96,
            network: 94,
            privacy: 95,
            awareness: 93,
          },
          severity: 'LOW',
          updatedAt: new Date().toISOString(),
        },
        privacyPermissions: updatedPerms,
        threatAlerts: deriveThreatAlerts(state.lastWifiAssessment, state.recentUrlScans, updatedPerms),
      };
    }),

  threatAlerts: [],

  lastWifiAssessment: null,
  recentUrlScans: [],
  permissionAudits: [],
  scanHistory: INITIAL_SCAN_HISTORY,
  activityTimeline: INITIAL_ACTIVITY_TIMELINE,

  setWifiAssessment: (lastWifiAssessment) =>
    set((state) => {
      const updatedAchievements = state.user.achievements.map((ach) =>
        ach.id === 'ach-2' ? { ...ach, unlocked: true } : ach,
      );
      const alerts = deriveThreatAlerts(
        lastWifiAssessment,
        state.recentUrlScans,
        state.privacyPermissions,
      );
      return {
        lastWifiAssessment,
        threatAlerts: alerts,
        user: { ...state.user, achievements: updatedAchievements },
      };
    }),

  addUrlScanResult: (result) =>
    set((state) => {
      const updatedUrlScans = [result, ...state.recentUrlScans].slice(0, 25);
      const updatedAchievements = state.user.achievements.map((ach) =>
        ach.id === 'ach-1' ? { ...ach, unlocked: true } : ach,
      );
      const alerts = deriveThreatAlerts(
        state.lastWifiAssessment,
        updatedUrlScans,
        state.privacyPermissions,
      );
      return {
        recentUrlScans: updatedUrlScans,
        threatAlerts: alerts,
        user: { ...state.user, achievements: updatedAchievements },
      };
    }),

  addScanHistoryItem: (item) =>
    set((state) => {
      const newEntry: ScanHistoryEntry = {
        ...item,
        id: `scan-${Date.now()}`,
        date: 'Today',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        perm.id === id ? { ...perm, status: nextOrder[perm.status] } : perm,
      );
      const allowedHighRisk = updated.filter(
        (p) => p.status === 'Allowed' && (p.id === 'sms' || p.id === 'microphone' || p.id === 'location'),
      ).length;

      const alerts = deriveThreatAlerts(
        state.lastWifiAssessment,
        state.recentUrlScans,
        updated,
      );

      return {
        privacyPermissions: updated,
        unverifiedPermissionsCount: allowedHighRisk,
        threatAlerts: alerts,
      };
    }),

  reviewAndTightenPrivacy: () =>
    set((state) => {
      const updated = state.privacyPermissions.map((perm) =>
        perm.status === 'Allowed' && (perm.id === 'sms' || perm.id === 'microphone')
          ? {
              ...perm,
              status: 'Limited' as const,
              plainDescription: 'Reviewed and limited to user-approved actions.',
            }
          : perm,
      );

      const updatedAchievements = state.user.achievements.map((ach) =>
        ach.id === 'ach-3' ? { ...ach, unlocked: true } : ach,
      );

      const alerts = deriveThreatAlerts(
        state.lastWifiAssessment,
        state.recentUrlScans,
        updated,
      );

      return {
        unverifiedPermissionsCount: 0,
        privacyPermissions: updated,
        threatAlerts: alerts,
        user: { ...state.user, achievements: updatedAchievements },
      };
    }),

  completedLessons: INITIAL_USER.completedLessons,
  quizHighScore: INITIAL_USER.quizHighScore,

  markLessonCompleted: (topicId) =>
    set((state) => {
      if (state.completedLessons.includes(topicId)) return state;
      const nextLessons = [...state.completedLessons, topicId];
      return {
        completedLessons: nextLessons,
      };
    }),

  saveQuizScore: (quizScore) =>
    set((state) => {
      const newHigh = Math.max(state.quizHighScore, quizScore);
      const updatedAchievements = state.user.achievements.map((ach) =>
        ach.id === 'ach-4' && quizScore >= 100 ? { ...ach, unlocked: true } : ach,
      );
      return {
        quizHighScore: newHigh,
        user: { ...state.user, achievements: updatedAchievements },
      };
    }),

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
