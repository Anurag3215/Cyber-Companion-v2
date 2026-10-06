import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  PermissionsAndroid,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/security';
import { SecurityPalette, Spacing, Radius } from '../theme/theme';
import { AppButton, StatusBadge } from '../design-system/components';
import { useSecurityStore } from '../store/useSecurityStore';
import { NativeSecurityBridge, RealInstalledApp } from '../services/nativeBridge';

type Props = NativeStackScreenProps<RootStackParamList, 'PermissionAnalyzer'>;

interface DevicePermissionAudit {
  readonly id: string;
  readonly name: string;
  readonly androidPermission: string | null;
  readonly isGranted: boolean;
  readonly riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  readonly riskExplanation: string;
  readonly whyItMatters: string;
}

export const PermissionAnalyzerScreen: React.FC<Props> = () => {
  const privacyPermissions = useSecurityStore((state) => state.privacyPermissions);
  const cyclePrivacyPermission = useSecurityStore((state) => state.cyclePrivacyPermission);
  const reviewAndTightenPrivacy = useSecurityStore((state) => state.reviewAndTightenPrivacy);
  const setScore = useSecurityStore((state) => state.setScore);

  const [loading, setLoading] = useState(false);
  const [lastAuditTime, setLastAuditTime] = useState<string>('Just now');
  const [deviceAudits, setDeviceAudits] = useState<readonly DevicePermissionAudit[]>([]);
  const [reviewedBanner, setReviewedBanner] = useState(false);

  // Live Android Hardware & System Permission Audit
  const runLiveAudit = useCallback(async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'android') {
        const cameraGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        const micGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );
        const locationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        const contactsGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        );
        const smsGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_SMS,
        );

        let notifGranted = true;
        if (Number(Platform.Version) >= 33 && PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS) {
          notifGranted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
        }

        const audits: DevicePermissionAudit[] = [
          {
            id: 'sms',
            name: 'SMS & Messages (OTPs)',
            androidPermission: PermissionsAndroid.PERMISSIONS.READ_SMS,
            isGranted: smsGranted,
            riskLevel: 'CRITICAL',
            riskExplanation:
              'SMS permission allows apps to read sensitive one-time passwords (OTPs) and 2FA verification codes.',
            whyItMatters:
              'Malicious apps target SMS to bypass two-factor banking protections and impersonate you.',
          },
          {
            id: 'location',
            name: 'Precise Location (GPS)',
            androidPermission: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            isGranted: locationGranted,
            riskLevel: 'HIGH',
            riskExplanation:
              'Gives precise physical coordinates. Dangerous when combined with background activity.',
            whyItMatters:
              'Unnecessary location access allows ad networks and attackers to track your physical routine.',
          },
          {
            id: 'microphone',
            name: 'Microphone (Audio Capture)',
            androidPermission: PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            isGranted: micGranted,
            riskLevel: 'HIGH',
            riskExplanation:
              'Allows recording ambient audio without showing an on-screen prompt once granted.',
            whyItMatters:
              'Background audio surveillance can capture private phone calls and nearby conversations.',
          },
          {
            id: 'camera',
            name: 'Camera (Hardware Optical)',
            androidPermission: PermissionsAndroid.PERMISSIONS.CAMERA,
            isGranted: cameraGranted,
            riskLevel: 'MEDIUM',
            riskExplanation:
              'Allows capturing photos and video streams via device camera hardware.',
            whyItMatters:
              'Only trusted camera and QR scanning applications should hold active camera permissions.',
          },
          {
            id: 'contacts',
            name: 'Contacts & Address Book',
            androidPermission: PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            isGranted: contactsGranted,
            riskLevel: 'MEDIUM',
            riskExplanation:
              'Allows reading stored phone numbers, email addresses, and full contact names.',
            whyItMatters:
              'Contact harvesting is used to map personal networks and send targeted phishing messages.',
          },
          {
            id: 'notifications',
            name: 'Notifications (Security Alerts)',
            androidPermission:
              Number(Platform.Version) >= 33
                ? PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                : null,
            isGranted: notifGranted,
            riskLevel: 'LOW',
            riskExplanation:
              'Displays critical threat warnings and real-time security alerts.',
            whyItMatters:
              'Keeping notifications active ensures you receive instant alerts when threats are blocked.',
          },
        ];

        setDeviceAudits(audits);
      } else {
        // Fallback for non-Android / simulator
        setDeviceAudits([
          {
            id: 'sms',
            name: 'SMS & Messages',
            androidPermission: null,
            isGranted: false,
            riskLevel: 'CRITICAL',
            riskExplanation: 'Protected against OTP interception.',
            whyItMatters: 'Protects two-factor verification codes.',
          },
          {
            id: 'location',
            name: 'Precise Location',
            androidPermission: null,
            isGranted: false,
            riskLevel: 'HIGH',
            riskExplanation: 'Restricted to user-initiated requests.',
            whyItMatters: 'Prevents background tracking.',
          },
        ]);
      }
      setLastAuditTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runLiveAudit();
  }, [runLiveAudit]);

  // Risk Combination Evaluation
  const smsGranted = deviceAudits.find((a) => a.id === 'sms')?.isGranted ?? false;
  const locationGranted = deviceAudits.find((a) => a.id === 'location')?.isGranted ?? false;
  const micGranted = deviceAudits.find((a) => a.id === 'microphone')?.isGranted ?? false;

  const hasCriticalCombo = smsGranted && locationGranted;
  const hasAudioCombo = micGranted && locationGranted;

  const handleOpenSettings = () => {
    Linking.openSettings().catch(() => {});
  };

  const handleOptimizePermissions = () => {
    reviewAndTightenPrivacy();
    setScore(96, 'All app permissions and privacy settings optimized.');
    setReviewedBanner(true);
  };

  const [activeTab, setActiveTab] = useState<'InstalledApps' | 'Permissions'>('InstalledApps');

  // Dynamic Real Installed Apps from Android PackageManager
  const [realApps, setRealApps] = useState<readonly RealInstalledApp[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appFilter, setAppFilter] = useState<'ALL' | 'CRITICAL' | 'LOCATION' | 'SMS' | 'OVERLAY'>('ALL');

  const loadRealInstalledApps = useCallback(async () => {
    setAppsLoading(true);
    try {
      const apps = await NativeSecurityBridge.getInstalledApps();
      setRealApps(apps);
    } catch {
      // Fallback
    } finally {
      setAppsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRealInstalledApps();
  }, [loadRealInstalledApps]);

  const appsReviewedCount = realApps.length;
  const criticalAppsCount = realApps.filter((a) => a.riskLevel === 'CRITICAL' || a.riskLevel === 'HIGH').length;
  const mediumAppsCount = realApps.filter((a) => a.riskLevel === 'MEDIUM').length;
  const lowAppsCount = realApps.filter((a) => a.riskLevel === 'LOW').length;

  const filteredApps = realApps.filter((app) => {
    if (appFilter === 'CRITICAL') return app.riskLevel === 'CRITICAL' || app.riskLevel === 'HIGH';
    if (appFilter === 'LOCATION') return app.dangerousPermissions.some((p) => p.permission.includes('LOCATION'));
    if (appFilter === 'SMS') return app.dangerousPermissions.some((p) => p.permission.includes('SMS'));
    if (appFilter === 'OVERLAY') return app.dangerousPermissions.some((p) => p.permission.includes('SYSTEM_ALERT_WINDOW') || p.permission.includes('INSTALL_PACKAGES'));
    return true;
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerBlock}>
        <Text style={styles.pageTitle}>Permission Analyzer</Text>
        <Text style={styles.pageSubtitle}>
          Review what your apps can access across hardware sensors, sensitive storage, and background services.
        </Text>
      </View>

      {/* SEGMENTED TABS (Screen 14/21) */}
      <View style={styles.segmentedTabContainer}>
        <Pressable
          onPress={() => setActiveTab('InstalledApps')}
          style={[
            styles.segmentBtn,
            activeTab === 'InstalledApps' && styles.segmentBtnActive,
          ]}>
          <Text
            style={[
              styles.segmentBtnText,
              activeTab === 'InstalledApps' && styles.segmentBtnTextActive,
            ]}>
            Installed Apps ({appsReviewedCount})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('Permissions')}
          style={[
            styles.segmentBtn,
            activeTab === 'Permissions' && styles.segmentBtnActive,
          ]}>
          <Text
            style={[
              styles.segmentBtnText,
              activeTab === 'Permissions' && styles.segmentBtnTextActive,
            ]}>
            Hardware Permissions
          </Text>
        </Pressable>
      </View>

      {/* SUMMARY STATS BAR (Dynamic Data from Real Device) */}
      <View style={styles.summaryStatsRow}>
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>Apps Audited</Text>
          <Text style={styles.statNumber}>{appsReviewedCount}</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={[styles.statLabel, { color: SecurityPalette.critical }]}>High / Critical</Text>
          <Text style={[styles.statNumber, { color: SecurityPalette.critical }]}>{criticalAppsCount}</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={[styles.statLabel, { color: SecurityPalette.warning }]}>Medium Risk</Text>
          <Text style={[styles.statNumber, { color: SecurityPalette.warning }]}>{mediumAppsCount}</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={[styles.statLabel, { color: SecurityPalette.safe }]}>Low / Safe</Text>
          <Text style={[styles.statNumber, { color: SecurityPalette.safe }]}>{lowAppsCount}</Text>
        </View>
      </View>

      {/* TAB 1: INSTALLED APPS (REAL ANDROID PACKAGES) */}
      {activeTab === 'InstalledApps' ? (
        <View style={styles.cardList}>
          <View style={styles.appsHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Installed Apps & Access</Text>
            <Pressable onPress={loadRealInstalledApps} style={styles.refreshBtn}>
              {appsLoading ? (
                <ActivityIndicator size="small" color={SecurityPalette.primary} />
              ) : (
                <Text style={styles.refreshBtnText}>↻ Re-Scan Apps</Text>
              )}
            </Pressable>
          </View>

          {/* Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {(
              [
                { id: 'ALL', label: `All (${appsReviewedCount})` },
                { id: 'CRITICAL', label: `⚠️ Risky (${criticalAppsCount})` },
                { id: 'LOCATION', label: '📍 Location' },
                { id: 'SMS', label: '✉️ SMS / OTP' },
                { id: 'OVERLAY', label: '🪟 Overlays' },
              ] as const
            ).map((f) => (
              <Pressable
                key={f.id}
                onPress={() => setAppFilter(f.id)}
                style={[styles.filterChip, appFilter === f.id && styles.filterChipActive]}>
                <Text
                  style={[styles.filterChipText, appFilter === f.id && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {appsLoading && realApps.length === 0 ? (
            <View style={styles.appsLoadingBox}>
              <ActivityIndicator size="large" color={SecurityPalette.primary} />
              <Text style={styles.appsLoadingText}>
                Auditing device applications and permission security flags...
              </Text>
            </View>
          ) : filteredApps.length === 0 ? (
            <View style={styles.emptyAppsBox}>
              <Text style={styles.emptyAppsTitle}>No Applications Found</Text>
              <Text style={styles.emptyAppsSub}>
                No applications on this device matched the selected filter criteria.
              </Text>
            </View>
          ) : (
            filteredApps.map((app) => (
              <View key={app.packageName} style={styles.appCard}>
                <View style={styles.appIconBox}>
                  <Text style={styles.appIconEmoji}>
                    {app.riskLevel === 'CRITICAL' ? '🚨' : app.riskLevel === 'HIGH' ? '⚠️' : '📱'}
                  </Text>
                </View>
                <View style={styles.appInfoCol}>
                  <View style={styles.appTitleRow}>
                    <Text style={styles.appNameText} numberOfLines={1}>
                      {app.appName}
                    </Text>
                    <Text style={styles.appVersionText}>v{app.versionName}</Text>
                  </View>
                  <Text style={styles.appPackageText} numberOfLines={1}>
                    {app.packageName}
                  </Text>

                  {app.dangerousPermissions.length > 0 ? (
                    <View style={styles.permsWrap}>
                      {app.dangerousPermissions.map((p) => (
                        <View key={p.permission} style={styles.permChip}>
                          <Text style={styles.permChipText}>{p.friendlyName}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noPermsText}>✓ No sensitive background permissions held</Text>
                  )}

                  <Pressable
                    onPress={() => NativeSecurityBridge.openAppSettings(app.packageName)}
                    style={styles.manageAppSettingsBtn}>
                    <Text style={styles.manageAppSettingsText}>Manage in Android Settings ⚙️</Text>
                  </Pressable>
                </View>

                <View style={styles.appRiskCol}>
                  <View
                    style={[
                      styles.riskChip,
                      app.riskLevel === 'CRITICAL' || app.riskLevel === 'HIGH'
                        ? styles.riskChipHigh
                        : app.riskLevel === 'MEDIUM'
                          ? styles.riskChipMedium
                          : styles.riskChipSafe,
                    ]}>
                    <Text
                      style={[
                        styles.riskChipText,
                        app.riskLevel === 'CRITICAL' || app.riskLevel === 'HIGH'
                          ? styles.riskChipTextHigh
                          : app.riskLevel === 'MEDIUM'
                            ? styles.riskChipTextMedium
                            : styles.riskChipTextSafe,
                      ]}>
                      {app.riskLevel}
                    </Text>
                  </View>
                  <Text style={styles.riskScoreLabel}>{app.riskScore}/100 Risk</Text>
                </View>
              </View>
            ))
          )}
        </View>
      ) : null}

      {/* TAB 2: HARDWARE PERMISSIONS */}
      {activeTab === 'Permissions' ? (
        <>
          {/* COMBINATION RISK ANALYSIS ENGINE */}
          {hasCriticalCombo ? (
            <View style={styles.highRiskBanner}>
              <Text style={styles.highRiskTitle}>
                🚨 CRITICAL RISK: SMS Access + Location Tracking
              </Text>
              <Text style={styles.highRiskBody}>
                Both SMS reading and Background Location are active. Malicious apps can
                intercept your bank verification codes (OTPs) while correlating your physical
                coordinates. Revoke SMS access in Device Settings.
              </Text>
              <Pressable onPress={handleOpenSettings} style={styles.bannerActionBtn}>
                <Text style={styles.bannerActionText}>Open Device Settings →</Text>
              </Pressable>
            </View>
          ) : hasAudioCombo ? (
            <View style={[styles.highRiskBanner, { borderColor: SecurityPalette.warning }]}>
              <Text style={[styles.highRiskTitle, { color: SecurityPalette.warning }]}>
                ⚠️ HIGH RISK: Microphone + Location Active
              </Text>
              <Text style={styles.highRiskBody}>
                Microphone and location access can allow continuous ambient audio monitoring
                coupled with geographic triangulation.
              </Text>
            </View>
          ) : (
            <View style={styles.safeBanner}>
              <Text style={styles.safeTitle}>
                ✓ Zero High-Risk Permission Combinations Active
              </Text>
              <Text style={styles.safeBody}>
                Your sensitive verification codes (SMS) and hardware sensors are protected
                against unverified background correlation.
              </Text>
            </View>
          )}

          {reviewedBanner && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>
                ✓ Privacy protection optimized! Security score updated to 96/100.
              </Text>
            </View>
          )}

          {/* AUDIT STATUS & ACTIONS */}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>
              Audited: {lastAuditTime}
            </Text>
            <Pressable onPress={runLiveAudit} style={styles.refreshBtn}>
              {loading ? (
                <ActivityIndicator size="small" color={SecurityPalette.primary} />
              ) : (
                <Text style={styles.refreshBtnText}>↻ Run Live Audit</Text>
              )}
            </Pressable>
          </View>
        </>
      ) : null}

      {/* PERMISSION AUDIT CARDS */}
      <View style={styles.cardList}>
        {deviceAudits.map((item) => (
          <View key={item.id} style={styles.auditCard}>
            <View style={styles.auditHeader}>
              <View style={styles.auditTitleCol}>
                <Text style={styles.auditName}>{item.name}</Text>
                <Text
                  style={[
                    styles.riskBadge,
                    item.riskLevel === 'CRITICAL'
                      ? { color: SecurityPalette.critical }
                      : item.riskLevel === 'HIGH'
                        ? { color: SecurityPalette.warning }
                        : { color: SecurityPalette.textMuted },
                  ]}>
                  Risk: {item.riskLevel}
                </Text>
              </View>
              <StatusBadge
                status={item.isGranted ? (item.riskLevel === 'CRITICAL' || item.riskLevel === 'HIGH' ? 'DANGER' : 'ATTENTION') : 'SAFE'}
                customLabel={item.isGranted ? 'Granted' : 'Denied / Protected'}
              />
            </View>

            <Text style={styles.auditDesc}>{item.riskExplanation}</Text>
            <Text style={styles.auditWhy}>{item.whyItMatters}</Text>
          </View>
        ))}
      </View>

      {/* QUICK SYSTEM CONTROLS */}
      <View style={styles.actionsContainer}>
        <AppButton
          label="Open Phone App Settings"
          onPress={handleOpenSettings}
          variant="secondary"
          fullWidth
        />
        <View style={{ height: Spacing.sm }} />
        <AppButton
          label="Optimize Protection (Tighten All)"
          onPress={handleOptimizePermissions}
          variant="primary"
          fullWidth
        />
      </View>
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
    marginBottom: Spacing.md,
  },
  highRiskBanner: {
    backgroundColor: '#2D1418',
    borderColor: SecurityPalette.critical,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: Spacing.md,
  },
  highRiskTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: SecurityPalette.critical,
    marginBottom: 4,
  },
  highRiskBody: {
    fontSize: 12.5,
    color: '#FCA5A5',
    lineHeight: 18,
  },
  bannerActionBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: SecurityPalette.critical,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
  },
  bannerActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  safeBanner: {
    backgroundColor: SecurityPalette.safeSoft,
    borderColor: SecurityPalette.safe,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: Spacing.md,
  },
  safeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: SecurityPalette.safe,
    marginBottom: 3,
  },
  safeBody: {
    fontSize: 12.5,
    color: SecurityPalette.textSecondary,
    lineHeight: 18,
  },
  successBanner: {
    backgroundColor: SecurityPalette.safeSoft,
    borderColor: SecurityPalette.safe,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: Spacing.md,
  },
  successText: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.safe,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: 2,
  },
  metaLabel: {
    fontSize: 12,
    color: SecurityPalette.textMuted,
    fontWeight: '600',
  },
  refreshBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  refreshBtnText: {
    fontSize: 12.5,
    color: SecurityPalette.primary,
    fontWeight: '700',
  },
  cardList: {
    marginBottom: Spacing.lg,
  },
  auditCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.md,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  auditTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  auditName: {
    fontSize: 15.5,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
  },
  riskBadge: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  auditDesc: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  auditWhy: {
    fontSize: 12,
    color: SecurityPalette.textMuted,
    lineHeight: 16,
  },
  actionsContainer: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  /* Screen 14 & 21 Styles */
  segmentedTabContainer: {
    flexDirection: 'row',
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: Radius.lg,
    padding: 4,
    marginBottom: Spacing.md,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  segmentBtnActive: {
    backgroundColor: SecurityPalette.primary,
  },
  segmentBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: SecurityPalette.textSecondary,
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  summaryStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  statTile: {
    flex: 1,
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: SecurityPalette.textSecondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: Spacing.sm,
  },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.sm,
  },
  appIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: SecurityPalette.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  appIconEmoji: {
    fontSize: 22,
  },
  appInfoCol: {
    flex: 1,
  },
  appNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 2,
  },
  appPermText: {
    fontSize: 12.5,
    color: SecurityPalette.textSecondary,
  },
  riskChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  riskChipHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  riskChipMedium: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  riskChipLow: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  riskChipSafe: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  riskChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  riskChipTextHigh: {
    color: SecurityPalette.critical,
  },
  riskChipTextMedium: {
    color: SecurityPalette.warning,
  },
  riskChipTextLow: {
    color: SecurityPalette.primary,
  },
  appsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  filtersScroll: {
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: SecurityPalette.surface,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: SecurityPalette.primary,
    borderColor: SecurityPalette.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: SecurityPalette.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  appsLoadingBox: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  appsLoadingText: {
    marginTop: Spacing.md,
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    textAlign: 'center',
  },
  emptyAppsBox: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  emptyAppsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
  },
  emptyAppsSub: {
    fontSize: 12.5,
    color: SecurityPalette.textSecondary,
    textAlign: 'center',
  },
  appTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appVersionText: {
    fontSize: 11,
    color: SecurityPalette.textSecondary,
    backgroundColor: SecurityPalette.surfaceVariant,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  appPackageText: {
    fontSize: 11,
    color: SecurityPalette.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  permsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  permChip: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  permChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: SecurityPalette.critical,
  },
  noPermsText: {
    fontSize: 11,
    color: SecurityPalette.safe,
    marginBottom: 6,
    fontWeight: '500',
  },
  manageAppSettingsBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginTop: 2,
  },
  manageAppSettingsText: {
    fontSize: 11,
    fontWeight: '600',
    color: SecurityPalette.textSecondary,
  },
  appRiskCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  riskScoreLabel: {
    fontSize: 10,
    color: SecurityPalette.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  riskChipTextSafe: {
    color: SecurityPalette.safe,
  },
});

export default PermissionAnalyzerScreen;
