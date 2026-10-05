import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/security';
import { SecurityPalette, Spacing, Radius } from '../theme/theme';
import { useSecurityStore } from '../store/useSecurityStore';
import { ConfirmModal } from '../design-system/components';
import { ShieldCheckIcon } from '../components/SecurityIcons';

// Auth Screens
import {
  SplashScreen,
  WelcomeScreen,
  SignInScreen,
  SignUpScreen,
  ForgotPasswordScreen,
  VerifyScreen,
} from '../screens/AuthScreens';

// Main Feature Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { UrlScannerScreen } from '../screens/UrlScannerScreen';
import { QrScannerScreen } from '../screens/QrScannerScreen';
import { WifiAnalyzerScreen } from '../screens/WifiAnalyzerScreen';
import {
  ScanHubScreen,
  ScanHistoryScreen,
} from '../screens/ScanHubAndHistoryScreens';
import {
  SecurityCenterScreen,
  PasswordSecurityScreen,
  DeviceSecurityScreen,
  NetworkSecurityScreen,
} from '../screens/SecurityCenterScreens';
import { PermissionAnalyzerScreen } from '../screens/PermissionAnalyzerScreen';
import { AwarenessCenterScreen } from '../screens/AwarenessCenterScreen';
import {
  LessonDetailScreen,
  SecurityQuizScreen,
  ThreatAlertsScreen,
  ThreatDetailScreen,
  SecurityNewsScreen,
} from '../screens/LearnAndThreatsScreens';
import {
  ActivityTimelineScreen,
  CyberAssistantScreen,
  ProfileScreen,
  SettingsScreen,
} from '../screens/AssistantAndAccountScreens';
import { ReportsScreen } from '../screens/ReportsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface SidebarGroup {
  readonly group: string;
  readonly items: readonly {
    readonly label: string;
    readonly route: keyof RootStackParamList;
  }[];
}

const WEB_SIDEBAR_GROUPS: readonly SidebarGroup[] = [
  {
    group: 'DASHBOARD',
    items: [{ label: 'Dashboard', route: 'Dashboard' }],
  },
  {
    group: 'SCANNERS',
    items: [
      { label: 'Wi-Fi Analyzer', route: 'WifiAnalyzer' },
      { label: 'URL Scanner', route: 'UrlScanner' },
      { label: 'QR Scanner', route: 'QrScanner' },
      { label: 'Permission Analyzer', route: 'PermissionAnalyzer' },
    ],
  },
  {
    group: 'SECURITY ENGINE',
    items: [
      { label: 'Security Score', route: 'SecurityCenter' },
      { label: 'Threat Intelligence', route: 'ThreatAlerts' },
      { label: 'Alerts & History', route: 'ScanHistory' },
      { label: 'Advanced Security', route: 'DeviceSecurity' },
    ],
  },
  {
    group: 'LEARNING & REPORTS',
    items: [
      { label: 'Cyber Awareness', route: 'AwarenessCenter' },
      { label: 'Reports', route: 'Reports' },
      { label: 'Cyber AI', route: 'CyberAssistant' },
    ],
  },
  {
    group: 'ACCOUNT',
    items: [
      { label: 'Profile', route: 'Profile' },
      { label: 'Settings', route: 'Settings' },
    ],
  },
];

const ANDROID_BOTTOM_TABS: readonly {
  readonly label: 'Home' | 'Scan' | 'Alerts' | 'Learn' | 'Settings';
  readonly route: keyof RootStackParamList;
}[] = [
  { label: 'Home', route: 'Dashboard' },
  { label: 'Scan', route: 'ScanHub' },
  { label: 'Alerts', route: 'ThreatAlerts' },
  { label: 'Learn', route: 'AwarenessCenter' },
  { label: 'Settings', route: 'Settings' },
];

