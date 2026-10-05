/**
 * CYBER COMPANION — Strict TypeScript Domain & Routing Contracts
 * Tagline: "Stay Safe. Simply."
 */

export type SecurityStatusLevel = 'SAFE' | 'ATTENTION' | 'DANGER';
export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EncryptionProtocol = 'OPEN' | 'WEP' | 'WPA' | 'WPA2' | 'WPA3' | 'UNKNOWN';

/**
 * Every security result must answer three questions in plain language:
 * 1. WHAT HAPPENED?
 * 2. WHY DOES IT MATTER?
 * 3. WHAT SHOULD I DO?
 * Plus optional progressive disclosure technical details.
 */
export interface PlainLanguageExplanation {
  readonly whatHappened: string;
  readonly whyItMatters: string;
  readonly whatShouldIDo: readonly string[];
  readonly technicalDetails?: {
    readonly summary: string;
    readonly facts: readonly { readonly label: string; readonly value: string }[];
  };
  readonly isSimulated?: boolean;
}

export interface PlainLanguageInsight {
  readonly summary: string;
  readonly whyItMatters: string;
  readonly recommendedActions: readonly string[];
}

export interface UserProfile {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly avatarInitials: string;
  readonly memberSince: string;
  readonly completedLessons: readonly string[];
  readonly quizHighScore: number;
  readonly achievements: readonly {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly unlocked: boolean;
  }[];
}

export interface SecurityScoreBreakdown {
  readonly permissions: number;
  readonly password?: number;
  readonly device: number;
  readonly network: number;
  readonly privacy: number;
  readonly awareness: number;
}

export interface HolisticSecurityScore {
  readonly overallScore: number; // 0 - 100
  readonly wifiSafetyScore: number;
  readonly urlHygieneScore: number;
  readonly appPermissionScore: number;
  readonly breakdown: SecurityScoreBreakdown;
  readonly severity: RiskSeverity;
  readonly updatedAt: string;
}

export type UrlScannerState =
  | 'EMPTY'
  | 'INPUT'
  | 'SCANNING'
  | 'SAFE'
  | 'SUSPICIOUS'
  | 'DANGEROUS'
  | 'ERROR';

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
  readonly status: SecurityStatusLevel;
  readonly isSafe: boolean;
  readonly riskScore: number; // 0 - 100
  readonly severity: RiskSeverity;
  readonly verdicts: readonly ThreatEngineVerdict[];
  readonly insight: PlainLanguageInsight;
  readonly explanation: PlainLanguageExplanation;
  readonly scannedAt: string;
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
  readonly connectionStatus: 'Connected' | 'Available';
  readonly encryption: EncryptionProtocol;
  readonly humanEncryptionLabel: string; // e.g. "Your Wi-Fi uses WPA2 security."
  readonly networkType: 'Private Home Network' | 'Public Wi-Fi Hotspot';
  readonly status: SecurityStatusLevel;
  readonly isSafe?: boolean;
  readonly riskScore: number;
  readonly severity: RiskSeverity;
  readonly potentialRisks: readonly string[];
  readonly insight: PlainLanguageInsight;
  readonly explanation: PlainLanguageExplanation;
  readonly evaluatedAt: string;
}

export type PermissionAccessState = 'Allowed' | 'Denied' | 'Limited';

export interface PrivacyPermissionCategory {
  readonly id: 'camera' | 'microphone' | 'location' | 'contacts' | 'storage' | 'notifications' | 'sms';
  readonly name: 'Camera' | 'Microphone' | 'Location' | 'Contacts' | 'Storage' | 'Notifications' | 'SMS & Messages';
  readonly status: PermissionAccessState;
  readonly appsCount: number;
  readonly plainDescription: string;
  readonly flaggedApps: readonly string[];
}

export interface AppPermissionAuditItem {
  readonly packageName: string;
  readonly appName: string;
  readonly grantedPermissions: readonly string[];
  readonly highRiskPermissions: readonly string[];
  readonly severity: RiskSeverity;
  readonly insight: PlainLanguageInsight;
}

