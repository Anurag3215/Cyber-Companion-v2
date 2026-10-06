import axios, { AxiosInstance } from 'axios';
import {
  UrlScanRequest,
  UrlScanResult,
  WifiTelemetryPayload,
  WifiRiskAssessment,
  HolisticSecurityScore,
  ThreatEngineVerdict,
} from '../types/security';

const CANDIDATE_GATEWAYS = [
  'http://127.0.0.1:5000/api',
  'http://10.0.19.29:5000/api',
  'http://10.33.144.108:5000/api',
  'http://10.0.2.2:5000/api',
];

export const apiClient: AxiosInstance = axios.create({
  baseURL: CANDIDATE_GATEWAYS[0],
  timeout: 6000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor to fallback across LAN IP, emulator 10.0.2.2, and loopback 127.0.0.1
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const retryCount = originalRequest?._retryCount || 0;
    if (
      (error.code === 'ECONNREFUSED' ||
        error.code === 'ECONNABORTED' ||
        error.message?.includes('Network Error')) &&
      originalRequest &&
      retryCount < CANDIDATE_GATEWAYS.length - 1
    ) {
      originalRequest._retryCount = retryCount + 1;
      originalRequest.baseURL = CANDIDATE_GATEWAYS[originalRequest._retryCount];
      return axios(originalRequest);
    }
    return Promise.reject(error);
  },
);

export interface BackendUrlScanData {
  readonly targetUrl: string;
  readonly isMalicious: boolean;
  readonly threatLevel: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL';
  readonly vendorFlags: {
    readonly virusTotal: number;
    readonly safeBrowsing: boolean;
    readonly urlScan: boolean;
  };
  readonly plainLanguageVerdict: string;
  readonly actionRecommendation: string;
  readonly technicalDetails: {
    readonly domain: string;
    readonly protocol: string;
    readonly scanTimestamp: string;
    readonly upstreamStatus: {
      readonly virusTotal: string;
      readonly safeBrowsing: string;
      readonly urlScan: string;
    };
    readonly heuristicFlags: readonly string[];
    readonly heuristicRiskScore: number;
  };
}

export interface BackendWifiData {
  readonly networkName: string;
  readonly bssid: string;
  readonly securityType: 'WPA3' | 'WPA2' | 'WPA' | 'WEP' | 'OPEN';
  readonly isSafe: boolean;
  readonly riskScore: number;
  readonly threatLevel: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL';
  readonly verdict: {
    readonly whatHappened: string;
    readonly whyItMatters: string;
    readonly whatShouldIDo: string;
  };
  readonly technicalDetails: {
    readonly rawSecurity: string;
    readonly signalStrengthDbm: number;
    readonly signalQuality: string;
    readonly frequencyMhz: number;
    readonly band: string;
    readonly isCaptivePortal: boolean;
    readonly isArpSpoofed: boolean;
    readonly hasDnsTampering: boolean;
    readonly flags: readonly string[];
    readonly assessmentTimestamp: string;
  };
}

export interface BackendScoreData {
  readonly overallScore: number;
  readonly severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
  readonly breakdown: {
    readonly password?: number;
    readonly device: number;
    readonly network: number;
    readonly privacy: number;
    readonly awareness: number;
  };
  readonly riskFactors: readonly string[];
  readonly recommendations: readonly string[];
  readonly plainLanguageSummary: string;
  readonly updatedAt: string;
}

