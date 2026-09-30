import { create } from 'zustand';
import {
  HolisticSecurityScore,
  UrlScanResult,
  WifiRiskAssessment,
  AppPermissionAuditItem,
  RiskSeverity,
} from '../types/security';

export interface SecurityState {
  readonly score: number;
  readonly unverifiedPermissionsCount: number;
  readonly summaryMessage: string;
  readonly securityScore: HolisticSecurityScore;
  readonly lastWifiAssessment: WifiRiskAssessment | null;
  readonly recentUrlScans: readonly UrlScanResult[];
  readonly permissionAudits: readonly AppPermissionAuditItem[];
  readonly isLoading: boolean;
  readonly error: string | null;
  setScore: (newScore: number, customSummary?: string) => void;
  setSecurityScore: (score: HolisticSecurityScore) => void;
  setWifiAssessment: (assessment: WifiRiskAssessment) => void;
  addUrlScanResult: (result: UrlScanResult) => void;
  setPermissionAudits: (audits: readonly AppPermissionAuditItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const mapScoreToSeverity = (score: number): RiskSeverity => {
  if (score >= 80) {
    return 'LOW';
  }
  if (score >= 50) {
    return 'MEDIUM';
  }
  return 'CRITICAL';
};

const getDefaultSummaryForScore = (score: number, unverifiedCount: number): string => {
  if (score >= 80) {
    return unverifiedCount > 0
      ? `Your device has ${unverifiedCount} unverified permissions`
      : 'Wi-Fi, web links, and app permissions are verified';
  }
  if (score >= 50) {
    return `Your device has ${unverifiedCount} unverified permissions to review`;
  }
  return 'High-risk network or permission exposures detected';
};

const INITIAL_SECURITY_SCORE: HolisticSecurityScore = {
  overallScore: 84,
  wifiSafetyScore: 92,
  urlHygieneScore: 88,
  appPermissionScore: 72,
  severity: 'LOW',
  updatedAt: new Date().toISOString(),
};

export const useSecurityStore = create<SecurityState>((set) => ({
  score: INITIAL_SECURITY_SCORE.overallScore,
  unverifiedPermissionsCount: 2,
  summaryMessage: 'Your device has 2 unverified permissions',
  securityScore: INITIAL_SECURITY_SCORE,
  lastWifiAssessment: null,
  recentUrlScans: [],
  permissionAudits: [],
  isLoading: false,
  error: null,
  setScore: (rawScore, customSummary) => {
    const normalized = Math.max(0, Math.min(100, Math.round(rawScore)));
    const unverifiedCount = normalized >= 80 ? 2 : normalized >= 50 ? 3 : 6;
    set((state) => ({
      score: normalized,
      unverifiedPermissionsCount: unverifiedCount,
      summaryMessage:
        customSummary ?? getDefaultSummaryForScore(normalized, unverifiedCount),
      securityScore: {
        ...state.securityScore,
        overallScore: normalized,
        severity: mapScoreToSeverity(normalized),
        updatedAt: new Date().toISOString(),
      },
    }));
  },
  setSecurityScore: (securityScore) => {
    const normalized = Math.max(
      0,
      Math.min(100, Math.round(securityScore.overallScore)),
    );
    set((state) => ({
      score: normalized,
      securityScore: {
        ...securityScore,
        overallScore: normalized,
      },
      summaryMessage: getDefaultSummaryForScore(
        normalized,
        state.unverifiedPermissionsCount,
      ),
    }));
  },
  setWifiAssessment: (lastWifiAssessment) => set({ lastWifiAssessment }),
  addUrlScanResult: (result) =>
    set((state) => ({
      recentUrlScans: [result, ...state.recentUrlScans].slice(0, 25),
    })),
  setPermissionAudits: (permissionAudits) => set({ permissionAudits }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
