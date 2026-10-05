import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  RootStackParamList,
  UrlScannerState,
  UrlScanResult,
} from '../types/security';
import { SecurityPalette, Spacing, Radius } from '../theme/theme';
import {
  AppButton,
  AppInput,
  ScanResultCard,
  LoadingStateView,
  ErrorStateView,
  EmptyStateView,
} from '../design-system/components';
import { SecurityGatewayService } from '../services/api';
import { useSecurityStore } from '../store/useSecurityStore';

type Props = NativeStackScreenProps<RootStackParamList, 'UrlScanner'>;

export const UrlScannerScreen: React.FC<Props> = ({ route, navigation }) => {
  const addUrlScanResult = useSecurityStore((state) => state.addUrlScanResult);
  const addScanHistoryItem = useSecurityStore((state) => state.addScanHistoryItem);

  const [urlInput, setUrlInput] = useState<string>(route.params?.initialUrl ?? '');
  const [scanState, setScanState] = useState<UrlScannerState>(
    route.params?.initialUrl ? 'INPUT' : 'EMPTY',
  );
  const [result, setResult] = useState<UrlScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-scan if URL was shared into the app via deep link / share intent
  useEffect(() => {
    if (route.params?.initialUrl) {
      runWebsiteCheck(route.params.initialUrl);
    }
  }, [route.params?.initialUrl]);

  const handleInputChange = (val: string) => {
    setUrlInput(val);
    setErrorMessage(null);
    setScanState(val.trim().length > 0 ? 'INPUT' : 'EMPTY');
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      if (clipboardContent && clipboardContent.trim().length > 0) {
        const cleaned = clipboardContent.trim();
        setUrlInput(cleaned);
        runWebsiteCheck(cleaned);
      }
    } catch {
      // Clipboard read rejected
    }
  };

  const runWebsiteCheck = async (targetOverride?: string) => {
    const rawTarget = (targetOverride ?? urlInput).trim();
    if (!rawTarget) {
      setScanState('EMPTY');
      return;
    }

    setUrlInput(rawTarget);
    setScanState('SCANNING');
    setErrorMessage(null);

    try {
      const scanRes = await SecurityGatewayService.scanUrl({
        url: rawTarget,
        source: 'MANUAL_INPUT',
      });

      setResult(scanRes);
      addUrlScanResult(scanRes);
      addScanHistoryItem({
        type: 'URLs',
        target: scanRes.targetUrl,
        result:
          scanRes.status === 'SAFE'
            ? 'Safe'
            : scanRes.status === 'ATTENTION'
              ? 'Attention'
              : 'Dangerous',
        status: scanRes.status,
        summary: scanRes.insight.summary,
      });

      if (scanRes.status === 'SAFE') {
        setScanState('SAFE');
      } else if (scanRes.status === 'ATTENTION') {
        setScanState('SUSPICIOUS');
      } else {
        setScanState('DANGEROUS');
      }
    } catch (err: unknown) {
      setScanState('ERROR');
      const errString = err instanceof Error ? err.message : '';
      if (errString.includes('Network') || errString.includes('ECONNREFUSED')) {
        setErrorMessage(
          "You're offline or the threat intelligence gateway is unreachable. Real-time scanning requires an active connection.",
        );
      } else {
        setErrorMessage('Unable to determine risk. Please check the URL format and try again.');
      }
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerBlock}>
        <Text style={styles.pageTitle}>Check Website</Text>
        <Text style={styles.pageSubtitle}>
          Verify links from emails, SMS, or QR codes against VirusTotal, Google Safe
          Browsing, and URLScan.io threat engines.
        </Text>
      </View>

      {/* 3 INPUT METHODS CARD */}
      <View style={styles.inputCard}>
        <AppInput
          label="Website address"
          placeholder="Paste or enter URL (e.g., https://example.org)"
          type="url"
          value={urlInput}
          onChangeText={handleInputChange}
          rightActionLabel={urlInput ? 'Clear' : undefined}
          onRightActionPress={() => {
            setUrlInput('');
            setResult(null);
            setErrorMessage(null);
            setScanState('EMPTY');
          }}
        />

        <View style={styles.buttonActionRow}>
          <View style={{ flex: 1, marginRight: Spacing.xs }}>
            <AppButton
              label="📋 Paste Clipboard"
              onPress={handlePasteFromClipboard}
              variant="secondary"
              fullWidth
            />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.xs }}>
            <AppButton
              label="Check Website"
              onPress={() => runWebsiteCheck()}
              variant="primary"
              fullWidth
            />
          </View>
        </View>

        <View style={styles.scannerHelperRow}>
          <Text style={styles.scannerHelperText}>
            🛡️ Inspects SSL certificate, domain registration age, and known phishing directories in real time.
          </Text>
        </View>
      </View>

      {/* SIMPLE VS ADVANCED TOGGLE (WHEN RESULT IS PRESENT) */}
      {result && (
        <View style={styles.modeToggleRow}>
          <Pressable
            onPress={() => setShowAdvanced(!showAdvanced)}
            style={[styles.modeToggleBtn, showAdvanced && styles.modeToggleActive]}>
            <Text
              style={[
                styles.modeToggleText,
                showAdvanced && { color: '#FFFFFF' },
              ]}>
              {showAdvanced ? '🔬 Mode: Advanced' : '💡 Mode: Simple'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* STATE 1 & 2: EMPTY / INPUT */}
      {(scanState === 'EMPTY' || scanState === 'INPUT') && !result ? (
        <EmptyStateView
          title="Ready to check your link"
          message="Enter an address above or tap 'Paste Clipboard' to scan any website link for security threats."
        />
      ) : null}

      {/* STATE 3: SCANNING */}
      {scanState === 'SCANNING' ? (
        <LoadingStateView
          message="Checking your security..."
          subtext="Querying VirusTotal, Google Safe Browsing, and URLScan threat engines."
        />
      ) : null}

      {/* STATE 4: ERROR */}
      {scanState === 'ERROR' ? (
        <ErrorStateView
          whatHappened="We couldn't complete the security check."
          whyItHappened={errorMessage || 'Unable to determine risk.'}
          whatToDoNext="Check your connection and verify the website address."
          onRetry={() => runWebsiteCheck()}
        />
      ) : null}

      {/* STATE 5: VERDICT DISPLAY (SAFE, SUSPICIOUS, DANGEROUS) */}
      {(scanState === 'SAFE' ||
        scanState === 'SUSPICIOUS' ||
        scanState === 'DANGEROUS') &&
      result ? (
        <View style={styles.resultBlock}>
          <ScanResultCard
            status={result.status}
            headline={result.insight.summary}
            targetLabel={result.targetUrl}
            explanation={result.explanation}
            primaryActionLabel={
              result.status === 'DANGER' ? 'Go Back Safely' : 'Check Another Link'
            }
            onPrimaryAction={() => {
              if (result.status === 'DANGER') {
                navigation.goBack();
              } else {
                setUrlInput('');
                setResult(null);
                setScanState('EMPTY');
              }
            }}
          />

          {/* ADVANCED MODE RAW ENGINE VERDICTS */}
          {showAdvanced && (
            <View style={styles.advancedTelemetryCard}>
              <Text style={styles.advancedHeading}>
                🔬 Upstream Threat Intelligence (Advanced)
              </Text>

              <View style={styles.verdictsGrid}>
                {result.verdicts.map((engine) => (
                  <View key={engine.engine} style={styles.engineRow}>
                    <Text style={styles.engineName}>{engine.engine}</Text>
                    <Text
                      style={[
                        styles.engineVerdict,
                        engine.malicious
                          ? { color: SecurityPalette.critical }
                          : { color: SecurityPalette.safe },
                      ]}>
                      {engine.malicious ? 'Flagged Malicious' : 'Clean'}
                    </Text>
                  </View>
                ))}
              </View>

              {result.explanation.technicalDetails && (
                <View style={styles.techFactsBox}>
                  {result.explanation.technicalDetails.facts.map((fact, i) => (
                    <View key={i} style={styles.factRow}>
                      <Text style={styles.factKey}>{fact.label}</Text>
                      <Text style={styles.factVal}>
                        {fact.value || 'Not provided by source.'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      ) : null}
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
    marginBottom: Spacing.sm,
  },
  inputCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  buttonActionRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  scannerHelperRow: {
    marginTop: 6,
  },
  scannerHelperText: {
    fontSize: 12,
    color: SecurityPalette.textMuted,
    lineHeight: 18,
  },
  modeToggleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.md,
  },
  modeToggleBtn: {
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
  resultBlock: {
    marginBottom: Spacing.xl,
  },
  advancedTelemetryCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginTop: Spacing.md,
  },
  advancedHeading: {
    fontSize: 14.5,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 10,
  },
  verdictsGrid: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: SecurityPalette.surfaceVariant,
    paddingBottom: 6,
  },
  engineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  engineName: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.textSecondary,
  },
  engineVerdict: {
    fontSize: 13,
    fontWeight: '800',
  },
  techFactsBox: {
    marginTop: 4,
  },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: SecurityPalette.surfaceVariant,
  },
  factKey: {
    fontSize: 12,
    fontWeight: '600',
    color: SecurityPalette.textMuted,
  },
  factVal: {
    fontSize: 12,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    maxWidth: '55%',
    textAlign: 'right',
  },
});

export default UrlScannerScreen;
