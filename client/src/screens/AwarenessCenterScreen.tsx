import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, CyberAwarenessTip } from '../types/security';
import { SecurityPalette } from '../theme/theme';
import cyberTipsData from '../data/cyberTips.json';

type Props = NativeStackScreenProps<RootStackParamList, 'AwarenessCenter'>;

const typedTips = cyberTipsData as readonly CyberAwarenessTip[];

export const AwarenessCenterScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Cyber Awareness Center</Text>
      <Text style={styles.headerSubtitle}>
        Bite-sized, plain-language digital hygiene guides to help you stay safe
        every day.
      </Text>

      {typedTips.map((tip) => (
        <Surface key={tip.id} style={styles.tipCard} elevation={1}>
          <Text style={styles.category}>{tip.category.replace('_', ' ')}</Text>
          <Text style={styles.title}>{tip.title}</Text>
          <Text style={styles.body}>{tip.body}</Text>
          <View style={styles.takeaway}>
            <Text style={styles.takeawayText}>✓ {tip.actionableTakeaway}</Text>
          </View>
        </Surface>
      ))}

      <Button
        mode="contained"
        buttonColor={SecurityPalette.primary}
        textColor="#061224"
        onPress={() => navigation.goBack()}>
        Back to Dashboard
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SecurityPalette.background },
  content: { padding: 18, paddingBottom: 32 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    marginBottom: 16,
    lineHeight: 19,
  },
  tipCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: 14,
  },
  category: {
    fontSize: 10,
    fontWeight: '800',
    color: SecurityPalette.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 6,
  },
  body: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  takeaway: {
    backgroundColor: SecurityPalette.surfaceVariant,
    padding: 10,
    borderRadius: 8,
  },
  takeawayText: {
    fontSize: 12,
    color: SecurityPalette.safe,
    fontWeight: '600',
  },
});

export default AwarenessCenterScreen;
