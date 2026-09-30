import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, UrlScanResult } from '../types/security';
import { SecurityPalette, Spacing, Radius } from '../theme/theme';
import {
  AppButton,
  ScanResultCard,
  LoadingStateView,
  ConfirmModal,
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
  const [extractedUrl, setExtractedUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<UrlScanResult | null>(null);
  const [confirmOpenVisible, setConfirmOpenVisible] = useState(false);

  const simulateQrScan = (sampleUrl: string) => {
    setScanning(true);
    setScanResult(null);
    setExtractedUrl(null);

    setTimeout(async () => {
      const res = await CyberSecurityService.analyzeUrl(sampleUrl);
      setExtractedUrl(sampleUrl);
      setScanResult(res);
      setScanning(false);
      addScanHistoryItem({
        type: 'QR',
        target: sampleUrl,
        result:
          res.status === 'SAFE'
            ? 'Safe'
            : res.status === 'ATTENTION'
              ? 'Attention'
              : 'Dangerous',
        status: res.status,
        summary: `QR scanned — ${res.insight.summary}`,
      });
    }, 500);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>QR Scanner</Text>
      <Text style={styles.pageSubtitle}>
        Point your camera at a QR code or upload an image from your gallery. We
        will show you the real website address before it opens.
      </Text>

      {/* Camera Scanning Frame */}
      <View style={styles.cameraCard}>
        <View style={styles.viewfinderBox}>
          <QrMatrixIcon size={48} color={SecurityPalette.interactive} />
          <Text style={styles.viewfinderTitle}>Camera QR Frame Ready</Text>
          <Text style={styles.viewfinderSubtitle}>
            Links inside QR codes are never opened automatically.
          </Text>
        </View>

        <View style={styles.actionButtonsStack}>
          <AppButton
            label="Scan Safe Menu QR (Example)"
            onPress={() =>
              simulateQrScan('https://menu.freshbistro-official.com')
            }
            variant="primary"
            fullWidth
          />
          <AppButton
            label="Upload Image from Gallery (Suspicious QR)"
            onPress={() =>
              simulateQrScan('https://free-gift-claim-verify-login.xyz')
            }
            variant="secondary"
            fullWidth
          />
        </View>
      </View>

      {scanning ? (
        <LoadingStateView
          message="Analyzing QR code..."
          subtext="Extracting web address and checking safety."
        />
      ) : null}

      {extractedUrl && scanResult ? (
        <View style={styles.extractedBox}>
          <Text style={styles.extractedLabel}>EXTRACTED WEBSITE ADDRESS</Text>
          <Text style={styles.extractedUrlText}>{extractedUrl}</Text>

          <ScanResultCard
            status={scanResult.status}
            headline={scanResult.insight.summary}
            explanation={scanResult.explanation}
            primaryActionLabel={
              scanResult.status === 'SAFE'
                ? 'Continue to Website'
                : 'Proceed Anyway (Requires Confirmation)'
            }
            onPrimaryAction={() => {
              if (scanResult.status !== 'SAFE') {
                setConfirmOpenVisible(true);
              }
            }}
          />
        </View>
      ) : null}

      <ConfirmModal
        visible={confirmOpenVisible}
        title="Warning: This QR link looks suspicious"
        message="This QR code points to a website that may try to collect your password or payment details. Are you sure you want to open it?"
        confirmLabel="Open Anyway"
        cancelLabel="Stay Safe (Cancel)"
        isDanger
        onCancel={() => setConfirmOpenVisible(false)}
        onConfirm={() => setConfirmOpenVisible(false)}
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
    height: 210,
    backgroundColor: SecurityPalette.background,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: SecurityPalette.interactive,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
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
  extractedBox: {
    marginTop: Spacing.lg,
  },
  extractedLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: SecurityPalette.textSecondary,
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  extractedUrlText: {
    fontSize: 14,
    fontWeight: '700',
    color: SecurityPalette.interactive,
    backgroundColor: SecurityPalette.surface,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
});

export default QrScannerScreen;