export const RootNavigator: React.FC = () => {
  const isAuthenticated = useSecurityStore((state) => state.isAuthenticated);
  const user = useSecurityStore((state) => state.user);
  const score = useSecurityStore((state) => state.score);
  const signOut = useSecurityStore((state) => state.signOut);

  const { width } = useWindowDimensions();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [activeRoute, setActiveRoute] =
    useState<keyof RootStackParamList>('Dashboard');
  const [tabletSidebarOpen, setTabletSidebarOpen] = useState(false);
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);

  const isDesktop = width >= 960;
  const isTablet = width >= 680 && width < 960;
  const isMobile = width < 680;

  const navigateTo = (route: keyof RootStackParamList) => {
    setActiveRoute(route);
    setTabletSidebarOpen(false);
    navigation.navigate(route as never);
  };

  if (!isAuthenticated) {
    return (
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: { backgroundColor: SecurityPalette.surface },
          headerTintColor: SecurityPalette.textPrimary,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: SecurityPalette.background },
        }}>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ title: 'Sign In' }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ title: 'Create Account' }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ title: 'Forgot Password' }}
        />
        <Stack.Screen
          name="Verify"
          component={VerifyScreen}
          options={{ title: 'Verification' }}
        />
      </Stack.Navigator>
    );
  }

  const renderSidebarContent = () => (
    <View style={styles.sidebarContainer}>
      <View style={styles.sidebarBrandHeader}>
        <View style={styles.sidebarLogoBox}>
          <ShieldCheckIcon size={22} color={SecurityPalette.primary} />
        </View>
        <View>
          <Text style={styles.sidebarBrandTitle}>CYBER COMPANION</Text>
          <Text style={styles.sidebarBrandTag}>Stay Safe. Simply.</Text>
        </View>
      </View>

      <ScrollView
        style={styles.sidebarScroll}
        showsVerticalScrollIndicator={false}>
        {WEB_SIDEBAR_GROUPS.map((grp) => (
          <View key={grp.group} style={styles.sidebarGroup}>
            <Text style={styles.sidebarGroupLabel}>{grp.group}</Text>
            {grp.items.map((item) => {
              const isSelected = activeRoute === item.route;
              return (
                <Pressable
                  key={item.route}
                  onPress={() => navigateTo(item.route)}
                  style={[
                    styles.sidebarItem,
                    isSelected && styles.sidebarItemActive,
                  ]}>
                  <Text
                    style={[
                      styles.sidebarItemText,
                      isSelected && styles.sidebarItemTextActive,
                    ]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Bottom User + Security Score + Sign Out */}
      <View style={styles.sidebarFooter}>
        <View style={styles.sidebarUserRow}>
          <View style={styles.sidebarAvatar}>
            <Text style={styles.sidebarAvatarText}>{user.avatarInitials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sidebarUserName} numberOfLines={1}>
              {user.fullName}
            </Text>
            <Text style={styles.sidebarScoreText}>
              Security Score: {score}/100
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => setSignOutModalVisible(true)}
          style={styles.sidebarSignOutBtn}>
          <Text style={styles.sidebarSignOutText}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.shellRoot}>
      <View style={styles.shellBody}>
        {/* Desktop Persistent Left Sidebar */}
        {isDesktop ? renderSidebarContent() : null}

        {/* Tablet Collapsible Sidebar */}
        {isTablet && tabletSidebarOpen ? renderSidebarContent() : null}

        {/* Main Content Stack */}
        <View style={styles.mainContentArea}>
          {isTablet ? (
            <View style={styles.tabletTopBar}>
              <Pressable
                onPress={() => setTabletSidebarOpen((p) => !p)}
                style={styles.menuToggleBtn}>
                <Text style={styles.menuToggleText}>
                  {tabletSidebarOpen ? '✕ Close Menu' : '☰ Menu'}
                </Text>
              </Pressable>
              <Text style={styles.tabletBrandTitle}>
                Cyber Companion — Stay Safe. Simply.
              </Text>
            </View>
          ) : null}

          <View style={{ flex: 1 }}>
            <Stack.Navigator
              initialRouteName="Dashboard"
              screenOptions={{
                headerStyle: { backgroundColor: SecurityPalette.surface },
                headerTintColor: SecurityPalette.textPrimary,
                headerTitleStyle: { fontWeight: '700', fontSize: 17 },
                contentStyle: { backgroundColor: SecurityPalette.background },
              }}>
              <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: 'Home Dashboard' }}
              />
              <Stack.Screen
                name="ScanHub"
                component={ScanHubScreen}
                options={{ title: 'Scan' }}
              />
              <Stack.Screen
                name="UrlScanner"
                component={UrlScannerScreen}
                options={{ title: 'Check Website' }}
              />
              <Stack.Screen
                name="QrScanner"
                component={QrScannerScreen}
                options={{ title: 'QR Scanner' }}
              />
              <Stack.Screen
                name="WifiAnalyzer"
                component={WifiAnalyzerScreen}
                options={{ title: 'Wi-Fi Security' }}
              />
              <Stack.Screen
                name="ScanHistory"
                component={ScanHistoryScreen}
                options={{ title: 'Scan History' }}
              />
              <Stack.Screen
                name="SecurityCenter"
                component={SecurityCenterScreen}
                options={{ title: 'Security Center' }}
              />
              <Stack.Screen
                name="PasswordSecurity"
                component={PasswordSecurityScreen}
                options={{ title: 'Password Security' }}
              />
              <Stack.Screen
                name="DeviceSecurity"
                component={DeviceSecurityScreen}
                options={{ title: 'Device Security' }}
              />
              <Stack.Screen
                name="NetworkSecurity"
                component={NetworkSecurityScreen}
                options={{ title: 'Network Security' }}
              />
              <Stack.Screen
                name="PermissionAnalyzer"
                component={PermissionAnalyzerScreen}
                options={{ title: 'Privacy Center' }}
              />
              <Stack.Screen
                name="AwarenessCenter"
                component={AwarenessCenterScreen}
                options={{ title: 'Learn & Awareness' }}
              />
              <Stack.Screen
                name="LessonDetail"
                component={LessonDetailScreen}
                options={{ title: 'Lesson' }}
              />
              <Stack.Screen
                name="SecurityQuiz"
                component={SecurityQuizScreen}
                options={{ title: 'Security Quiz' }}
              />
              <Stack.Screen
                name="SecurityNews"
                component={SecurityNewsScreen}
                options={{ title: 'Security News' }}
              />
              <Stack.Screen
                name="ThreatAlerts"
                component={ThreatAlertsScreen}
                options={{ title: 'Threat Alerts' }}
              />
              <Stack.Screen
                name="ThreatDetail"
                component={ThreatDetailScreen}
                options={{ title: 'Alert Details' }}
              />
              <Stack.Screen
                name="ActivityTimeline"
                component={ActivityTimelineScreen}
                options={{ title: 'Activity' }}
              />
              <Stack.Screen
                name="CyberAssistant"
                component={CyberAssistantScreen}
                options={{ title: 'Cyber Assistant' }}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
              />
              <Stack.Screen
                name="Reports"
                component={ReportsScreen}
                options={{ title: 'Security Reports' }}
              />
            </Stack.Navigator>
          </View>

          {/* Android / Mobile Bottom Navigation: Home | Scan | Security | Learn | Profile */}
          {isMobile ? (
            <View style={styles.bottomNavBar}>
              {ANDROID_BOTTOM_TABS.map((tab) => {
                const isSelected = activeRoute === tab.route;
                return (
                  <Pressable
                    key={tab.label}
                    onPress={() => navigateTo(tab.route)}
                    style={styles.bottomTabButton}>
                    <View
                      style={[
                        styles.bottomTabIndicator,
                        isSelected && styles.bottomTabIndicatorActive,
                      ]}
                    />
                    <Text
                      style={[
                        styles.bottomTabLabel,
                        isSelected && styles.bottomTabLabelActive,
                      ]}>
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      </View>

      <ConfirmModal
        visible={signOutModalVisible}
        title="Sign out of Cyber Companion?"
        message="You will be returned to the Sign In screen."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        isDanger
        onCancel={() => setSignOutModalVisible(false)}
        onConfirm={() => {
          setSignOutModalVisible(false);
          signOut();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  shellRoot: {
    flex: 1,
    backgroundColor: SecurityPalette.background,
  },
  shellBody: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarContainer: {
    width: 256,
    backgroundColor: SecurityPalette.surface,
    borderRightWidth: 1,
    borderRightColor: SecurityPalette.border,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    justifyContent: 'space-between',
  },
  sidebarBrandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    marginBottom: Spacing.lg,
  },
  sidebarLogoBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: SecurityPalette.primarySoft,
    borderWidth: 1,
    borderColor: SecurityPalette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarBrandTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    letterSpacing: 0.6,
  },
  sidebarBrandTag: {
    fontSize: 11,
    color: SecurityPalette.interactive,
    fontWeight: '600',
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarGroup: {
    marginBottom: Spacing.md,
  },
  sidebarGroupLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: SecurityPalette.textMuted,
    letterSpacing: 1,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  sidebarItem: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radius.sm,
    marginBottom: 2,
  },
  sidebarItemActive: {
    backgroundColor: SecurityPalette.primarySoft,
  },
  sidebarItemText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: SecurityPalette.textSecondary,
  },
  sidebarItemTextActive: {
    color: SecurityPalette.primary,
    fontWeight: '700',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: SecurityPalette.border,
    paddingTop: Spacing.md,
    gap: 10,
  },
  sidebarUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 6,
  },
  sidebarAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SecurityPalette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: SecurityPalette.primary,
  },
  sidebarUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
  },
  sidebarScoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: SecurityPalette.safe,
  },
  sidebarSignOutBtn: {
    backgroundColor: SecurityPalette.criticalSoft,
    borderColor: SecurityPalette.critical,
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  sidebarSignOutText: {
    fontSize: 12,
    fontWeight: '700',
    color: SecurityPalette.critical,
  },
  mainContentArea: {
    flex: 1,
    backgroundColor: SecurityPalette.background,
  },
  tabletTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: SecurityPalette.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: SecurityPalette.border,
  },
  menuToggleBtn: {
    backgroundColor: SecurityPalette.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  menuToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
  },
  tabletBrandTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
  },
  bottomNavBar: {
    flexDirection: 'row',
    backgroundColor: SecurityPalette.surface,
    borderTopWidth: 1,
    borderTopColor: SecurityPalette.border,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  bottomTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    minHeight: 48,
  },
  bottomTabIndicator: {
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  bottomTabIndicatorActive: {
    backgroundColor: SecurityPalette.primary,
  },
  bottomTabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: SecurityPalette.textSecondary,
  },
  bottomTabLabelActive: {
    color: SecurityPalette.primary,
    fontWeight: '800',
  },
});

export default RootNavigator;
