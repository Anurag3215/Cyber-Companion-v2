import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/security';
import { SecurityPalette, Spacing, Radius } from '../theme/theme';
import { AppButton, StatusBadge } from '../design-system/components';
import { useSecurityStore } from '../store/useSecurityStore';

type Props = NativeStackScreenProps<RootStackParamList, 'PermissionAnalyzer'>;

/**
 * SECTION 18: PRIVACY CENTER (/security/privacy)
 * Shows Camera, Microphone, Location, Contacts, Storage, Notifications
 * Each displays: Allowed | Denied | Limited + "Review Privacy"
 */
export const PermissionAnalyzerScreen: React.FC<Props> = () => {
  const privacyPermissions = useSecurityStore(
    (state) => state.privacyPermissions,
  );
  const cyclePrivacyPermission = useSecurityStore(
    (state) => state.cyclePrivacyPermission,
  );
  const reviewAndTightenPrivacy = useSecurityStore(
    (state) => state.reviewAndTightenPrivacy,
  );

  const [reviewedBanner, setReviewedBanner] = useState(false);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Privacy Center</Text>
      <Text style={styles.pageSubtitle}>
        See which sensitive parts of your phone apps can use. Tap any permission
        below to cycle between Allowed, Limited, and Denied.
      </Text>

      {reviewedBanner ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>
            ✓ Privacy settings reviewed! Unnecessary microphone and contact
            permissions have been limited.
          </Text>
        </View>
      ) : null}

      {privacyPermissions.map((perm) => {
        const badgeStatus =
          perm.status === 'Denied' || perm.status === 'Limited'
            ? 'SAFE'
            : perm.flaggedApps.length > 0
              ? 'ATTENTION'
              : 'SAFE';

        return (
          <Pressable
            key={perm.id}
            onPress={() => cyclePrivacyPermission(perm.id)}
            style={styles.permCard}>
            <View style={styles.permHeader}>
              <View>
                <Text style={styles.permTitle}>{perm.name}</Text>
                <Text style={styles.permCount}>
                  {perm.appsCount} apps requested access
                </Text>
              </View>
              <StatusBadge status={badgeStatus} customLabel={perm.status} />
            </View>

            <Text style={styles.permDesc}>{perm.plainDescription}</Text>

            {perm.flaggedApps.length > 0 ? (
              <View style={styles.flaggedBox}>
                <Text style={styles.flaggedLabel}>
                  ⚠ Needs attention: {perm.flaggedApps.join(', ')}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}

      <View style={{ marginTop: Spacing.md }}>
        <AppButton
          label="Review Privacy"
          onPress={() => {
            reviewAndTightenPrivacy();
            setReviewedBanner(true);
          }}
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
  successBanner: {
    backgroundColor: SecurityPalette.safeSoft,
    borderColor: SecurityPalette.safe,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: Spacing.lg,
  },
  successText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: SecurityPalette.safe,
  },
  permCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.md,
  },
  permHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  permTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
  },
  permCount: {
    fontSize: 12,
    color: SecurityPalette.textMuted,
  },
  permDesc: {
    fontSize: 14,
    color: SecurityPalette.textSecondary,
    lineHeight: 20,
  },
  flaggedBox: {
    marginTop: 10,
    backgroundColor: SecurityPalette.warningSoft,
    padding: 10,
    borderRadius: Radius.sm,
  },
  flaggedLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: SecurityPalette.warning,
  },
});

export default PermissionAnalyzerScreen;
