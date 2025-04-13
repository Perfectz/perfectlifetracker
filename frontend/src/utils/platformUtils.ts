/**
 * frontend/src/utils/platformUtils.ts
 * Utility functions for platform detection and handling
 */

/**
 * Check if the code is running in a React Native environment
 */
export const isReactNative = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
};

/**
 * Check if the code is running on a mobile device or small screen
 */
export const isMobileDevice = (): boolean => {
  if (isReactNative()) {
    return true;
  }
  
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 768; // Common breakpoint for mobile devices
  }
  
  return false;
};

/**
 * Check if the platform is iOS
 */
export const isIOS = (): boolean => {
  if (isReactNative()) {
    return typeof navigator !== 'undefined' && navigator.platform.indexOf('iOS') !== -1;
  }
  
  if (typeof navigator !== 'undefined') {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  }
  
  return false;
};

/**
 * Check if the platform is Android
 */
export const isAndroid = (): boolean => {
  if (isReactNative()) {
    return typeof navigator !== 'undefined' && navigator.platform === 'Android';
  }
  
  if (typeof navigator !== 'undefined') {
    return /Android/.test(navigator.userAgent);
  }
  
  return false;
};

/**
 * Check if the app is running in a web environment
 */
export const isWeb = (): boolean => {
  return !isReactNative();
};

/**
 * Get platform-specific styles
 */
export const getPlatformStyles = <T extends object, U extends object>(
  webStyles: T,
  mobileStyles: U
): T | U => {
  return isWeb() ? webStyles : mobileStyles;
};

/**
 * Conditionally render components based on platform
 */
export const renderBasedOnPlatform = <T, U>(
  webComponent: T,
  mobileComponent: U
): T | U => {
  return isWeb() ? webComponent : mobileComponent;
}; 