export interface LearningTopic {
  readonly id: string;
  readonly title: string;
  readonly category:
    | 'Phishing'
    | 'Malware'
    | 'Ransomware'
    | 'Social Engineering'
    | 'Password Safety'
    | 'Identity Theft'
    | 'Online Scams'
    | 'Public Wi-Fi';
  readonly difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  readonly readingTime: string;
  readonly summary: string;
  readonly simpleExplanation: string;
  readonly realWorldExample: string;
  readonly warningSigns: readonly string[];
  readonly whatToDo: readonly string[];
  readonly keyTakeaways: readonly string[];
}

export type ThreatAlertCategory = 'Critical' | 'High' | 'Medium' | 'Low' | 'Resolved';

export interface ThreatAlertItem {
  readonly id: string;
  readonly title: string;
  readonly severity: ThreatAlertCategory;
  readonly date: string;
  readonly summary: string;
  readonly explanation: PlainLanguageExplanation;
  readonly affectedArea: string;
}

export interface SecurityNewsItem {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly readTime: string;
  readonly summary: string;
  readonly takeaway: string;
}

export interface QuizQuestion {
  readonly id: string;
  readonly question: string;
  readonly options: readonly string[];
  readonly correctIndex: number;
  readonly plainExplanation: string;
}

export interface ScanHistoryEntry {
  readonly id: string;
  readonly type: 'URLs' | 'QR' | 'Wi-Fi';
  readonly target: string;
  readonly result: 'Safe' | 'Attention' | 'Dangerous';
  readonly status: SecurityStatusLevel;
  readonly date: string;
  readonly time: string;
  readonly summary: string;
}

export interface ActivityTimelineEntry {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly status: SecurityStatusLevel;
  readonly statusLabel: 'Safe' | 'Attention' | 'Suspicious' | 'Completed';
  readonly timestamp: string;
  readonly routeTarget?: keyof RootStackParamList;
}

export interface CyberAssistantMessage {
  readonly id: string;
  readonly sender: 'user' | 'assistant';
  readonly text: string;
  readonly timestamp: string;
  readonly structuredReply?: PlainLanguageExplanation;
}

export interface CyberAwarenessTip {
  readonly id: string;
  readonly title: string;
  readonly category: 'WIFI' | 'PHISHING' | 'QR_SECURITY' | 'PERMISSIONS' | 'GENERAL';
  readonly body: string;
  readonly actionableTakeaway: string;
  readonly publishedAt: string;
}

/**
 * All Independent Application Routes (Section 39)
 */
export type RootStackParamList = {
  // Authentication Flow
  Splash: undefined;
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Verify: { email?: string } | undefined;

  // Main Overview
  Dashboard: undefined;

  // Scan Section
  ScanHub: undefined;
  UrlScanner: { initialUrl?: string } | undefined;
  QrScanner: undefined;
  WifiAnalyzer: undefined;
  ScanHistory: { initialTab?: 'All' | 'URLs' | 'QR' | 'Wi-Fi' } | undefined;

  // Security Center Section
  SecurityCenter: undefined;
  PasswordSecurity: undefined;
  DeviceSecurity: undefined;
  NetworkSecurity: undefined;
  PermissionAnalyzer: undefined; // Privacy Center (/security/privacy)

  // Learn & Awareness Section
  AwarenessCenter: undefined; // /learn
  LessonDetail: { topicId: string }; // /learn/topic/:id
  SecurityQuiz: undefined; // /learn/quiz
  SecurityNews: undefined; // /learn/news

  // Threats & Activity
  ThreatAlerts: undefined; // /threats
  ThreatDetail: { alertId: string }; // /threats/:id
  ActivityTimeline: undefined; // /activity

  // Assistant & Account
  CyberAssistant: { initialPrompt?: string } | undefined; // /assistant
  Profile: undefined; // /profile
  Settings: undefined; // /settings
  Reports: undefined; // /reports
  ThreatIntelligence: undefined; // /threat-intel
};
