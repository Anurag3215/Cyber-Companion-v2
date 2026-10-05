import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import { CyberSecurityService } from '../services/cyberService';
import { useSecurityStore } from '../store/useSecurityStore';

type Props = NativeStackScreenProps<RootStackParamList, 'UrlScanner'>;

export const UrlScannerScreen: React.FC<Props> = ({ route, navigation }) => {
  const addUrlScanResult = useSecurityStore((state) => state.addUrlScanResult);
  const addScanHistoryItem = useSecurityStore(
    (state) => state.addScanHistoryItem,
  );

  const [urlInput, setUrlInput] = useState<string>(
    route.params?.initialUrl ?? '',
  );
  const [scanState, setScanState] = useState<UrlScannerState>(
    route.params?.initialUrl ? 'INPUT' : 'EMPTY',
  );
  const [result, setResult] = useState<UrlScanResult | null>(null);

  const handleInputChange = (val: string) => {
    setUrlInput(val);
    setScanState(val.trim().length > 0 ? 'INPUT' : 'EMPTY');
  };

  const runWebsiteCheck = async (targetOverride?: string) => {
    const target = (targetOverride ?? urlInput).trim();
    if (!target) {
      setScanState('EMPTY');
      return;
    }

    setUrlInput(target);
    setScanState('SCANNING');

    setTimeout(async () => {
      try {
        const res = await CyberSecurityService.analyzeUrl(target);
        setResult(res);
        addUrlScanResult(res);
        addScanHistoryItem({
          type: 'URLs',
          target: res.targetUrl,
          result:
            res.status === 'SAFE'
              ? 'Safe'
              : res.status === 'ATTENTION'
                ? 'Attention'
                : 'Dangerous',
          status: res.status,
          summary: res.insight.summary,
        });

        if (res.status === 'SAFE') {
          setScanState('SAFE');
        } else if (res.status === 'ATTENTION') {
          setScanState('SUSPICIOUS');
        } else {
          setScanState('DANGEROUS');
        }
      } catch {
        setScanState('ERROR');
      }
    }, 450);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Check Website</Text>
      <Text style={styles.pageSubtitle}>
        Not sure if a link from a text message or email is safe? Paste it below
        and we will check it for you.
      </Text>

      <View style={styles.inputCard}>
        <AppInput
          label="Website address"
          placeholder="Paste a website address (e.g., https://wikipedia.org)"
          type="url"
          value={urlInput}
          onChangeText={handleInputChange}
          rightActionLabel={urlInput ? 'Clear' : undefined}
          onRightActionPress={() => {
            setUrlInput('');
            setResult(null);
            setScanState('EMPTY');
          }}
        />

        <AppButton
          label="Check Website"
          onPress={() => runWebsiteCheck()}
          variant="primary"
          fullWidth
        />

        <View style={styles.scannerHelperRow}>
          <Text style={styles.scannerHelperText}>
            🛡️ Inspects SSL certificate, domain registration age, and known phishing directories in real time.
          </Text>
        </View>
      </View>

      {/* STATE 1 & 2: EMPTY / INPUT */}
      {(scanState === 'EMPTY' || scanState === 'INPUT') && !result ? (
        <EmptyStateView
          title="Ready to check your link"
          message="Paste any website address above and tap 'Check Website' to see if it has a valid security certificate and a safe reputation."
        />
      ) : null}

      {/* STATE 3: SCANNING */}
      {scanState === 'SCANNING' ? (
        <LoadingStateView
          message="Checking website..."
          subtext="Verifying security certificate and checking safety databases."
        />
      ) : null}

      {/* STATE 4, 5, 6: SAFE, SUSPICIOUS, DANGEROUS */}
      {(scanState === 'SAFE' ||
        scanState === 'SUSPICIOUS' ||
        scanState === 'DANGEROUS') &&
      result ? (
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
      ) : null}

      {/* STATE 7: ERROR */}
      {scanState === 'ERROR' ? (
        <ErrorStateView
          whatHappened="We couldn't check this website."
          whyItHappened="The address may be mistyped or your internet connection was briefly interrupted."
          whatToDoNext="Check the spelling of the website address and try again. Do not enter personal info on the site while unverified."
          onRetry={() => runWebsiteCheck()}
        />
      ) : null}
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
  inputCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  scannerHelperRow: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
  },
  scannerHelperText: {
    fontSize: 12.5,
    color: SecurityPalette.textMuted,
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default UrlScannerScreen;
