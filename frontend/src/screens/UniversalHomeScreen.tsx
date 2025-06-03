/**
 * frontend/src/screens/UniversalHomeScreen.tsx
 * Universal home screen that works on both web and mobile platforms
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlatformScreenWrapper from '../components/PlatformScreenWrapper';

// Import platform-specific components
import HomeScreen from './HomeScreen'; // Mobile version
import PlatformHomeScreen from './PlatformHomeScreen'; // Web version

/**
 * Universal HomeScreen that handles platform detection and rendering
 * the appropriate component for either web or mobile
 */
const UniversalHomeScreen: React.FC = () => {
  const navigate = useNavigate();

  // Optional - Convert navigation prop for React Native screens
  const navigationAdapter = {
    navigate: (screenName: string, params?: Record<string, unknown>) => {
      navigate(`/${screenName.toLowerCase()}`, { state: params });
    },
  };

  return (
    <PlatformScreenWrapper
      webComponent={<PlatformHomeScreen />}
      mobileComponent={<HomeScreen navigation={navigationAdapter} />}
      fallbackComponent={<div>Loading dashboard...</div>}
    />
  );
};

export default UniversalHomeScreen;
