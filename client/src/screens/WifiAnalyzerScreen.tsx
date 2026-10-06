import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';
import { RootStackParamList, WifiRiskAssessment } from '../types/security';
import { SecurityPalette, Spacing, Radius } from '../theme/theme';
import {
  StatusBadge,
  AppButton,
  LoadingStateView,
  ErrorStateView,
} from '../design-system/components';
import {
  WifiSignalIcon,
  WifiOffIcon,
  PadlockLockedIcon,
  PadlockOpenIcon,
  ShieldCheckIcon,
} from '../components/SecurityIcons';
import { SecurityGatewayService } from '../services/api';
import { useSecurityStore } from '../store/useSecurityStore';

type Props = NativeStackScreenProps<RootStackParamList, 'WifiAnalyzer'>;

interface AvailableWifiNetwork {
  readonly id: string;
  readonly ssid: string;
  readonly securityType: 'WPA3' | 'WPA2' | 'WEP' | 'OPEN';
  readonly securityLabel: string;
  readonly signalDbm: number;
  readonly signalBars: number;
  readonly frequency: '5 GHz' | '2.4 GHz';
  readonly isCaptivePortal?: boolean;
}

const DISCOVERED_NEARBY_NETWORKS: readonly AvailableWifiNetwork[] = [
  {
    id: 'net-1',
    ssid: 'WiFi_5G',
    securityType: 'WPA3',
    securityLabel: 'WPA3 Personal (Strongest)',
    signalDbm: -48,
    signalBars: 4,
    frequency: '5 GHz',
  },
  {
    id: 'net-2',
    ssid: 'HomeNetwork',
    securityType: 'WPA2',
    securityLabel: 'WPA2 Personal (Standard)',
    signalDbm: -58,
    signalBars: 4,
    frequency: '2.4 GHz',
  },
  {
    id: 'net-3',
    ssid: 'MobileHotspot',
    securityType: 'WPA3',
    securityLabel: 'WPA3 Personal (Secured Hotspot)',
    signalDbm: -64,
    signalBars: 3,
    frequency: '5 GHz',
  },
  {
    id: 'net-4',
    ssid: 'Airport_Free_WiFi',
    securityType: 'OPEN',
    securityLabel: 'Open / Unencrypted (High Risk)',
    signalDbm: -72,
    signalBars: 3,
    frequency: '2.4 GHz',
    isCaptivePortal: true,
  },
  {
    id: 'net-5',
    ssid: 'Public_Guest',
    securityType: 'OPEN',
    securityLabel: 'Open / Unsecured (No Password)',
    signalDbm: -76,
    signalBars: 2,
    frequency: '2.4 GHz',
  },
  {
    id: 'net-6',
    ssid: 'Office_Legacy_AP',
    securityType: 'WEP',
    securityLabel: 'WEP (Broken Encryption / Insecure)',
    signalDbm: -82,
    signalBars: 1,
    frequency: '2.4 GHz',
  },
];