export const SecurityGatewayService = {
  checkHealth: async (): Promise<{ status: string; service: string; timestamp: string }> => {
    const response = await apiClient.get<{ status: string; service: string; timestamp: string }>(
      '/health',
    );
    return response.data;
  },

  scanUrl: async (payload: UrlScanRequest): Promise<UrlScanResult> => {
    const response = await apiClient.post<{ success: boolean; data: BackendUrlScanData }>(
      '/scan/url',
      { url: payload.url },
    );
    const raw = response.data.data;

    const verdicts: ThreatEngineVerdict[] = [
      {
        engine: 'VirusTotal',
        malicious: raw.vendorFlags.virusTotal > 0,
        confidenceScore: raw.vendorFlags.virusTotal > 0 ? 90 : 20,
        categories: raw.vendorFlags.virusTotal > 0 ? ['Threat Flagged'] : ['Clean'],
      },
      {
        engine: 'GoogleSafeBrowsing',
        malicious: raw.vendorFlags.safeBrowsing,
        confidenceScore: raw.vendorFlags.safeBrowsing ? 95 : 10,
        categories: raw.vendorFlags.safeBrowsing ? ['Phishing / Malware'] : ['Clean'],
      },
      {
        engine: 'URLScan',
        malicious: raw.vendorFlags.urlScan,
        confidenceScore: raw.vendorFlags.urlScan ? 88 : 15,
        categories: raw.vendorFlags.urlScan ? ['Malicious Site'] : ['Clean'],
      },
    ];

    const mappedStatus =
      raw.threatLevel === 'CRITICAL'
        ? 'DANGER'
        : raw.threatLevel === 'SUSPICIOUS'
          ? 'ATTENTION'
          : 'SAFE';

    return {
      targetUrl: raw.targetUrl,
      normalizedDomain: raw.technicalDetails?.domain || raw.targetUrl.replace(/^https?:\/\//, '').split('/')[0],
      status: mappedStatus,
      isSafe: !raw.isMalicious,
      riskScore: raw.technicalDetails?.heuristicRiskScore ?? (raw.isMalicious ? 90 : 10),
      severity: raw.threatLevel === 'CRITICAL' ? 'CRITICAL' : raw.threatLevel === 'SUSPICIOUS' ? 'MEDIUM' : 'LOW',
      verdicts,
      insight: {
        summary: raw.plainLanguageVerdict,
        whyItMatters: raw.isMalicious
          ? 'This link has been flagged by threat intelligence engines as potentially deceptive or infected.'
          : 'This link matches safe cryptographic standards and has no active security warnings.',
        recommendedActions: [raw.actionRecommendation],
      },
      explanation: {
        whatHappened: raw.plainLanguageVerdict,
        whyItMatters: raw.isMalicious
          ? 'Entering passwords or personal data on flagged websites puts accounts at risk of takeover.'
          : 'Valid encryption certificates and clean domain history protect your connection.',
        whatShouldIDo: [raw.actionRecommendation],
        technicalDetails: {
          summary: `Domain: ${raw.technicalDetails?.domain || 'target'}. VirusTotal detections: ${raw.vendorFlags?.virusTotal || 0}. Safe Browsing: ${raw.vendorFlags?.safeBrowsing ? 'Threat' : 'Clean'}.`,
          facts: [
            { label: 'Domain', value: raw.technicalDetails?.domain || 'Not provided by source.' },
            { label: 'Protocol', value: raw.technicalDetails?.protocol || 'Not provided by source.' },
            { label: 'VirusTotal Flags', value: `${raw.vendorFlags?.virusTotal || 0} engines` },
            { label: 'Safe Browsing', value: raw.vendorFlags?.safeBrowsing ? 'Flagged as threat' : 'Clean' },
            { label: 'URLScan.io', value: raw.vendorFlags?.urlScan ? 'Malicious' : 'Clean' },
            { label: 'Heuristic Risk Score', value: `${raw.technicalDetails?.heuristicRiskScore ?? 0}/100` },
          ],
        },
      },
      scannedAt: raw.technicalDetails?.scanTimestamp || new Date().toISOString(),
    };
  },

  evaluateWifiRisk: async (payload: WifiTelemetryPayload): Promise<WifiRiskAssessment> => {
    const response = await apiClient.post<{ success: boolean; data: BackendWifiData }>(
      '/analyze/wifi',
      {
        ssid: payload.ssid,
        bssid: payload.bssid,
        securityType: payload.encryption,
        rssi: payload.signalStrengthDbm,
      },
    );
    const data = response.data.data;

    return {
      ssid: data.networkName,
      connectionStatus: 'Connected',
      encryption: data.securityType,
      humanEncryptionLabel: `Uses ${data.securityType} encryption (${data.technicalDetails?.band || 'Wi-Fi'}, ${data.technicalDetails?.signalQuality || 'Good'} signal).`,
      networkType: data.securityType === 'OPEN' ? 'Public Wi-Fi Hotspot' : 'Private Home Network',
      status: data.threatLevel === 'SAFE' ? 'SAFE' : data.threatLevel === 'CRITICAL' ? 'DANGER' : 'ATTENTION',
      isSafe: data.isSafe,
      riskScore: data.riskScore,
      severity:
        data.threatLevel === 'CRITICAL'
          ? 'CRITICAL'
          : data.riskScore >= 60 || !data.isSafe
            ? 'HIGH'
            : data.riskScore > 25
              ? 'MEDIUM'
              : 'LOW',
      potentialRisks: data.technicalDetails?.flags || [],
      insight: {
        summary: data.verdict.whatHappened,
        whyItMatters: data.verdict.whyItMatters,
        recommendedActions: [data.verdict.whatShouldIDo],
      },
      explanation: {
        whatHappened: data.verdict.whatHappened,
        whyItMatters: data.verdict.whyItMatters,
        whatShouldIDo: [data.verdict.whatShouldIDo],
        technicalDetails: {
          summary: `BSSID: ${data.bssid || 'Not provided'}. Signal: ${data.technicalDetails?.signalStrengthDbm || -60} dBm.`,
          facts: [
            { label: 'Network SSID', value: data.networkName },
            { label: 'BSSID / MAC', value: data.bssid || 'Not available on this device' },
            { label: 'Encryption', value: data.securityType },
            { label: 'Signal Quality', value: `${data.technicalDetails?.signalStrengthDbm || -60} dBm (${data.technicalDetails?.signalQuality || 'Good'})` },
            { label: 'Band', value: data.technicalDetails?.band || 'Not provided by source.' },
            { label: 'Captive Portal', value: data.technicalDetails?.isCaptivePortal ? 'Detected' : 'None' },
            { label: 'ARP Spoofing', value: data.technicalDetails?.isArpSpoofed ? 'Detected' : 'None' },
          ],
        },
      },
      evaluatedAt: data.technicalDetails?.assessmentTimestamp || new Date().toISOString(),
    };
  },

  calculateScore: async (telemetry: Record<string, unknown>): Promise<HolisticSecurityScore> => {
    const response = await apiClient.post<{ success: boolean; data: BackendScoreData }>(
      '/score',
      telemetry,
    );
    const data = response.data.data;

    return {
      overallScore: data.overallScore,
      wifiSafetyScore: data.breakdown.network,
      urlHygieneScore: 100 - (data.breakdown.awareness < 80 ? 20 : 0),
      appPermissionScore: data.breakdown.privacy,
      breakdown: {
        permissions: data.breakdown.privacy,
        password: data.breakdown.password,
        device: data.breakdown.device,
        network: data.breakdown.network,
        privacy: data.breakdown.privacy,
        awareness: data.breakdown.awareness,
      },
      severity: data.severity,
      updatedAt: data.updatedAt,
    };
  },

  fetchSecurityScore: async (): Promise<HolisticSecurityScore> => {
    return SecurityGatewayService.calculateScore({});
  },
};
