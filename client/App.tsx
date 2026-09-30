import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { CyberCompanionTheme, SecurityPalette } from './src/theme/theme';
import { RootNavigator } from './src/navigation/RootNavigator';

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
  return (
    <SafeAreaProvider>
      <PaperProvider theme={CyberCompanionTheme}>
        <NavigationContainer theme={NavigationDarkTheme}>
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
