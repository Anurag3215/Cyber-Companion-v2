import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/security';
import { SecurityPalette } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'WifiAnalyzer'>;

export const WifiAnalyzerScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Surface style={styles.card} elevation={2}>
        <Text style={styles.badge}>MODULE 1 • WI-FI RISK ANALYZER</Text>
        <Text style={styles.title}>Wi-Fi Network Inspection</Text>
        <Text style={styles.description}>
          Evaluates SSID broadcast telemetry, encryption protocols (WPA2, WPA3,
          or Open networks), and signal profiles to prevent Man-in-the-Middle
          (MitM) interception on public hotspots.
        </Text>
        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>Current Connection: Home_Fiber_5G</Text>
          <Text style={styles.statusSafe}>
            ✓ Encrypted with WPA3-Personal (Safe for sensitive browsing)
          </Text>
        </View>
        <Button
          mode="contained"
          buttonColor={SecurityPalette.primary}
          textColor="#061224"
          onPress={() => navigation.goBack()}>
          Back to Dashboard
        </Button>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SecurityPalette.background },
  content: { padding: 18 },
  card: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    color: SecurityPalette.primary,
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: SecurityPalette.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  statusBox: {
    backgroundColor: SecurityPalette.surfaceVariant,
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
    borderLeftWidth: 3,
    borderLeftColor: SecurityPalette.safe,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
  },
  statusSafe: {
    fontSize: 13,
    color: SecurityPalette.safe,
    fontWeight: '600',
  },
});

export default WifiAnalyzerScreen;
