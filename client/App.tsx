import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { CyberCompanionTheme, SecurityPalette, Spacing, Radius } from './src/theme/theme';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useSecurityStore } from './src/store/useSecurityStore';

const NavigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: SecurityPalette.primary,
    background: SecurityPalette.background,
    card: SecurityPalette.surface,
    text: SecurityPalette.textPrimary,
    border: SecurityPalette.border,
    notification: SecurityPalette.critical,
  },
};

function App(): React.JSX.Element {
  const biometricEnabled = useSecurityStore((state) => state.biometricEnabled);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [networkBanner, setNetworkBanner] = useState<string | null>(null);

  // Background Network Monitor
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.type === 'wifi') {
        const details = state.details as unknown as { ssid?: string | null };
        const ssid = details?.ssid && details.ssid !== '<unknown ssid>' ? details.ssid : null;
        if (
          ssid &&
          (ssid.toLowerCase().includes('free') ||
            ssid.toLowerCase().includes('open') ||
            ssid.toLowerCase().includes('guest'))
        ) {
          setNetworkBanner(`⚠️ Insecure Wi-Fi: Connected to '${ssid}'. Avoid entering sensitive passwords.`);
        }
      } else {
        setNetworkBanner(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const shouldLock = biometricEnabled && !isUnlocked;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={CyberCompanionTheme}>
        <StatusBar barStyle="light-content" />
        {shouldLock ? (
          <View style={styles.lockContainer}>
            <View style={styles.lockIconBox}>
              <Text style={styles.lockIconText}>🛡️</Text>
            </View>
            <Text style={styles.lockTitle}>Cyber Companion Locked</Text>
            <Text style={styles.lockSubtitle}>
              Biometric & Device Passcode Protection Active
            </Text>
            <Text style={styles.lockDesc}>
              This session is guarded against unauthorized physical access to device audit data and threat intelligence.
            </Text>
            <Pressable
              onPress={() => setIsUnlocked(true)}
              style={styles.unlockBtn}>
              <Text style={styles.unlockBtnText}>Unlock Session 🔓</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {networkBanner ? (
              <View style={styles.insecureBanner}>
                <Text style={styles.insecureBannerText}>{networkBanner}</Text>
                <Pressable onPress={() => setNetworkBanner(null)} style={styles.dismissBtn}>
                  <Text style={styles.dismissText}>✕</Text>
                </Pressable>
              </View>
            ) : null}
            <NavigationContainer theme={NavigationDarkTheme}>
              <RootNavigator />
            </NavigationContainer>
          </>
        )}
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  lockContainer: {
    flex: 1,
    backgroundColor: SecurityPalette.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  lockIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  lockIconText: {
    fontSize: 38,
  },
  lockTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  lockSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SecurityPalette.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  lockDesc: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: Spacing.xxl,
    maxWidth: 300,
  },
  unlockBtn: {
    backgroundColor: SecurityPalette.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Radius.md,
    elevation: 3,
  },
  unlockBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  insecureBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    zIndex: 999,
  },
  insecureBannerText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  dismissBtn: {
    padding: 4,
  },
  dismissText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default App;
