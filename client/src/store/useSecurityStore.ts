import { create } from 'zustand';
import {
  HolisticSecurityScore,
  UrlScanResult,
  WifiRiskAssessment,
  AppPermissionAuditItem,
} from '../types/security';

export interface SecurityState {
  readonly securityScore: HolisticSecurityScore;
  readonly lastWifiAssessment: WifiRiskAssessment | null;
  readonly recentUrlScans: readonly UrlScanResult[];
  readonly permissionAudits: readonly AppPermissionAuditItem[];
  readonly isLoading: boolean;
  readonly error: string | null;
  setSecurityScore: (score: HolisticSecurityScore) => void;
  setWifiAssessment: (assessment: WifiRiskAssessment) => void;
  addUrlScanResult: (result: UrlScanResult) => void;
  setPermissionAudits: (audits: readonly AppPermissionAuditItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const INITIAL_SECURITY_SCORE: HolisticSecurityScore = {
  overallScore: 85,
  wifiSafetyScore: 90,
  urlHygieneScore: 85,
  appPermissionScore: 80,
  severity: 'LOW',
  updatedAt: new Date().toISOString(),
};

export const useSecurityStore = create<SecurityState>((set) => ({
  securityScore: INITIAL_SECURITY_SCORE,
  lastWifiAssessment: null,
  recentUrlScans: [],
  permissionAudits: [],
  isLoading: false,
  error: null,
  setSecurityScore: (securityScore) => set({ securityScore }),
  setWifiAssessment: (lastWifiAssessment) => set({ lastWifiAssessment }),
  addUrlScanResult: (result) =>
    set((state) => ({
      recentUrlScans: [result, ...state.recentUrlScans].slice(0, 25),
    })),
  setPermissionAudits: (permissionAudits) => set({ permissionAudits }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
