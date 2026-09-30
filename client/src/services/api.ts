import axios, { AxiosInstance } from 'axios';
import {
  UrlScanRequest,
  UrlScanResult,
  WifiTelemetryPayload,
  WifiRiskAssessment,
  HolisticSecurityScore,
} from '../types/security';

const DEFAULT_GATEWAY_URL = 'http://10.0.2.2:5000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: DEFAULT_GATEWAY_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const SecurityGatewayService = {
  checkHealth: async (): Promise<{ status: string; service: string; timestamp: string }> => {
    const response = await apiClient.get<{ status: string; service: string; timestamp: string }>(
      '/health',
    );
    return response.data;
  },

  scanUrl: async (payload: UrlScanRequest): Promise<UrlScanResult> => {
    const response = await apiClient.post<UrlScanResult>('/scan/url', payload);
    return response.data;
  },

  evaluateWifiRisk: async (payload: WifiTelemetryPayload): Promise<WifiRiskAssessment> => {
    const response = await apiClient.post<WifiRiskAssessment>('/analyze/wifi', payload);
    return response.data;
  },

  fetchSecurityScore: async (): Promise<HolisticSecurityScore> => {
    const response = await apiClient.get<HolisticSecurityScore>('/score');
    return response.data;
  },
};
