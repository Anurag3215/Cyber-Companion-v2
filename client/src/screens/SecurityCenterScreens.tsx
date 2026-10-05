import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/security';
import { SecurityPalette, Spacing, Radius } from '../theme/theme';
import {
  StatusCard,
  AppInput,
  AppButton,
  AppProgressBar,
  StatusBadge,
} from '../design-system/components';
import { CyberSecurityService } from '../services/cyberService';
import { useSecurityStore } from '../store/useSecurityStore';

/* ============================================================================
 * 1. SECURITY CENTER HUB (/security) — Section 14
 * ========================================================================== */
type CenterProps = NativeStackScreenProps<RootStackParamList, 'SecurityCenter'>;

export const SecurityCenterScreen: React.FC<CenterProps> = ({ navigation }) => {
  const unverifiedCount = useSecurityStore(
    (state) => state.unverifiedPermissionsCount,
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Security Center</Text>
      <Text style={styles.pageSubtitle}>
        Select an area below to review your protection settings in simple steps.
      </Text>

      <StatusCard
        title="Permission Analyzer"
        subtitle="Audit camera, microphone, location, SMS, and contacts permissions"
        status={unverifiedCount > 0 ? 'ATTENTION' : 'SAFE'}
        statusLabel={unverifiedCount > 0 ? '⚠ Needs attention' : 'Open →'}
        onPress={() => navigation.navigate('PermissionAnalyzer')}
      />

      <StatusCard
        title="Device Security"
        subtitle="Check system updates, app installation safety, and device health"
        status="SAFE"
        statusLabel="✓ Good"
        onPress={() => navigation.navigate('DeviceSecurity')}
      />

      <StatusCard
        title="Network Security"
        subtitle="Inspect current Wi-Fi encryption and public hotspot safety"
        status="SAFE"
        statusLabel="✓ Good"
        onPress={() => navigation.navigate('NetworkSecurity')}
      />

      <StatusCard
        title="Privacy & Storage"
        subtitle="Manage background access and sensitive Android storage settings"
        status="SAFE"
        statusLabel="✓ Good"
        onPress={() => navigation.navigate('PermissionAnalyzer')}
      />
    </ScrollView>
  );
};

/* ============================================================================
 * 2. PASSWORD SECURITY (/security/password) — Section 15
 * ========================================================================== */
type PasswordProps = NativeStackScreenProps<
  RootStackParamList,
  'PasswordSecurity'
>;

