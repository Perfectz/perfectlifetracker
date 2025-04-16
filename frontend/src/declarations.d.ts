// frontend/src/declarations.d.ts

// Provide basic module declarations to bypass problematic library .d.ts files
declare module 'expo-status-bar';
declare module 'react-native-paper';
declare module 'react-native-safe-area-context';
declare module 'react-native';

declare module '@react-navigation/native' {
  // Add minimal necessary exports if known, otherwise leave empty
  export const NavigationContainer: any;
  // Add other exports used by your app if necessary
}

declare module '@react-navigation/bottom-tabs' {
  // Add minimal necessary exports if known, otherwise leave empty
  export function createBottomTabNavigator(): any;
  // Add other exports used by your app if necessary
}

declare module '@react-navigation/stack' {
  // Add minimal necessary exports if known, otherwise leave empty
  export function createStackNavigator(): any;
  // Add other exports used by your app if necessary
} 