import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, TextInput, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/security';
import { SecurityPalette } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'UrlScanner'>;

export const UrlScannerScreen: React.FC<Props> = ({ route, navigation }) => {
  const [urlInput, setUrlInput] = useState<string>(
    route.params?.initialUrl ?? '',
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Surface style={styles.card} elevation={2}>
        <Text style={styles.badge}>MODULE 2 • MALICIOUS URL SCANNER</Text>
        <Text style={styles.title}>Check a Web Link Before Tapping</Text>
        <Text style={styles.description}>
          Paste any suspicious SMS, email, or chat link below to inspect it
          against VirusTotal, Google Safe Browsing, and URLScan.io threat
          intelligence engines.
        </Text>

        <TextInput
          mode="outlined"
          label="Enter or paste URL (e.g., https://example.com)"
          value={urlInput}
          onChangeText={setUrlInput}
          autoCapitalize="none"
          keyboardType="url"
          style={styles.input}
          textColor={SecurityPalette.textPrimary}
          outlineColor={SecurityPalette.border}
          activeOutlineColor={SecurityPalette.primary}
        />

        <View style={styles.buttonRow}>
          <Button
            mode="contained"
            buttonColor={SecurityPalette.safe}
            textColor="#04140B"
            style={styles.button}
            onPress={() => {}}>
            Scan Link Reputation
          </Button>
          <Button
            mode="outlined"
            textColor={SecurityPalette.textSecondary}
            style={styles.button}
            onPress={() => navigation.goBack()}>
            Back to Dashboard
          </Button>
        </View>
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
    color: SecurityPalette.safe,
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
  input: {
    backgroundColor: SecurityPalette.surfaceVariant,
    marginBottom: 16,
  },
  buttonRow: {
    gap: 10,
  },
  button: {
    borderRadius: 10,
  },
});

export default UrlScannerScreen;
