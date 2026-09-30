import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/security';
import { SecurityPalette } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'QrScanner'>;

export const QrScannerScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Surface style={styles.card} elevation={2}>
        <Text style={styles.badge}>MODULE 3 • QR VERIFICATION SANDBOX</Text>
        <Text style={styles.title}>Anti-Qishing QR Code Inspector</Text>
        <Text style={styles.description}>
          Decodes QR matrices and conducts automated pre-execution threat
          analysis before opening any website in your browser.
        </Text>
        <View style={styles.sandboxPreview}>
          <Text style={styles.sandboxText}>
            📷 Camera QR Sandbox Ready — Links are intercepted and verified
            before redirection.
          </Text>
        </View>
        <Button
          mode="contained"
          buttonColor={SecurityPalette.warning}
          textColor="#1A1000"
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
    color: SecurityPalette.warning,
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
  sandboxPreview: {
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: SecurityPalette.warning,
    marginBottom: 18,
  },
  sandboxText: {
    fontSize: 13,
    color: SecurityPalette.textPrimary,
    lineHeight: 19,
  },
});

export default QrScannerScreen;
