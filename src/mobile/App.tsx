/**
 * src/mobile/App.tsx
 * Mobile app entry point using shared authentication
 */
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { RNMsalAuthWrapper } from '../services/mobile/RNMsalAuthProvider';
import { useAuth } from '../services/AuthContext';
import { RootNavigator } from '../navigation';

// Mobile app splash screen - shown during initial loading
const SplashScreen = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100%',
    backgroundColor: '#1976d2',
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  }}>
    Perfect LifeTracker Pro
  </div>
);

// Main app component
const AppContent = () => {
  const { user, isLoading } = useAuth();
  
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#115293" />
      <RootNavigator user={user} isLoading={isLoading} />
    </>
  );
};

// Root component that wraps everything with necessary providers
const App = () => {
  return (
    <SafeAreaProvider>
      <RNMsalAuthWrapper>
        <AppContent />
      </RNMsalAuthWrapper>
    </SafeAreaProvider>
  );
};

export default App; 