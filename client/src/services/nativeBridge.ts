import { NativeModules, Platform } from 'react-native';

const { InstalledAppsModule, NativeWifiScannerModule } = NativeModules;

export interface RealInstalledApp {
  readonly appName: string;
  readonly packageName: string;
  readonly versionName: string;
  readonly isSystemApp: boolean;
  readonly dangerousPermissions: readonly {
    readonly permission: string;
    readonly friendlyName: string;
  }[];
  readonly riskScore: number;
  readonly riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface NativeWifiAp {
  readonly ssid: string;
  readonly bssid: string;
  readonly capabilities: string;
  readonly level: number;
  readonly frequency: number;
  readonly securityType: 'OPEN' | 'WPA' | 'WPA2' | 'WPA3' | 'WEP';
}

export const NativeSecurityBridge = {
  /**
   * Queries real installed applications directly from Android PackageManager
   */
  getInstalledApps: async (): Promise<RealInstalledApp[]> => {
    if (Platform.OS === 'android' && InstalledAppsModule?.getInstalledApps) {
      try {
        const apps: RealInstalledApp[] = await InstalledAppsModule.getInstalledApps();
        return apps;
      } catch (err) {
        console.warn('[NativeBridge] getInstalledApps error:', err);
        return [];
      }
    }
    return [];
  },

  /**
   * Deep links to Android Application Details Settings for permission revocation
   */
  openAppSettings: async (packageName: string): Promise<boolean> => {
    if (Platform.OS === 'android' && InstalledAppsModule?.openAppSettings) {
      try {
        return await InstalledAppsModule.openAppSettings(packageName);
      } catch (err) {
        console.warn('[NativeBridge] openAppSettings error:', err);
        return false;
      }
    }
    return false;
  },

  /**
   * Queries real over-the-air broadcasted Wi-Fi beacons from Android WifiManager
   */
  getNativeWifiScanResults: async (): Promise<NativeWifiAp[]> => {
    if (Platform.OS === 'android' && NativeWifiScannerModule?.getScanResults) {
      try {
        const aps: NativeWifiAp[] = await NativeWifiScannerModule.getScanResults();
        return aps;
      } catch (err) {
        console.warn('[NativeBridge] getNativeWifiScanResults error:', err);
        return [];
      }
    }
    return [];
  },
};