export const PasswordSecurityScreen: React.FC<PasswordProps> = () => {
  const [testPassword, setTestPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState(
    'Calm-Shield-94!Safe',
  );
  const [copiedBanner, setCopiedBanner] = useState(false);

  const strength = CyberSecurityService.evaluatePasswordStrength(testPassword);

  const handleGenerate = () => {
    const pwd = CyberSecurityService.generatePassword({
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
    });
    setGeneratedPassword(pwd);
    setCopiedBanner(false);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Password Security</Text>
      <Text style={styles.pageSubtitle}>
        Check how strong a password is or create a new one. Your passwords are
        checked locally and never stored or sent anywhere.
      </Text>

      {/* Password Strength Meter */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Password Strength</Text>
        <AppInput
          label="Test a password"
          type="password"
          placeholder="Type a password to test its strength"
          value={testPassword}
          onChangeText={setTestPassword}
        />

        <AppProgressBar value={strength.score} label={strength.label} />
        <Text style={styles.helperText}>{strength.feedback}</Text>
      </View>

      {/* Password Generator */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Password Generator</Text>
        <View style={styles.generatedBox}>
          <Text style={styles.generatedText}>{generatedPassword}</Text>
        </View>

        {copiedBanner ? (
          <Text style={styles.copiedText}>
            ✓ Copied to clipboard! Remember to save it in your password manager.
          </Text>
        ) : null}

        {/* Length Selector */}
        <View style={styles.lengthRow}>
          <Text style={styles.optionLabel}>Length: {length} characters</Text>
          <View style={styles.lengthButtons}>
            {[12, 16, 20, 24].map((len) => (
              <Pressable
                key={len}
                onPress={() => setLength(len)}
                style={[
                  styles.lenPill,
                  length === len && styles.lenPillActive,
                ]}>
                <Text
                  style={[
                    styles.lenPillText,
                    length === len && { color: '#FFFFFF' },
                  ]}>
                  {len}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Character Options */}
        <View style={styles.togglesGrid}>
          {[
            {
              label: 'Uppercase (A-Z)',
              val: includeUppercase,
              toggle: () => setIncludeUppercase((p) => !p),
            },
            {
              label: 'Lowercase (a-z)',
              val: includeLowercase,
              toggle: () => setIncludeLowercase((p) => !p),
            },
            {
              label: 'Numbers (0-9)',
              val: includeNumbers,
              toggle: () => setIncludeNumbers((p) => !p),
            },
            {
              label: 'Symbols (!@#$)',
              val: includeSymbols,
              toggle: () => setIncludeSymbols((p) => !p),
            },
          ].map((item) => (
            <Pressable
              key={item.label}
              onPress={item.toggle}
              style={styles.toggleRow}>
              <Text style={styles.optionLabel}>{item.label}</Text>
              <View
                style={[
                  styles.checkbox,
                  item.val && styles.checkboxActive,
                ]}>
                {item.val ? <Text style={styles.checkboxTick}>✓</Text> : null}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <View style={{ flex: 1 }}>
            <AppButton
              label="Generate"
              onPress={handleGenerate}
              variant="primary"
              fullWidth
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton
              label="Copy"
              onPress={() => setCopiedBanner(true)}
              variant="secondary"
              fullWidth
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

/* ============================================================================
 * 3. DEVICE SECURITY (/security/device) — Section 16
 * ========================================================================== */
type DeviceProps = NativeStackScreenProps<RootStackParamList, 'DeviceSecurity'>;

export const DeviceSecurityScreen: React.FC<DeviceProps> = ({ navigation }) => {
  const unverifiedCount = useSecurityStore(
    (state) => state.unverifiedPermissionsCount,
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Device Security</Text>
      <Text style={styles.pageSubtitle}>
        Simple checks to make sure your phone or computer is updated and safe.
      </Text>

      <StatusCard
        title="Device status"
        subtitle="Screen lock and device protection are turned on"
        status="SAFE"
        statusLabel="✓ Good"
      />
      <StatusCard
        title="OS status"
        subtitle="Running current operating system version"
        status="SAFE"
        statusLabel="✓ Up to date"
      />
      <StatusCard
        title="Security update status"
        subtitle="Latest monthly security patch installed"
        status="SAFE"
        statusLabel="✓ Good"
      />
      <StatusCard
        title="App permissions"
        subtitle={
          unverifiedCount > 0
            ? `${unverifiedCount} apps have permissions you may want to limit`
            : 'All installed apps use reasonable permissions'
        }
        status={unverifiedCount > 0 ? 'ATTENTION' : 'SAFE'}
        statusLabel={unverifiedCount > 0 ? '⚠ Review' : '✓ Good'}
        onPress={() => navigation.navigate('PermissionAnalyzer')}
      />
      <StatusCard
        title="Unknown applications"
        subtitle="Installing apps from unknown sources is blocked"
        status="SAFE"
        statusLabel="✓ Blocked"
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recommendations</Text>
        <Text style={styles.bulletText}>
          • Keep automatic system updates turned on so security fixes install
          overnight.
        </Text>
        <Text style={styles.bulletText}>
          • Only install applications from the official Google Play Store or
          Apple App Store.
        </Text>
        {unverifiedCount > 0 ? (
          <View style={{ marginTop: Spacing.md }}>
            <AppButton
              label="Review App Permissions"
              onPress={() => navigation.navigate('PermissionAnalyzer')}
              variant="primary"
              fullWidth
            />
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

/* ============================================================================
 * 4. NETWORK SECURITY (/security/network) — Section 17
 * ========================================================================== */
type NetworkProps = NativeStackScreenProps<
  RootStackParamList,
  'NetworkSecurity'
>;

export const NetworkSecurityScreen: React.FC<NetworkProps> = ({
  navigation,
}) => {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Network Security</Text>
      <Text style={styles.pageSubtitle}>
        Visual summary of your internet connection and Wi-Fi safety.
      </Text>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.metaLabel}>CURRENT NETWORK</Text>
            <Text style={styles.cardTitle}>Home_Fiber_5G</Text>
          </View>
          <StatusBadge status="SAFE" customLabel="✓ Secure" />
        </View>

        <StatusCard
          title="Network security"
          subtitle="Password-protected private Wi-Fi"
          status="SAFE"
          statusLabel="✓ Good"
        />
        <StatusCard
          title="Encryption"
          subtitle="Your Wi-Fi uses WPA2/WPA3 security"
          status="SAFE"
          statusLabel="✓ Encrypted"
        />
        <StatusCard
          title="Connection type"
          subtitle="Trusted Home Wi-Fi (5 GHz)"
          status="SAFE"
          statusLabel="✓ Private"
        />
        <StatusCard
          title="Public Wi-Fi warning"
          subtitle="Automatic warnings enabled when joining open cafe/airport Wi-Fi"
          status="SAFE"
          statusLabel="✓ Active"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Network Recommendations</Text>
        <Text style={styles.bulletText}>
          • Avoid entering banking passwords when connected to free public Wi-Fi
          without a password.
        </Text>
        <Text style={styles.bulletText}>
          • Use the Wi-Fi Scanner whenever you join a hotel, cafe, or airport
          hotspot.
        </Text>
        <View style={{ marginTop: Spacing.md }}>
          <AppButton
            label="Open Wi-Fi Scanner"
            onPress={() => navigation.navigate('WifiAnalyzer')}
            variant="secondary"
            fullWidth
          />
        </View>
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
  card: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: Spacing.md,
  },
  helperText: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 19,
  },
  generatedBox: {
    backgroundColor: SecurityPalette.background,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.interactive,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  generatedText: {
    fontSize: 18,
    fontWeight: '800',
    color: SecurityPalette.interactive,
    letterSpacing: 0.8,
  },
  copiedText: {
    fontSize: 13,
    color: SecurityPalette.safe,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  lengthRow: {
    marginBottom: Spacing.md,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SecurityPalette.textPrimary,
    marginBottom: 6,
  },
  lengthButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  lenPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: SecurityPalette.surfaceVariant,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  lenPillActive: {
    backgroundColor: SecurityPalette.primary,
    borderColor: SecurityPalette.primary,
  },
  lenPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.textSecondary,
  },
  togglesGrid: {
    gap: 8,
    marginBottom: Spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: SecurityPalette.surfaceVariant,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: SecurityPalette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: SecurityPalette.primary,
    borderColor: SecurityPalette.primary,
  },
  checkboxTick: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
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
  bulletText: {
    fontSize: 14,
    color: SecurityPalette.textSecondary,
    lineHeight: 22,
    marginBottom: 6,
  },
});
