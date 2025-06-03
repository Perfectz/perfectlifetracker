/**
 * frontend/src/utils/statusBarStub.ts
 * Stub implementation for expo-status-bar to work in web environment
 */
import React from 'react';

// Define the StatusBar component with no-op functionality for web
export const StatusBar = ({ style }: { style?: 'auto' | 'inverted' | 'light' | 'dark' }) => {
  // This is a no-op component for web - it doesn't do anything
  return null;
};

// Export the default StatusBar
export default StatusBar;
