/**
 * src/navigation/index.tsx
 * Navigation setup for mobile apps
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthUser } from '../services/authConfig';

// Define the navigation types
export type RootStackParamList = {
  // Authentication screens
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
  
  // Main app screens
  Home: undefined;
  Dashboard: undefined;
  Details: { id?: string };
  Profile: undefined;
  Settings: undefined;
};

// Create navigators
const Stack = createNativeStackNavigator<RootStackParamList>();

// Auth stack navigator
export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginPlaceholder} />
      <Stack.Screen name="Register" component={RegisterPlaceholder} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordPlaceholder} />
    </Stack.Navigator>
  );
};

// Main app stack navigator
export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1976d2',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '500',
        },
      }}
    >
      <Stack.Screen name="Home" component={HomePlaceholder} options={{ title: 'Home' }} />
      <Stack.Screen name="Dashboard" component={DashboardPlaceholder} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="Details" component={DetailsPlaceholder} options={{ title: 'Details' }} />
      <Stack.Screen name="Profile" component={ProfilePlaceholder} options={{ title: 'Profile' }} />
      <Stack.Screen name="Settings" component={SettingsPlaceholder} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
};

// Root navigator that switches between auth and main app
interface RootNavigatorProps {
  user: AuthUser | null;
  isLoading: boolean;
}

export const RootNavigator: React.FC<RootNavigatorProps> = ({ user, isLoading }) => {
  if (isLoading) {
    // Show a loading screen
    return <LoadingPlaceholder />;
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

// Placeholder components until real screens are implemented
const LoadingPlaceholder: React.FC = () => <PlaceholderScreen text="Loading..." />;
const LoginPlaceholder: React.FC = () => <PlaceholderScreen text="Login Screen" />;
const RegisterPlaceholder: React.FC = () => <PlaceholderScreen text="Register Screen" />;
const ResetPasswordPlaceholder: React.FC = () => <PlaceholderScreen text="Reset Password Screen" />;
const HomePlaceholder: React.FC = () => <PlaceholderScreen text="Home Screen" />;
const DashboardPlaceholder: React.FC = () => <PlaceholderScreen text="Dashboard Screen" />;
const DetailsPlaceholder: React.FC = () => <PlaceholderScreen text="Details Screen" />;
const ProfilePlaceholder: React.FC = () => <PlaceholderScreen text="Profile Screen" />;
const SettingsPlaceholder: React.FC = () => <PlaceholderScreen text="Settings Screen" />;

// Generic placeholder screen
interface PlaceholderScreenProps {
  text: string;
}

const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ text }) => {
  // In a real app, you would use react-native components
  // For this example, we'll use a generic div for simplicity
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%',
      padding: 20
    }}>
      <span>{text}</span>
    </div>
  );
}; 