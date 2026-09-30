import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/security';
import { SecurityPalette, Spacing, Radius } from '../theme/theme';
import {
  StatusBadge,
  ScanResultCard,
  LoadingStateView,
} from '../design-system/components';
import { CyberSecurityService } from '../services/cyberService';
import { useSecurityStore } from '../store/useSecurityStore';

type Props = NativeStackScreenProps<RootStackParamList, 'WifiAnalyzer'>;

export const WifiAnalyzerScreen: React.FC<Props> = () => {
  const addScanHistoryItem = useSecurityStore(
    (state) => state.addScanHistoryItem,
  );
  const [checking, setChecking] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'HOME' | 'PUBLIC'>('HOME');

  const assessment =
    selectedPreset === 'HOME'
      ? CyberSecurityService.analyzeWifi('Home_Fiber_5G', 'WPA2', false)
      : CyberSecurityService.analyzeWifi('Cafe_Free_Guest_WiFi', 'OPEN', true);

  const switchNetworkCheck = (preset: 'HOME' | 'PUBLIC') => {
    setChecking(true);
    setTimeout(() => {
      setSelectedPreset(preset);
      setChecking(false);
      const next =
        preset === 'HOME'
          ? CyberSecurityService.analyzeWifi('Home_Fiber_5G', 'WPA2', false)
          : CyberSecurityService.analyzeWifi('Cafe_Free_Guest_WiFi', 'OPEN', true);
      addScanHistoryItem({
        type: 'Wi-Fi',
        target: next.ssid,
        result: next.status === 'SAFE' ? 'Safe' : 'Attention',
        status: next.status,
        summary: next.humanEncryptionLabel,
      });
    }, 350);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Wi-Fi Security</Text>
      <Text style={styles.pageSubtitle}>
        See whether your current Wi-Fi connection is private and safe for
        everyday browsing or banking.
      </Text>

      {/* Preset Toggle to inspect Home vs Open Public Wi-Fi */}
      <View style={styles.presetSwitchRow}>
        <Pressable
          onPress={() => switchNetworkCheck('HOME')}
          style={[
            styles.presetTab,
            selectedPreset === 'HOME' && styles.presetTabActive,
          ]}>
          <Text
            style={[
              styles.presetTabText,
              selectedPreset === 'HOME' && { color: '#FFFFFF' },
            ]}>
            Home Wi-Fi (WPA2)
          </Text>
        </Pressable>
        <Pressable
          onPress={() => switchNetworkCheck('PUBLIC')}
          style={[
            styles.presetTab,
            selectedPreset === 'PUBLIC' && styles.presetTabActive,
          ]}>
          <Text
            style={[
              styles.presetTabText,
              selectedPreset === 'PUBLIC' && { color: '#FFFFFF' },
            ]}>
            Open Public Wi-Fi
          </Text>
        </Pressable>
      </View>

      {checking ? (
        <LoadingStateView
          message="Checking Wi-Fi..."
          subtext="Checking network privacy and password security."
        />
      ) : (
        <>
          <View style={styles.networkSummaryCard}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.metaLabel}>CURRENT NETWORK</Text>
                <Text style={styles.ssidTitle}>{assessment.ssid}</Text>
              </View>
              <StatusBadge
                status={assessment.status}
                customLabel={
                  assessment.status === 'SAFE'
                    ? '✓ Protected'
                    : '⚠ Needs attention'
                }
              />
            </View>

            <View style={styles.factsGrid}>
              <View style={styles.factItem}>
                <Text style={styles.factLabel}>Connection status</Text>
                <Text style={styles.factValue}>
                  {assessment.connectionStatus}
                </Text>
              </View>
              <View style={styles.factItem}>
                <Text style={styles.factLabel}>Network type</Text>
                <Text style={styles.factValue}>{assessment.networkType}</Text>
              </View>
              <View style={styles.factItemFull}>
                <Text style={styles.factLabel}>Encryption</Text>
                <Text style={styles.factValueHighlight}>
                  {assessment.humanEncryptionLabel}
                </Text>
              </View>
            </View>
          </View>

          <ScanResultCard
            status={assessment.status}
            headline={assessment.insight.summary}
            explanation={assessment.explanation}
          />
        </>
      )}
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
  presetSwitchRow: {
    flexDirection: 'row',
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.lg,
  },
  presetTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  presetTabActive: {
    backgroundColor: SecurityPalette.primary,
  },
  presetTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.textSecondary,
  },
  networkSummaryCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: SecurityPalette.textSecondary,
    letterSpacing: 0.6,
  },
  ssidTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginTop: 2,
  },
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  factItem: {
    flex: 1,
    minWidth: 140,
    backgroundColor: SecurityPalette.surfaceVariant,
    padding: 12,
    borderRadius: Radius.md,
  },
  factItemFull: {
    width: '100%',
    backgroundColor: SecurityPalette.surfaceVariant,
    padding: 12,
    borderRadius: Radius.md,
  },
  factLabel: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
    marginBottom: 3,
  },
  factValue: {
    fontSize: 14,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
  },
  factValueHighlight: {
    fontSize: 15,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
  },
});

export default WifiAnalyzerScreen;
