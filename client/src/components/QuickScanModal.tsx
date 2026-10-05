import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  WifiSignalIcon,
  GlobeLinkIcon,
  QrMatrixIcon,
  LockSlidersIcon,
} from './SecurityIcons';
import { Radius, Spacing } from '../theme/theme';

interface QuickScanModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAction: (route: 'WifiAnalyzer' | 'UrlScanner' | 'QrScanner' | 'PermissionAnalyzer') => void;
}

export const QuickScanModal: React.FC<QuickScanModalProps> = ({
  visible,
  onClose,
  onSelectAction,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.dragHandle} />
              <Text style={styles.sheetTitle}>Quick Scan</Text>

              <View style={styles.optionsList}>
                {/* 1. CHECK WI-FI */}
                <Pressable
                  onPress={() => {
                    onClose();
                    onSelectAction('WifiAnalyzer');
                  }}
                  style={styles.optionRow}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <WifiSignalIcon size={22} color="#10B981" />
                  </View>
                  <View style={styles.optionTexts}>
                    <Text style={styles.optionTitle}>Check Wi-Fi</Text>
                    <Text style={styles.optionSub}>Check network security</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>

                {/* 2. CHECK URL */}
                <Pressable
                  onPress={() => {
                    onClose();
                    onSelectAction('UrlScanner');
                  }}
                  style={styles.optionRow}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <GlobeLinkIcon size={22} color="#3B82F6" />
                  </View>
                  <View style={styles.optionTexts}>
                    <Text style={styles.optionTitle}>Check URL</Text>
                    <Text style={styles.optionSub}>Scan a link for threats</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>

                {/* 3. SCAN QR */}
                <Pressable
                  onPress={() => {
                    onClose();
                    onSelectAction('QrScanner');
                  }}
                  style={styles.optionRow}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                    <QrMatrixIcon size={22} color="#06B6D4" />
                  </View>
                  <View style={styles.optionTexts}>
                    <Text style={styles.optionTitle}>Scan QR</Text>
                    <Text style={styles.optionSub}>Analyze QR code</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>

                {/* 4. CHECK APPS */}
                <Pressable
                  onPress={() => {
                    onClose();
                    onSelectAction('PermissionAnalyzer');
                  }}
                  style={styles.optionRow}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                    <LockSlidersIcon size={22} color="#F59E0B" />
                  </View>
                  <View style={styles.optionTexts}>
                    <Text style={styles.optionTitle}>Check Apps</Text>
                    <Text style={styles.optionSub}>View app permissions</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              </View>

              {/* CANCEL BUTTON */}
              <Pressable onPress={onClose} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.72)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0F1E36',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: '#1E2E4A',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.lg,
  },
  optionsList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162846',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#24375A',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  optionTexts: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  optionSub: {
    fontSize: 13,
    color: '#94A3B8',
  },
  chevron: {
    fontSize: 22,
    color: '#64748B',
    paddingHorizontal: 4,
  },
  cancelBtn: {
    backgroundColor: '#1E2E4A',
    borderRadius: Radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
  },
});
