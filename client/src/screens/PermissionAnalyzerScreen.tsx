import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/security';
import { SecurityPalette } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PermissionAnalyzer'>;

export const PermissionAnalyzerScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Surface style={styles.card} elevation={2}>
        <Text style={styles.badge}>MODULE 4 • APP PERMISSIONS AUDITOR</Text>
        <Text style={styles.title}>Installed App Permissions Audit</Text>
        <Text style={styles.description}>
          Audits installed applications for excessive access to your Camera,
          SMS, Microphone, Contacts, and Location, translating technical
          manifests into plain-language warnings.
        </Text>

        <View style={styles.auditItem}>
          <Text style={styles.appTitle}>Flashlight Ultra LED</Text>
          <Text style={styles.appWarning}>
            ⚠ Unverified access to Contacts & Microphone
          </Text>
        </View>

        <View style={styles.auditItem}>
          <Text style={styles.appTitle}>Quick PDF Scanner Free</Text>
          <Text style={styles.appWarning}>
            ⚠ Unverified access to Read SMS Messages
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
    color: '#F43F5E',
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
  auditItem: {
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: SecurityPalette.warning,
  },
  appTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 3,
  },
  appWarning: {
    fontSize: 12,
    color: SecurityPalette.warning,
    fontWeight: '600',
  },
});

export default PermissionAnalyzerScreen;
