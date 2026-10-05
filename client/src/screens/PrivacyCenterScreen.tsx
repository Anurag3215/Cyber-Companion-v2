import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/security';
import { SecurityPalette, Spacing, Radius } from '../theme/theme';
import {
  ShieldCheckIcon,
  LockSlidersIcon,
  CameraQrIcon,
  WifiSignalIcon,
} from '../components/SecurityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyCenter'>;

interface PrivacyPermissionItem {
  id: string;
  name: string;
  purpose: string;
  required: boolean;
  active: boolean;
  icon: (color: string) => React.ReactNode;
}

export const PrivacyCenterScreen: React.FC<Props> = ({ navigation }) => {
  const [cameraPerm, setCameraPerm] = useState(false);
  const [networkPerm, setNetworkPerm] = useState(true);
  const [appsPerm, setAppsPerm] = useState(true);
  const [notifPerm, setNotifPerm] = useState(false);

  const permissions: PrivacyPermissionItem[] = [
    {
      id: 'camera',
      name: 'Camera',
      purpose: 'Used for QR code scanning',
      required: true,
      active: cameraPerm,
      icon: (c) => <CameraQrIcon size={20} color={c} />,
    },
    {
      id: 'network',
      name: 'Network Information',
      purpose: 'Used for Wi-Fi analysis',
      required: true,
      active: networkPerm,
      icon: (c) => <WifiSignalIcon size={20} color={c} />,
    },
    {
      id: 'apps',
      name: 'Installed Apps',
      purpose: 'Used for permission analysis',
      required: true,
      active: appsPerm,
      icon: (c) => <LockSlidersIcon size={20} color={c} />,
    },
    {
      id: 'notifications',
      name: 'Notifications',
      purpose: 'Used for alerts and updates',
      required: false,
      active: notifPerm,
      icon: (c) => <ShieldCheckIcon size={20} color={c} />,
    },
  ];

  const handleToggle = async (id: string, currentVal: boolean) => {
    const newVal = !currentVal;
    if (id === 'camera') {
      if (Platform.OS === 'android' && newVal) {
        const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        setCameraPerm(res === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setCameraPerm(newVal);
      }
    } else if (id === 'network') {
      setNetworkPerm(newVal);
    } else if (id === 'apps') {
      setAppsPerm(newVal);
    } else if (id === 'notifications') {
      if (Platform.OS === 'android' && Platform.Version >= 33 && newVal) {
        const res = await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS' as any);
        setNotifPerm(res === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setNotifPerm(newVal);
      }
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topHeader}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Center</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroBlock}>
          <Text style={styles.heroTitle}>Privacy Center</Text>
          <Text style={styles.heroSubtitle}>Your data, your control.</Text>
        </View>

        <View style={styles.cardList}>
          {permissions.map((item) => (
            <View key={item.id} style={styles.permCard}>
              <View style={styles.permIconBox}>
                {item.icon(SecurityPalette.primary)}
              </View>

              <View style={styles.permInfo}>
                <View style={styles.permNameRow}>
                  <Text style={styles.permName}>{item.name}</Text>
                  <View
                    style={[
                      styles.tagBadge,
                      item.required ? styles.tagRequired : styles.tagOptional,
                    ]}>
                    <Text
                      style={[
                        styles.tagText,
                        item.required ? styles.tagTextRequired : styles.tagTextOptional,
                      ]}>
                      {item.required ? 'Required' : 'Optional'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.permPurpose}>{item.purpose}</Text>
              </View>

              <Switch
                value={item.active}
                onValueChange={() => handleToggle(item.id, item.active)}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={item.active ? SecurityPalette.primary : '#F3F4F6'}
              />
            </View>
          ))}
        </View>

        <View style={styles.footerNotice}>
          <ShieldCheckIcon size={16} color="#6B7280" />
          <Text style={styles.footerText}>Your data stays on your device</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: '#0F172A',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  heroBlock: {
    marginBottom: Spacing.xl,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#64748B',
  },
  cardList: {
    gap: Spacing.md,
  },
  permCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  permIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  permInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  permNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  permName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  tagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagRequired: {
    backgroundColor: '#EFF6FF',
  },
  tagOptional: {
    backgroundColor: '#F1F5F9',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagTextRequired: {
    color: '#2563EB',
  },
  tagTextOptional: {
    color: '#64748B',
  },
  permPurpose: {
    fontSize: 13,
    color: '#64748B',
  },
  footerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.xxl,
    paddingVertical: Spacing.md,
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
});
