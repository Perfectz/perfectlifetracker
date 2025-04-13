# Perfect LifeTracker Pro - Mobile App

This is the mobile application for Perfect LifeTracker Pro, allowing users to track fitness goals, personal development activities, and daily tasks from their mobile devices.

## Navigation Structure

The mobile app uses React Navigation with the following structure:

```
AppNavigator (Root)
│
├── AuthNavigator (When not authenticated)
│   ├── LoginScreen
│   └── RegisterScreen
│
└── MainNavigator (When authenticated - Tab Navigation)
    ├── HomeScreen
    ├── FitnessScreen
    ├── DevelopmentScreen
    ├── TasksScreen
    └── ProfileNavigator (Stack)
        ├── ProfileScreen
        └── SettingsScreen
```

## Setting Up Development Environment

1. **Install Expo CLI**:
   ```bash
   npm install -g expo-cli
   ```

2. **Install Dependencies**:
   ```bash
   cp mobile-package.json package.json
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm start
   ```

4. **Run on Device/Simulator**:
   - Scan the QR code with Expo Go app on your device
   - Press `a` to open in Android emulator
   - Press `i` to open in iOS simulator

## Mobile-Specific Features

- **Bottom Tab Navigation**: Easy access to main sections of the app
- **Stack Navigation**: For hierarchical screens like profile settings
- **Authentication Flow**: Conditional rendering based on auth state
- **Native UI Components**: Using React Native Paper for consistent UI
- **Responsive Charts**: For fitness and progress tracking
- **Offline Support**: Coming soon

## Theme and Styling

The app uses a custom Terra UI theme defined in `src/theme.tsx`, with the following color palette:

- **prussianBlue**: Primary dark blue (#003C5A)
- **tropicalRain**: Primary accent (#1976d2)
- **softTeal**: Secondary accent (#5BA5C2)
- **pearl**: Light background (#F5F7F7)
- **maastrichtBlue**: Dark text (#021E2F)

## Adding New Screens

1. Create a new screen component in the `screens` directory
2. Add the screen to the appropriate navigator in `navigation/AppNavigator.tsx`
3. Add any necessary types to the param lists

## Dependencies

- React Navigation for navigation
- React Native Paper for UI components
- Expo for easy development and building
- Azure MSAL for authentication
- React Native Chart Kit for data visualization

## Contributing

Please follow the project's coding standards and component patterns when adding to the mobile app. See the main project README for more details on contribution guidelines. 