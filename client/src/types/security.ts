/**
 * Strict TypeScript Contracts for Cyber Companion Mobile Client
 * Aligns with the 6 core architecture modules:
 * 1. Wi-Fi Risk Analyzer
 * 2. URL Scanner
 * 3. QR Scanner
 * 4. Permission Analyzer
 * 5. Security Score Engine
 * 6. Cyber Awareness
 */

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EncryptionProtocol = 'OPEN' | 'WEP' | 'WPA' | 'WPA2' | 'WPA3' | 'UNKNOWN';

export interface PlainLanguageInsight {
  readonly summary: string;
  readonly whyItMatters: string;
  readonly recommendedActions: readonly string[];
}

export interface WifiTelemetryPayload {
  readonly ssid: string;
  readonly bssid?: string;
  readonly encryption: EncryptionProtocol;
  readonly signalStrengthDbm?: number;
  readonly isPublicHotspot?: boolean;
}

export interface WifiRiskAssessment {
  readonly ssid: string;
  readonly encryption: EncryptionProtocol;
  readonly riskScore: number; // 0 - 100
  readonly severity: RiskSeverity;
  readonly insight: PlainLanguageInsight;
  readonly evaluatedAt: string;
}

export interface UrlScanRequest {
  readonly url: string;
  readonly source: 'MANUAL_INPUT' | 'QR_CODE' | 'CLIPBOARD';
}

export interface ThreatEngineVerdict {
  readonly engine: 'VirusTotal' | 'GoogleSafeBrowsing' | 'URLScan';
  readonly malicious: boolean;
  readonly confidenceScore: number;
  readonly categories: readonly string[];
}

export interface UrlScanResult {
  readonly targetUrl: string;
  readonly normalizedDomain: string;
  readonly isSafe: boolean;
  readonly riskScore: number; // 0 - 100
  readonly severity: RiskSeverity;
  readonly verdicts: readonly ThreatEngineVerdict[];
  readonly insight: PlainLanguageInsight;
  readonly scannedAt: string;
}

export interface AppPermissionAuditItem {
  readonly packageName: string;
  readonly appName: string;
  readonly grantedPermissions: readonly string[];
  readonly highRiskPermissions: readonly string[];
  readonly severity: RiskSeverity;
  readonly insight: PlainLanguageInsight;
}

export interface HolisticSecurityScore {
  readonly overallScore: number; // 0 - 100 (100 = safest)
  readonly wifiSafetyScore: number;
  readonly urlHygieneScore: number;
  readonly appPermissionScore: number;
  readonly severity: RiskSeverity;
  readonly updatedAt: string;
}

export interface CyberAwarenessTip {
  readonly id: string;
  readonly title: string;
  readonly category: 'WIFI' | 'PHISHING' | 'QR_SECURITY' | 'PERMISSIONS' | 'GENERAL';
  readonly body: string;
  readonly actionableTakeaway: string;
  readonly publishedAt: string;
}

export type RootStackParamList = {
  Dashboard: undefined;
  WifiAnalyzer: undefined;
  UrlScanner: { initialUrl?: string } | undefined;
  QrScanner: undefined;
  PermissionAnalyzer: undefined;
  AwarenessCenter: undefined;
};
