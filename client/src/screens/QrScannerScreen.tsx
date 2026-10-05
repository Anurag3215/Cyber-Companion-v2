import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, UrlScanResult } from '../types/security';
import { SecurityPalette, Spacing, Radius } from '../theme/theme';
import {
  AppButton,
  AppInput,
  ScanResultCard,
  LoadingStateView,
  ConfirmModal,
  StatusBadge,
} from '../design-system/components';
import { QrMatrixIcon } from '../components/SecurityIcons';
import { CyberSecurityService } from '../services/cyberService';
import { useSecurityStore } from '../store/useSecurityStore';

type Props = NativeStackScreenProps<RootStackParamList, 'QrScanner'>;

export const QrScannerScreen: React.FC<Props> = () => {
  const addScanHistoryItem = useSecurityStore(
    (state) => state.addScanHistoryItem,
  );

  const [scanning, setScanning] = useState(false);
  const [isQuarantined, setIsQuarantined] = useState(false);
  const [interceptedUrl, setInterceptedUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<UrlScanResult | null>(null);
  const [confirmOpenVisible, setConfirmOpenVisible] = useState(false);
  const [manualInput, setManualInput] = useState('');

  // ZERO AUTO-EXECUTION: Every barcode capture pauses and holds the payload in quarantine
  const handleBarcodeCaptured = async (rawCode: string) => {
    setScanning(true);
    setScanResult(null);
    setInterceptedUrl(rawCode);
    setIsQuarantined(true);

    try {
      const res = await CyberSecurityService.analyzeUrl(rawCode);
      setScanResult(res);
      addScanHistoryItem({
        type: 'QR',
        target: rawCode,
        result:
          res.status === 'SAFE'
            ? 'Safe'
            : res.status === 'ATTENTION'
              ? 'Attention'
              : 'Dangerous',
        status: res.status,
        summary: `QR Intercepted — ${res.insight.summary}`,
      });
    } catch {
      Alert.alert('Scanner Error', 'Failed to inspect intercepted QR code.');
    } finally {
      setScanning(false);
    }
  };

  const handleProceedToBrowser = (url: string) => {
    if (scanResult && scanResult.status !== 'SAFE') {
      setConfirmOpenVisible(true);
    } else {
      Linking.openURL(url).catch(() => {
        Alert.alert('Browser Error', 'Could not open URL.');
      });
    }
  };

  const handleDiscard = () => {
    setIsQuarantined(false);
    setInterceptedUrl(null);
    setScanResult(null);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>QR Interception Sandbox</Text>
      <Text style={styles.pageSubtitle}>
        Point your camera at a QR code. Cyber Companion holds every link in a
        quarantine sandbox before anything is allowed to open.
      </Text>

      {/* Camera Viewfinder with Visual Targeting Bounds */}
      <View style={styles.cameraCard}>
        <View style={styles.viewfinderBox}>
          {/* Visual Targeting Corner Reticles */}
          <View style={[styles.cornerReticle, styles.cornerTL]} />
          <View style={[styles.cornerReticle, styles.cornerTR]} />
          <View style={[styles.cornerReticle, styles.cornerBL]} />
          <View style={[styles.cornerReticle, styles.cornerBR]} />

          <QrMatrixIcon size={46} color={SecurityPalette.interactive} />
          <Text style={styles.viewfinderTitle}>Hardware Viewfinder Active</Text>
          <Text style={styles.viewfinderSubtitle}>
            Zero auto-execution policy enforced.
          </Text>
        </View>

        {/* Live QR Payload Quarantine Input */}
        <View style={styles.actionButtonsStack}>
          <AppInput
            label="QR Code Payload or Web Link"
            placeholder="Paste or enter decoded QR text..."
            value={manualInput}
            onChangeText={setManualInput}
            type="url"
          />
          <AppButton
            label="Intercept in Quarantine Sandbox"
            onPress={() => {
              if (manualInput.trim()) {
                handleBarcodeCaptured(manualInput.trim());
              }
            }}
            variant="primary"
            fullWidth
          />
        </View>
      </View>

      {scanning && (
        <LoadingStateView
          message="Quarantining Endpoint..."
          subtext="Inspecting upstream threat intelligence and SSL certificates."
        />
      )}

      {/* Quarantined Endpoint Audit Card */}
      {isQuarantined && interceptedUrl && !scanning && (
        <View style={styles.quarantineBox}>
          <View style={styles.quarantineHeader}>
            <View>
              <Text style={styles.quarantineBadgeText}>QUARANTINE ACTIVE</Text>
              <Text style={styles.quarantineTitle}>Endpoint Intercepted</Text>
            </View>
            {scanResult && <StatusBadge status={scanResult.status} />}
          </View>

          <Text style={styles.interceptedUrl}>{interceptedUrl}</Text>

          {scanResult && (
            <ScanResultCard
              status={scanResult.status}
              headline={scanResult.insight.summary}
              explanation={scanResult.explanation}
            />
          )}

          <View style={styles.quarantineActionsRow}>
            <View style={{ flex: 1 }}>
              <AppButton
                label="Discard Link"
                onPress={handleDiscard}
                variant="secondary"
                fullWidth
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppButton
                label="Proceed to Browser"
                onPress={() => handleProceedToBrowser(interceptedUrl)}
                variant={scanResult?.status === 'SAFE' ? 'primary' : 'danger'}
                fullWidth
              />
            </View>
          </View>
        </View>
      )}

      <ConfirmModal
        visible={confirmOpenVisible}
        title="Warning: Suspicious Target Link"
        message="This website has been flagged for phishing or dangerous content. Opening it in your browser could compromise your accounts. Are you sure you want to proceed?"
        confirmLabel="Open Anyway (Unsafe)"
        cancelLabel="Stay Safe (Discard)"
        isDanger
        onCancel={() => setConfirmOpenVisible(false)}
        onConfirm={() => {
          setConfirmOpenVisible(false);
          if (interceptedUrl) {
            Linking.openURL(interceptedUrl).catch(() => {});
          }
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SecurityPalette.background },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 15,
    color: SecurityPalette.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  cameraCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  viewfinderBox: {
    height: 220,
    backgroundColor: '#050B17',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  cornerReticle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: SecurityPalette.interactive,
  },
  cornerTL: { top: 16, left: 16, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 16, right: 16, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 16, left: 16, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 16, right: 16, borderBottomWidth: 3, borderRightWidth: 3 },
  viewfinderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  viewfinderSubtitle: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    textAlign: 'center',
  },
  actionButtonsStack: {
    gap: 10,
  },
  quarantineBox: {
    marginTop: Spacing.xl,
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: SecurityPalette.interactive,
  },
  quarantineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quarantineBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: SecurityPalette.interactive,
    letterSpacing: 0.8,
  },
  quarantineTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
  },
  interceptedUrl: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    backgroundColor: SecurityPalette.background,
    padding: 10,
    borderRadius: Radius.sm,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  quarantineActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.md,
  },
});

export default QrScannerScreen;
