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

        {/* Quick Realistic Examples to Test All 7 States */}
        <View style={styles.sampleSection}>
          <Text style={styles.sampleLabel}>
            Try a realistic example to see each result state:
          </Text>
          <View style={styles.samplePillsRow}>
            <Pressable
              onPress={() => runWebsiteCheck('https://www.wikipedia.org')}
              style={styles.samplePill}>
              <Text style={[styles.samplePillText, { color: SecurityPalette.safe }]}>
                ✓ Safe Website
              </Text>
            </Pressable>
            <Pressable
              onPress={() => runWebsiteCheck('http://bit.ly/promo-discount-link')}
              style={styles.samplePill}>
              <Text style={[styles.samplePillText, { color: SecurityPalette.warning }]}>
                ⚠ Suspicious Link
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                runWebsiteCheck('https://parcel-fee-verify-login.xyz')
              }
              style={styles.samplePill}>
              <Text style={[styles.samplePillText, { color: SecurityPalette.critical }]}>
                ● Dangerous Scam
              </Text>
            </Pressable>
            <Pressable
              onPress={() => runWebsiteCheck('error.test')}
              style={styles.samplePill}>
              <Text style={styles.samplePillText}>Scanner Error</Text>
            </Pressable>
          </View>
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
  sampleSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: SecurityPalette.border,
  },
  sampleLabel: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
    marginBottom: 8,
  },
  samplePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  samplePill: {
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  samplePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
  },
});

export default UrlScannerScreen;
