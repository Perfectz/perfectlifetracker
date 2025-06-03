/**
 * frontend/src/navigation/AppNavigator.tsx
 * Main navigation structure for mobile app
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth'; // Assuming you have this hook
import { Platform } from 'react-native';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SchoolIcon from '@mui/icons-material/School';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Screens
import HomeScreen from '../screens/HomeScreen';
import FitnessScreen from '../screens/FitnessScreen';
import DevelopmentScreen from '../screens/DevelopmentScreen';
import TasksScreen from '../screens/TasksScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Fitness: undefined;
  Development: undefined;
  Tasks: undefined;
  Profile: { userId: string } | undefined;
};

export type ProfileStackParamList = {
  ProfileMain: { userId: string } | undefined;
  Settings: undefined;
};

// Create navigators
const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// Auth navigation stack
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// Profile stack navigator (nested in tabs)
const ProfileNavigator = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen
      name="ProfileMain"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
  </ProfileStack.Navigator>
);

// Main tab navigation
const MainNavigator = () => (
  <MainTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        switch (route.name) {
          case 'Home':
            return <HomeIcon style={{ color, fontSize: size }} />;
          case 'Fitness':
            return <FitnessCenterIcon style={{ color, fontSize: size }} />;
          case 'Development':
            return <SchoolIcon style={{ color, fontSize: size }} />;
          case 'Tasks':
            return <ChecklistIcon style={{ color, fontSize: size }} />;
          case 'Profile':
            return <AccountCircleIcon style={{ color, fontSize: size }} />;
        }
      },
      tabBarActiveTintColor: '#1976d2',
      tabBarInactiveTintColor: 'gray',
      tabBarLabelStyle: { fontSize: 12 },
      headerShown: true,
    })}
  >
    <MainTab.Screen name="Home" component={HomeScreen} />
    <MainTab.Screen name="Fitness" component={FitnessScreen} />
    <MainTab.Screen name="Development" component={DevelopmentScreen} />
    <MainTab.Screen name="Tasks" component={TasksScreen} />
    <MainTab.Screen name="Profile" component={ProfileNavigator} options={{ headerShown: false }} />
  </MainTab.Navigator>
);

// Root navigator - handles auth state
const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <RootStack.Screen name="Main" component={MainNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
