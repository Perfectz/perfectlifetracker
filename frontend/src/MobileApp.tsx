/**
 * frontend/src/MobileApp.tsx
 * Main entry point for the mobile app
 */
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';
import { terraPaperTheme, terraNavigationTheme } from './theme';
import { AuthProvider } from './contexts/AuthContext'; // You'll need to create this

/**
 * Main mobile application component that wraps the entire app
 * with necessary providers for theming, navigation, and authentication
 */
const MobileApp: React.FC = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={terraPaperTheme}>
        <AuthProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default MobileApp; 