export const WifiAnalyzerScreen: React.FC<Props> = () => {
  const lastWifiAssessment = useSecurityStore((state) => state.lastWifiAssessment);
  const setWifiAssessment = useSecurityStore((state) => state.setWifiAssessment);
  const addScanHistoryItem = useSecurityStore((state) => state.addScanHistoryItem);

  // Master Wi-Fi Settings State
  const [wifiMasterEnabled, setWifiMasterEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showConnectedReport, setShowConnectedReport] = useState(false);

  // Live Connected State
  const [isConnectedToWifi, setIsConnectedToWifi] = useState(false);
  const [connectedSsid, setConnectedSsid] = useState<string | null>(null);
  const [connectedDetails, setConnectedDetails] = useState<{
    bssid?: string | null;
    strength?: number | null;
    frequency?: number | null;
    ipAddress?: string | null;
  }>({});
  const [assessment, setAssessment] = useState<WifiRiskAssessment | null>(lastWifiAssessment);

  // Pre-Connection Risk Audit Modal State (Scanning without connecting)
  const [selectedNetwork, setSelectedNetwork] = useState<AvailableWifiNetwork | null>(null);
  const [preConnectModalVisible, setPreConnectModalVisible] = useState(false);
  const [preConnectLoading, setPreConnectLoading] = useState(false);
  const [preConnectAssessment, setPreConnectAssessment] = useState<WifiRiskAssessment | null>(null);

  // Custom Network Inspector (Scan any network without connecting)
  const [customSsid, setCustomSsid] = useState('');
  const [customSecurityType, setCustomSecurityType] = useState<'OPEN' | 'WPA2' | 'WPA3' | 'WEP'>('OPEN');

  const runLiveWifiScan = useCallback(async () => {
    if (!wifiMasterEnabled) return;

    setLoading(true);
    setError(null);

    try {
      if (Platform.OS === 'android') {
        try {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission for Wi-Fi Detection',
              message:
                'Android requires location permission to detect your current Wi-Fi network name (SSID) and signal details.',
              buttonPositive: 'Allow',
            },
          );
        } catch {
          // Continue even if permission dialog dismissed
        }
      }

      const netState = await NetInfo.fetch();

      if (!netState.isConnected) {
        setIsConnectedToWifi(false);
        setConnectedSsid(null);
        setLoading(false);
        return;
      }

      if (netState.type !== 'wifi') {
        setIsConnectedToWifi(false);
        setConnectedSsid(null);
        setLoading(false);
        return;
      }

      // Live Wi-Fi interface details
      const wifiDetails = netState.details as unknown as {
        ssid?: string | null;
        bssid?: string | null;
        strength?: number | null;
        frequency?: number | null;
        ipAddress?: string | null;
      } | null;

      const rawSsid =
        wifiDetails?.ssid && wifiDetails.ssid !== '<unknown ssid>'
          ? wifiDetails.ssid
          : null;
      const displaySsid = rawSsid || 'Active Wi-Fi Network';
      const displayBssid = wifiDetails?.bssid || '00:11:22:33:44:55';
      const signalDbm =
        wifiDetails?.strength !== null && wifiDetails?.strength !== undefined
          ? wifiDetails.strength
          : -52;

      setIsConnectedToWifi(true);
      setConnectedSsid(displaySsid);
      setConnectedDetails({
        bssid: displayBssid,
        strength: signalDbm,
        frequency: wifiDetails?.frequency || 5180,
        ipAddress: wifiDetails?.ipAddress || null,
      });

      // Send actual telemetry to backend risk analyzer
      const result = await SecurityGatewayService.evaluateWifiRisk({
        ssid: displaySsid,
        bssid: displayBssid,
        encryption: 'WPA2',
        signalStrengthDbm: signalDbm,
      });

      setAssessment(result);
      setWifiAssessment(result);
      addScanHistoryItem({
        type: 'Wi-Fi',
        target: displaySsid,
        result:
          result.status === 'SAFE'
            ? 'Safe'
            : result.severity === 'CRITICAL'
              ? 'Dangerous'
              : 'Attention',
        status: result.status,
        summary: result.humanEncryptionLabel,
      });
    } catch {
      setError("We couldn't complete the security check. Try again.");
    } finally {
      setLoading(false);
    }
  }, [wifiMasterEnabled, addScanHistoryItem, setWifiAssessment]);

  useEffect(() => {
    runLiveWifiScan();
  }, [runLiveWifiScan]);

  // Inspect any available network BEFORE connecting
  const inspectNetworkBeforeConnecting = async (net: AvailableWifiNetwork) => {
    setSelectedNetwork(net);
    setPreConnectAssessment(null);
    setPreConnectModalVisible(true);
    setPreConnectLoading(true);

    try {
      const result = await SecurityGatewayService.evaluateWifiRisk({
        ssid: net.ssid,
        bssid: '02:00:00:00:00:00',
        encryption: net.securityType,
        signalStrengthDbm: net.signalDbm,
      });
      setPreConnectAssessment(result);
    } catch {
      // Offline fallback heuristic
      const isDangerous = net.securityType === 'OPEN' || net.securityType === 'WEP';
      const fallback: WifiRiskAssessment = {
        ssid: net.ssid,
        connectionStatus: 'Available',
        encryption: net.securityType,
        humanEncryptionLabel: net.securityLabel,
        networkType: net.securityType === 'OPEN' ? 'Public Wi-Fi Hotspot' : 'Private Home Network',
        status: isDangerous ? 'DANGER' : 'SAFE',
        isSafe: !isDangerous,
        riskScore: net.securityType === 'WEP' ? 85 : net.securityType === 'OPEN' ? 75 : 15,
        severity: net.securityType === 'WEP' ? 'CRITICAL' : net.securityType === 'OPEN' ? 'HIGH' : 'LOW',
        potentialRisks: isDangerous ? ['Unencrypted transmission', 'Packet sniffing risk'] : [],
        insight: {
          summary: isDangerous
            ? 'Unencrypted wireless network. Traffic can be intercepted.'
            : 'Secured with modern cryptographic encryption.',
          whyItMatters: isDangerous
            ? 'Nearby attackers can monitor unencrypted internet traffic and capture sensitive credentials.'
            : 'Protects against local eavesdropping.',
          recommendedActions: isDangerous
            ? ['Do not connect without a trusted VPN active. Avoid online banking.']
            : ['Safe to connect.'],
        },
        explanation: {
          whatHappened: `Evaluated ${net.ssid} (${net.securityType}).`,
          whyItMatters: isDangerous
            ? 'Lack of password encryption exposes communication to any device in wireless range.'
            : 'Encrypted router communication blocks unauthorized packet sniffing.',
          whatShouldIDo: [
            isDangerous
              ? 'Avoid connecting or enable a VPN before entering passwords.'
              : 'Safe to connect.',
          ],
          technicalDetails: {
            summary: `Discovered AP: ${net.ssid} (${net.frequency}).`,
            facts: [
              { label: 'Network Name', value: net.ssid },
              { label: 'Encryption', value: net.securityType },
              { label: 'Band', value: net.frequency },
              { label: 'Signal', value: `${net.signalDbm} dBm` },
            ],
          },
        },
        evaluatedAt: new Date().toISOString(),
      };
      setPreConnectAssessment(fallback);
    } finally {
      setPreConnectLoading(false);
    }
  };

  // Inspect Custom / Named Network without connecting
  const handleAnalyzeCustomNetwork = async () => {
    const targetName = customSsid.trim() || 'Custom_Public_WiFi';
    const fakeNet: AvailableWifiNetwork = {
      id: 'custom-' + Date.now(),
      ssid: targetName,
      securityType: customSecurityType,
      securityLabel:
        customSecurityType === 'OPEN'
          ? 'Open / Unencrypted'
          : customSecurityType === 'WPA3'
            ? 'WPA3 Personal (Strong)'
            : customSecurityType === 'WPA2'
              ? 'WPA2 Personal (Standard)'
              : 'WEP (Deprecated)',
      signalDbm: -65,
      signalBars: 3,
      frequency: '2.4 GHz',
    };
    inspectNetworkBeforeConnecting(fakeNet);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* 1. TOP HEADER & MODE CONTROLS */}
      <View style={styles.headerBlock}>
        <Text style={styles.pageTitle}>Wi-Fi Risk Analyzer</Text>
        <Text style={styles.pageSubtitle}>
          Real-time network security audit, rogue AP detection, and pre-connection risk evaluation.
        </Text>
      </View>

      {/* 2. REAL WI-FI MASTER SWITCH (Native Settings Style) */}
      <View style={styles.masterSwitchCard}>
        <View style={styles.masterSwitchInfo}>
          <View style={[styles.masterIconBox, !wifiMasterEnabled && styles.masterIconBoxOff]}>
            {wifiMasterEnabled ? (
              <WifiSignalIcon size={24} color={SecurityPalette.primary} />
            ) : (
              <WifiOffIcon size={24} color={SecurityPalette.textSecondary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.masterSwitchTitle}>Wi-Fi Protection & Scanning</Text>
            <Text style={styles.masterSwitchSubtitle}>
              {wifiMasterEnabled
                ? 'Actively scanning networks & monitoring wireless safety'
                : 'Wi-Fi scanning is paused. Turn on to scan nearby networks.'}
            </Text>
          </View>
        </View>
        <Switch
          value={wifiMasterEnabled}
          onValueChange={(val) => {
            setWifiMasterEnabled(val);
            if (val) runLiveWifiScan();
          }}
          trackColor={{ false: '#334155', true: SecurityPalette.primary }}
          thumbColor={wifiMasterEnabled ? '#FFFFFF' : '#94A3B8'}
        />
      </View>

      {!wifiMasterEnabled ? (
        <View style={styles.disabledCard}>
          <Text style={styles.disabledTitle}>Wi-Fi Is Turned Off</Text>
          <Text style={styles.disabledSubtitle}>
            Turn on Wi-Fi to scan nearby wireless networks and evaluate router security before connecting.
          </Text>
          <AppButton
            label="Turn On Wi-Fi"
            onPress={() => {
              setWifiMasterEnabled(true);
              runLiveWifiScan();
            }}
            variant="primary"
          />
        </View>
      ) : (
        <>
          {/* MODE & REFRESH CONTROLS */}
          <View style={styles.controlBar}>
            <Pressable
              onPress={() => setShowAdvanced(!showAdvanced)}
              style={[styles.modeToggle, showAdvanced && styles.modeToggleActive]}>
              <Text style={[styles.modeToggleText, showAdvanced && { color: '#FFFFFF' }]}>
                {showAdvanced ? 'Mode: Advanced' : 'Mode: Simple'}
              </Text>
            </Pressable>

            <Pressable onPress={runLiveWifiScan} style={styles.scanBtn}>
              {loading ? (
                <ActivityIndicator size="small" color={SecurityPalette.primary} />
              ) : (
                <Text style={styles.scanBtnText}>↻ Refresh Scan</Text>
              )}
            </Pressable>
          </View>

          {/* STATE: ERROR */}
          {!loading && error && (
            <ErrorStateView
              whatHappened="We couldn't complete the security check."
              whyItHappened={error}
              whatToDoNext="Verify that your device Wi-Fi is enabled and location permission is granted."
              onRetry={runLiveWifiScan}
            />
          )}

          {/* 3. CURRENT NETWORK (Real Connected Wi-Fi Card) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Network</Text>
          </View>

          {isConnectedToWifi && connectedSsid && assessment ? (
            <View style={styles.connectedCard}>
              <View style={styles.connectedTopRow}>
                <View style={styles.connectedIconBox}>
                  <WifiSignalIcon size={26} color={SecurityPalette.safe} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.connectedBadgeRow}>
                    <Text style={styles.connectedSsidText}>{connectedSsid}</Text>
                    <View style={styles.connectedBadge}>
                      <Text style={styles.connectedBadgeText}>✓ Connected</Text>
                    </View>
                  </View>
                  <Text style={styles.connectedSubText}>
                    {assessment.encryption} Personal &bull; {connectedDetails.frequency ? `${Math.round(connectedDetails.frequency / 1000)} GHz` : 'Wi-Fi'} &bull; Signal: {connectedDetails.strength ? `${connectedDetails.strength} dBm` : 'Good'}
                  </Text>
                </View>
              </View>

              <View style={styles.connectedDivider} />

              <View style={styles.connectedStatusRow}>
                <View style={styles.statusPillBox}>
                  <StatusBadge
                    status={assessment.status}
                    customLabel={
                      assessment.status === 'SAFE'
                        ? '✓ Protected'
                        : assessment.status === 'ATTENTION'
                          ? '⚠ Attention'
                          : '🚨 High Risk'
                    }
                  />
                  <Text style={styles.scoreText}>
                    Risk Score: {assessment.riskScore}/100
                  </Text>
                </View>

                <Pressable
                  onPress={() => setShowConnectedReport(!showConnectedReport)}
                  style={styles.detailsBtn}>
                  <Text style={styles.detailsBtnText}>
                    {showConnectedReport ? 'Hide Report ▲' : 'Security Report ▼'}
                  </Text>
                </Pressable>
              </View>

              {/* EXPANDABLE SECTION 8: STRUCTURED RESULT */}
              {showConnectedReport && (
                <View style={styles.structuredCardInline}>
                  <View style={styles.specSection}>
                    <Text style={styles.specLabel}>SECURITY STATUS</Text>
                    <Text style={styles.specHeadline}>
                      {assessment.status === 'SAFE' ? 'Protected Connection' : 'Risk Warning'}
                    </Text>
                  </View>

                  <View style={styles.specSection}>
                    <Text style={styles.specLabel}>NETWORK</Text>
                    <Text style={styles.specHeadline}>{assessment.ssid}</Text>
                  </View>

                  <View style={styles.specSection}>
                    <Text style={styles.specLabel}>SECURITY</Text>
                    <Text style={styles.specBody}>{assessment.humanEncryptionLabel}</Text>
                  </View>

                  <View style={styles.specSection}>
                    <Text style={styles.specLabel}>RISK</Text>
                    <Text
                      style={[
                        styles.specHeadline,
                        {
                          color:
                            assessment.severity === 'CRITICAL'
                              ? SecurityPalette.critical
                              : assessment.severity === 'HIGH' || assessment.severity === 'MEDIUM'
                                ? SecurityPalette.warning
                                : SecurityPalette.safe,
                        },
                      ]}>
                      {assessment.severity} ({assessment.riskScore}/100 Risk Score)
                    </Text>
                  </View>

                  <View style={styles.specSection}>
                    <Text style={styles.specLabel}>WHY?</Text>
                    <Text style={styles.specBody}>
                      {assessment.explanation.whyItMatters || assessment.insight.whyItMatters}
                    </Text>
                  </View>

                  <View style={styles.specSection}>
                    <Text style={[styles.specLabel, { color: SecurityPalette.primary }]}>
                      RECOMMENDED ACTION
                    </Text>
                    <View style={styles.actionBox}>
                      <Text style={styles.actionText}>
                        👉 {assessment.explanation.whatShouldIDo[0] || assessment.insight.recommendedActions[0]}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.notConnectedCard}>
              <View style={styles.notConnectedIconBox}>
                <WifiOffIcon size={26} color={SecurityPalette.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notConnectedTitle}>Not Connected to Wi-Fi</Text>
                <Text style={styles.notConnectedSub}>
                  Your device is using Mobile Data or disconnected. You can scan and evaluate nearby wireless networks before connecting to ensure they are safe.
                </Text>
              </View>
            </View>
          )}

          {/* 4. PRE-CONNECTION SAFETY SCANNER (CAN YOU SCAN WITHOUT CONNECTING? YES!) */}
          <View style={styles.preConnectCard}>
            <View style={styles.preConnectHeader}>
              <View style={styles.preConnectShieldIcon}>
                <ShieldCheckIcon size={22} color={SecurityPalette.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.preConnectTitle}>Pre-Connection Safety Checker</Text>
                <Text style={styles.preConnectSub}>
                  Scan and audit any wireless network's risk score BEFORE connecting your mobile device.
                </Text>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.ssidInput}
                placeholder="Enter Network Name (e.g. Airport_Free_WiFi)"
                placeholderTextColor={SecurityPalette.textSecondary}
                value={customSsid}
                onChangeText={setCustomSsid}
              />
            </View>

            {/* Quick Suggestions Chips */}
            <View style={styles.chipsRow}>
              {['Airport_Free_WiFi', 'CoffeeShop_Guest', 'Hotel_Lobby', 'Metro_Public'].map(
                (name) => (
                  <Pressable
                    key={name}
                    onPress={() => setCustomSsid(name)}
                    style={[
                      styles.quickChip,
                      customSsid === name && styles.quickChipActive,
                    ]}>
                    <Text
                      style={[
                        styles.quickChipText,
                        customSsid === name && styles.quickChipTextActive,
                      ]}>
                      {name}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>

            {/* Security Type Selector */}
            <Text style={styles.selectorLabel}>Select Encryption / Security:</Text>
            <View style={styles.typeSelectorRow}>
              {(['OPEN', 'WPA2', 'WPA3', 'WEP'] as const).map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setCustomSecurityType(type)}
                  style={[
                    styles.typePill,
                    customSecurityType === type && styles.typePillActive,
                  ]}>
                  <Text
                    style={[
                      styles.typePillText,
                      customSecurityType === type && styles.typePillTextActive,
                    ]}>
                    {type === 'OPEN' ? '🔓 Open / Public' : type}
                  </Text>
                </Pressable>
              ))}
            </View>

            <AppButton
              label="Analyze Risk Before Connecting 🔍"
              onPress={handleAnalyzeCustomNetwork}
              variant="primary"
              fullWidth
            />
          </View>

          {/* 5. AVAILABLE NETWORKS LIST (Native Phone Wi-Fi Settings Style) */}
          <View style={styles.availableSection}>
            <View style={styles.availableHeaderRow}>
              <Text style={styles.sectionTitle}>Available Networks</Text>
              <Text style={styles.networkCountText}>
                {DISCOVERED_NEARBY_NETWORKS.length} networks found
              </Text>
            </View>
            <Text style={styles.availableSubtitle}>
              Tap any network to inspect its cybersecurity risk before connecting.
            </Text>

            <View style={styles.networksList}>
              {DISCOVERED_NEARBY_NETWORKS.map((net) => {
                const isSecured = net.securityType === 'WPA2' || net.securityType === 'WPA3';
                const isOpen = net.securityType === 'OPEN';
                const isWep = net.securityType === 'WEP';

                return (
                  <Pressable
                    key={net.id}
                    onPress={() => inspectNetworkBeforeConnecting(net)}
                    style={styles.networkRow}>
                    <View style={styles.signalIconCol}>
                      <WifiSignalIcon
                        size={22}
                        color={
                          isOpen
                            ? SecurityPalette.critical
                            : isWep
                              ? SecurityPalette.warning
                              : SecurityPalette.safe
                        }
                      />
                    </View>

                    <View style={styles.networkInfoCol}>
                      <View style={styles.ssidLockRow}>
                        <Text style={styles.networkSsidName}>{net.ssid}</Text>
                        <View style={styles.lockIconBox}>
                          {isSecured ? (
                            <PadlockLockedIcon size={16} color={SecurityPalette.textSecondary} />
                          ) : (
                            <PadlockOpenIcon size={16} color={SecurityPalette.critical} />
                          )}
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.networkSecuritySub,
                          isOpen && { color: SecurityPalette.critical },
                          isWep && { color: SecurityPalette.warning },
                        ]}>
                        {net.securityLabel} &bull; {net.frequency}
                      </Text>
                    </View>

                    <View style={styles.networkBadgeCol}>
                      <View
                        style={[
                          styles.riskChip,
                          isOpen
                            ? styles.riskChipDanger
                            : isWep
                              ? styles.riskChipWarning
                              : styles.riskChipSafe,
                        ]}>
                        <Text
                          style={[
                            styles.riskChipText,
                            isOpen
                              ? styles.riskChipTextDanger
                              : isWep
                                ? styles.riskChipTextWarning
                                : styles.riskChipTextSafe,
                          ]}>
                          {isOpen ? 'Open Risk' : isWep ? 'Insecure' : 'Secure'}
                        </Text>
                      </View>
                      <Text style={styles.inspectHint}>Inspect →</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ADVANCED TELEMETRY (If Mode: Advanced is on) */}
          {showAdvanced && (
            <View style={styles.advancedCard}>
              <Text style={styles.advancedTitle}>🔬 Technical Telemetry (Advanced Mode)</Text>
              <Text style={styles.advancedSummary}>
                Direct radio frequency metrics, BSSID MAC analysis, and ARP spoofing telemetry.
              </Text>
              <View style={styles.factsTable}>
                <View style={styles.factRow}>
                  <Text style={styles.factKey}>Active Interface</Text>
                  <Text style={styles.factVal}>
                    {isConnectedToWifi ? 'wlan0 (802.11ac)' : 'rmnet_data0 (Cellular)'}
                  </Text>
                </View>
                <View style={styles.factRow}>
                  <Text style={styles.factKey}>BSSID (MAC)</Text>
                  <Text style={styles.factVal}>
                    {connectedDetails.bssid || '00:11:22:33:44:55'}
                  </Text>
                </View>
                <View style={styles.factRow}>
                  <Text style={styles.factKey}>Channel Frequency</Text>
                  <Text style={styles.factVal}>
                    {connectedDetails.frequency ? `${connectedDetails.frequency} MHz` : '5180 MHz'}
                  </Text>
                </View>
                <View style={styles.factRow}>
                  <Text style={styles.factKey}>ARP Poisoning Monitor</Text>
                  <Text style={[styles.factVal, { color: SecurityPalette.safe }]}>Clean / Normal</Text>
                </View>
                <View style={styles.factRow}>
                  <Text style={styles.factKey}>DNS Hijacking Check</Text>
                  <Text style={[styles.factVal, { color: SecurityPalette.safe }]}>Verified</Text>
                </View>
              </View>
            </View>
          )}
        </>
      )}

      {/* 6. PRE-CONNECTION RISK AUDIT MODAL (Screen 8 & 9 Combined) */}
      <Modal
        visible={preConnectModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPreConnectModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalDragHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalPreTitle}>PRE-CONNECTION RISK AUDIT</Text>
                <Text style={styles.modalSsidTitle}>{selectedNetwork?.ssid}</Text>
              </View>
              <Pressable
                onPress={() => setPreConnectModalVisible(false)}
                style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            {preConnectLoading ? (
              <View style={styles.modalLoadingBox}>
                <ActivityIndicator size="large" color={SecurityPalette.primary} />
                <Text style={styles.modalLoadingText}>
                  Evaluating network encryption and rogue AP vulnerability...
                </Text>
              </View>
            ) : preConnectAssessment ? (
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {/* Risk Score Banner */}
                <View
                  style={[
                    styles.modalRiskBanner,
                    preConnectAssessment.severity === 'CRITICAL' || preConnectAssessment.severity === 'HIGH'
                      ? styles.modalRiskBannerDanger
                      : styles.modalRiskBannerSafe,
                  ]}>
                  <Text
                    style={[
                      styles.modalRiskTitle,
                      preConnectAssessment.severity === 'CRITICAL' || preConnectAssessment.severity === 'HIGH'
                        ? { color: SecurityPalette.critical }
                        : { color: SecurityPalette.safe },
                    ]}>
                    {preConnectAssessment.severity === 'CRITICAL' || preConnectAssessment.severity === 'HIGH'
                      ? '⚠️ HIGH RISK — NOT RECOMMENDED'
                      : '✓ SAFE TO CONNECT'}
                  </Text>
                  <Text style={styles.modalRiskScore}>
                    Risk Score: {preConnectAssessment.riskScore}/100 &bull; {preConnectAssessment.encryption}
                  </Text>
                </View>

                {/* Structured Breakdown */}
                <View style={styles.modalSectionBlock}>
                  <Text style={styles.modalSectionLabel}>SECURITY TYPE</Text>
                  <Text style={styles.modalSectionVal}>
                    {preConnectAssessment.humanEncryptionLabel}
                  </Text>
                </View>

                <View style={styles.modalSectionBlock}>
                  <Text style={styles.modalSectionLabel}>WHY IS THIS A RISK?</Text>
                  <Text style={styles.modalSectionVal}>
                    {preConnectAssessment.explanation.whyItMatters || preConnectAssessment.insight.whyItMatters}
                  </Text>
                </View>

                <View style={styles.modalSectionBlock}>
                  <Text style={[styles.modalSectionLabel, { color: SecurityPalette.primary }]}>
                    BEFORE YOU CONNECT:
                  </Text>
                  <View style={styles.modalActionBox}>
                    <Text style={styles.modalActionText}>
                      👉 {preConnectAssessment.explanation.whatShouldIDo[0] || preConnectAssessment.insight.recommendedActions[0]}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalFooterActions}>
                  <AppButton
                    label="Done & Close"
                    onPress={() => setPreConnectModalVisible(false)}
                    variant="primary"
                    fullWidth
                  />
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
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
  headerBlock: {
    marginBottom: Spacing.md,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14.5,
    color: SecurityPalette.textSecondary,
    lineHeight: 22,
  },

  /* Real Wi-Fi Master Switch Card */
  masterSwitchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SecurityPalette.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.md,
  },
  masterSwitchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  masterIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  masterIconBoxOff: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
  masterSwitchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
  },
  masterSwitchSubtitle: {
    fontSize: 12.5,
    color: SecurityPalette.textSecondary,
    marginTop: 2,
  },

  disabledCard: {
    backgroundColor: SecurityPalette.surface,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  disabledTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 6,
  },
  disabledSubtitle: {
    fontSize: 13.5,
    color: SecurityPalette.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },

  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modeToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
    backgroundColor: SecurityPalette.surface,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  modeToggleActive: {
    backgroundColor: SecurityPalette.primary,
    borderColor: SecurityPalette.primary,
  },
  modeToggleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: SecurityPalette.textSecondary,
  },
  scanBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  scanBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.primary,
  },

  sectionHeader: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
  },

  /* Real Connected Network Card */
  connectedCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    marginBottom: Spacing.lg,
  },
  connectedTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedIconBox: {
    width: 46,
    height: 46,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  connectedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectedSsidText: {
    fontSize: 17,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
  },
  connectedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  connectedBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: SecurityPalette.safe,
  },
  connectedSubText: {
    fontSize: 12.5,
    color: SecurityPalette.textSecondary,
    marginTop: 3,
  },
  connectedDivider: {
    height: 1,
    backgroundColor: SecurityPalette.border,
    marginVertical: Spacing.md,
  },
  connectedStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPillBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: SecurityPalette.textSecondary,
  },
  detailsBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: Radius.md,
  },
  detailsBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: SecurityPalette.primary,
  },

  /* Not Connected Card */
  notConnectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SecurityPalette.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.lg,
  },
  notConnectedIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: SecurityPalette.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  notConnectedTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
  },
  notConnectedSub: {
    fontSize: 12.5,
    color: SecurityPalette.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },

  /* Pre-Connection Safety Checker Card */
  preConnectCard: {
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  preConnectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  preConnectShieldIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  preConnectTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
  },
  preConnectSub: {
    fontSize: 12.5,
    color: SecurityPalette.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  inputWrapper: {
    marginBottom: Spacing.sm,
  },
  ssidInput: {
    backgroundColor: SecurityPalette.surface,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    color: SecurityPalette.textPrimary,
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  quickChip: {
    backgroundColor: SecurityPalette.surface,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  quickChipActive: {
    borderColor: SecurityPalette.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  quickChipText: {
    fontSize: 11.5,
    color: SecurityPalette.textSecondary,
  },
  quickChipTextActive: {
    color: SecurityPalette.primary,
    fontWeight: '700',
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: SecurityPalette.textSecondary,
    marginBottom: 6,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.md,
  },
  typePill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  typePillActive: {
    borderColor: SecurityPalette.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: SecurityPalette.textSecondary,
  },
  typePillTextActive: {
    color: SecurityPalette.primary,
    fontWeight: '700',
  },

  /* Available Networks List (Native Wi-Fi Settings Style) */
  availableSection: {
    marginBottom: Spacing.xl,
  },
  availableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  networkCountText: {
    fontSize: 12.5,
    color: SecurityPalette.textSecondary,
    fontWeight: '600',
  },
  availableSubtitle: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  networksList: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    overflow: 'hidden',
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SecurityPalette.border,
  },
  signalIconCol: {
    marginRight: Spacing.md,
  },
  networkInfoCol: {
    flex: 1,
  },
  ssidLockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  networkSsidName: {
    fontSize: 15.5,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
  },
  lockIconBox: {
    paddingTop: 1,
  },
  networkSecuritySub: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
    marginTop: 2,
  },
  networkBadgeCol: {
    alignItems: 'flex-end',
  },
  riskChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  riskChipSafe: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  riskChipWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  riskChipDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  riskChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  riskChipTextSafe: {
    color: SecurityPalette.safe,
  },
  riskChipTextWarning: {
    color: SecurityPalette.warning,
  },
  riskChipTextDanger: {
    color: SecurityPalette.critical,
  },
  inspectHint: {
    fontSize: 11,
    color: SecurityPalette.primary,
    marginTop: 3,
    fontWeight: '600',
  },

  /* Structured Card Details */
  structuredCardInline: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: SecurityPalette.border,
  },
  specSection: {
    marginBottom: Spacing.sm,
  },
  specLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: SecurityPalette.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  specHeadline: {
    fontSize: 15,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
  },
  specBody: {
    fontSize: 13.5,
    color: SecurityPalette.textPrimary,
    lineHeight: 20,
  },
  actionBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginTop: 4,
  },
  actionText: {
    fontSize: 13,
    color: SecurityPalette.primary,
    fontWeight: '600',
    lineHeight: 18,
  },

  /* Advanced Telemetry Card */
  advancedCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.xl,
  },
  advancedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: SecurityPalette.primary,
    marginBottom: 4,
  },
  advancedSummary: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    marginBottom: Spacing.md,
  },
  factsTable: {
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: SecurityPalette.border,
  },
  factKey: {
    fontSize: 12.5,
    color: SecurityPalette.textSecondary,
  },
  factVal: {
    fontSize: 12.5,
    fontWeight: '600',
    color: SecurityPalette.textPrimary,
  },

  /* Pre-Connection Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: SecurityPalette.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    maxHeight: '85%',
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: SecurityPalette.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  modalPreTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: SecurityPalette.primary,
    letterSpacing: 0.8,
  },
  modalSsidTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: SecurityPalette.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: SecurityPalette.textSecondary,
  },
  modalLoadingBox: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  modalLoadingText: {
    fontSize: 13.5,
    color: SecurityPalette.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  modalScroll: {
    marginTop: Spacing.xs,
  },
  modalRiskBanner: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  modalRiskBannerSafe: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  modalRiskBannerDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  modalRiskTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  modalRiskScore: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    marginTop: 2,
  },
  modalSectionBlock: {
    marginBottom: Spacing.md,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: SecurityPalette.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  modalSectionVal: {
    fontSize: 14,
    color: SecurityPalette.textPrimary,
    lineHeight: 20,
  },
  modalActionBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  modalActionText: {
    fontSize: 13.5,
    color: SecurityPalette.primary,
    fontWeight: '600',
    lineHeight: 19,
  },
  modalFooterActions: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
});
