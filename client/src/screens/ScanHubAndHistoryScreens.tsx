import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/security';
import { SecurityPalette, Spacing, Radius } from '../theme/theme';
import {
  StatusCard,
  StatusBadge,
  AppButton,
  EmptyStateView,
} from '../design-system/components';
import { useSecurityStore } from '../store/useSecurityStore';

/* ============================================================================
 * 1. SCAN HUB SCREEN (/scan)
 * ========================================================================== */
type ScanHubProps = NativeStackScreenProps<RootStackParamList, 'ScanHub'>;

export const ScanHubScreen: React.FC<ScanHubProps> = ({ navigation }) => {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Scan & Check</Text>
      <Text style={styles.pageSubtitle}>
        Choose what you would like to verify right now.
      </Text>

      <StatusCard
        title="URL Scanner (Check Website)"
        subtitle="Paste any website link to check if it is safe before opening"
        status="SAFE"
        statusLabel="Open →"
        onPress={() => navigation.navigate('UrlScanner')}
      />

      <StatusCard
        title="QR Scanner"
        subtitle="Scan a QR code or upload a screenshot to preview the link safely"
        status="SAFE"
        statusLabel="Open →"
        onPress={() => navigation.navigate('QrScanner')}
      />

      <StatusCard
        title="Wi-Fi Scanner"
        subtitle="Check if your current Wi-Fi network is encrypted and private"
        status="SAFE"
        statusLabel="Open →"
        onPress={() => navigation.navigate('WifiAnalyzer')}
      />

      <StatusCard
        title="Permission Analyzer"
        subtitle="Audit camera, microphone, location, SMS, and contacts permissions"
        status="SAFE"
        statusLabel="Audit →"
        onPress={() => navigation.navigate('PermissionAnalyzer')}
      />

      <StatusCard
        title="Scan History"
        subtitle="Review or clear your past website, QR, and Wi-Fi checks"
        status="SAFE"
        statusLabel="View →"
        onPress={() => navigation.navigate('ScanHistory')}
      />
    </ScrollView>
  );
};

/* ============================================================================
 * 2. SCAN HISTORY SCREEN (/scan/history)
 * ========================================================================== */
type HistoryProps = NativeStackScreenProps<RootStackParamList, 'ScanHistory'>;

const TABS: readonly ('All' | 'URLs' | 'QR' | 'Wi-Fi')[] = [
  'All',
  'URLs',
  'QR',
  'Wi-Fi',
];

export const ScanHistoryScreen: React.FC<HistoryProps> = ({
  route,
  navigation,
}) => {
  const scanHistory = useSecurityStore((state) => state.scanHistory);
  const deleteScanHistoryItem = useSecurityStore(
    (state) => state.deleteScanHistoryItem,
  );
  const clearScanHistory = useSecurityStore((state) => state.clearScanHistory);

  const [activeTab, setActiveTab] = useState<'All' | 'URLs' | 'QR' | 'Wi-Fi'>(
    route.params?.initialTab ?? 'All',
  );

  const filtered =
    activeTab === 'All'
      ? scanHistory
      : scanHistory.filter((item) => item.type === activeTab);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Scan History</Text>
          <Text style={styles.pageSubtitle}>
            Your past website, QR code, and Wi-Fi safety checks.
          </Text>
        </View>
        {scanHistory.length > 0 ? (
          <AppButton
            label="Clear history"
            onPress={clearScanHistory}
            variant="secondary"
          />
        ) : null}
      </View>

      {/* Filter Tabs: All | URLs | QR | Wi-Fi */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabPill,
              activeTab === tab && styles.tabPillActive,
            ]}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && { color: '#FFFFFF' },
              ]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyStateView
          title="You haven't scanned anything yet."
          message="Check a website link, QR code, or Wi-Fi network to see your history here."
          actionLabel="Check a Website"
          onAction={() => navigation.navigate('UrlScanner')}
        />
      ) : (
        filtered.map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.historyTopRow}>
              <Text style={styles.historyTypeTag}>{item.type}</Text>
              <StatusBadge status={item.status} customLabel={item.result} />
            </View>
            <Text style={styles.historyTarget}>{item.target}</Text>
            <Text style={styles.historySummary}>{item.summary}</Text>
            <View style={styles.historyFooter}>
              <Text style={styles.historyTime}>
                {item.date} • {item.time}
              </Text>
              <View style={styles.historyActions}>
                <Pressable
                  onPress={() => {
                    if (item.type === 'URLs') {
                      navigation.navigate('UrlScanner', {
                        initialUrl: item.target,
                      });
                    } else if (item.type === 'QR') {
                      navigation.navigate('QrScanner');
                    } else {
                      navigation.navigate('WifiAnalyzer');
                    }
                  }}>
                  <Text style={styles.actionLink}>View</Text>
                </Pressable>
                <Pressable onPress={() => deleteScanHistoryItem(item.id)}>
                  <Text style={styles.deleteLink}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))
      )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 15,
    color: SecurityPalette.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.lg,
    flexWrap: 'wrap',
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: SecurityPalette.surface,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  tabPillActive: {
    backgroundColor: SecurityPalette.primary,
    borderColor: SecurityPalette.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.textSecondary,
  },
  historyCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.md,
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyTypeTag: {
    fontSize: 11,
    fontWeight: '800',
    color: SecurityPalette.interactive,
    textTransform: 'uppercase',
  },
  historyTarget: {
    fontSize: 15,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
  },
  historySummary: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    marginBottom: 10,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: SecurityPalette.border,
    paddingTop: 10,
  },
  historyTime: {
    fontSize: 12,
    color: SecurityPalette.textMuted,
  },
  historyActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionLink: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.primary,
  },
  deleteLink: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.critical,
  },
});
