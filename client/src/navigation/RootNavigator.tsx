import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/security';
import { SecurityPalette } from '../theme/theme';
import { DashboardScreen } from '../screens/DashboardScreen';
import { WifiAnalyzerScreen } from '../screens/WifiAnalyzerScreen';
import { UrlScannerScreen } from '../screens/UrlScannerScreen';
import { QrScannerScreen } from '../screens/QrScannerScreen';
import { PermissionAnalyzerScreen } from '../screens/PermissionAnalyzerScreen';
import { AwarenessCenterScreen } from '../screens/AwarenessCenterScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: SecurityPalette.surface,
        },
        headerTintColor: SecurityPalette.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
        },
        contentStyle: {
          backgroundColor: SecurityPalette.background,
        },
      }}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WifiAnalyzer"
        component={WifiAnalyzerScreen}
        options={{ title: 'Wi-Fi Risk Analyzer' }}
      />
      <Stack.Screen
        name="UrlScanner"
        component={UrlScannerScreen}
        options={{ title: 'Malicious URL Scanner' }}
      />
      <Stack.Screen
        name="QrScanner"
        component={QrScannerScreen}
        options={{ title: 'QR Verification Sandbox' }}
      />
      <Stack.Screen
        name="PermissionAnalyzer"
        component={PermissionAnalyzerScreen}
        options={{ title: 'App Permissions Auditor' }}
      />
      <Stack.Screen
        name="AwarenessCenter"
        component={AwarenessCenterScreen}
        options={{ title: 'Cyber Awareness Center' }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
