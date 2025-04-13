# Cross-Platform Development Guide for Perfect LifeTracker Pro

This guide explains how to develop and maintain the Perfect LifeTracker Pro application to ensure it works seamlessly on both desktop web browsers and mobile devices.

## Architecture Overview

The application uses a hybrid approach to support both platforms:

1. **Web Application**: Uses React with Material UI
2. **Mobile-Optimized Web**: Uses responsive design to adapt the web UI for mobile browsers
3. **Native Mobile Components**: Uses React Native components for mobile-specific features

## File Structure

```
frontend/src/
├── components/               # Shared UI components
│   ├── PlatformScreenWrapper.tsx  # Platform detection wrapper
│   └── ...
├── navigation/               # Navigation structure
│   ├── AppNavigator.tsx      # React Native navigation
│   ├── ResponsiveNavigator.tsx  # Responsive web navigation
│   └── ...
├── screens/                  # Screen components
│   ├── HomeScreen.tsx        # Mobile version
│   ├── PlatformHomeScreen.tsx  # Web version
│   ├── UniversalHomeScreen.tsx  # Universal adapter
│   └── ...
├── utils/
│   └── platformUtils.ts      # Platform detection utilities
├── App.tsx                   # Main application component
└── MobileApp.tsx             # Mobile app entry point
```

## Development Workflow

### Running the Web Application

```bash
# Start the web app in development mode
npm run dev

# Build for production
npm run build
```

### Running the Mobile App

```bash
# Install Expo CLI
npm install -g expo-cli

# Start the Expo development server
expo start

# Run on iOS simulator
expo run:ios

# Run on Android emulator
expo run:android
```

## Platform Detection

The application uses platform detection utilities to render the appropriate components:

```typescript
import { isWeb, isMobileDevice } from '../utils/platformUtils';

// In component
if (isWeb()) {
  // Render web-specific UI
} else {
  // Render mobile-specific UI
}
```

## Creating Cross-Platform Screens

1. **Create a mobile version** using React Native components
2. **Create a web version** using Material UI components
3. **Create a universal wrapper** using `PlatformScreenWrapper`:

```typescript
const UniversalScreen = () => (
  <PlatformScreenWrapper
    webComponent={<WebVersion />}
    mobileComponent={<MobileVersion />}
  />
);
```

## Navigation

1. **Web Navigation**: Uses React Router with responsive layout
2. **Mobile Navigation**: Uses React Navigation with bottom tabs

The `ResponsiveNavigator` component automatically selects the appropriate navigation based on the device and screen size.

## Styling Guidelines

1. **Web Styling**: Use Material UI's styling system with `sx` prop or styled components
2. **Mobile Styling**: Use StyleSheet API or styled components
3. **Shared Theme**: Both platforms use the same color palette and design tokens from `theme.tsx`

## Important Considerations

1. **Import Paths**: Be careful with import paths to avoid pulling in wrong dependencies
2. **Bundle Size**: Monitor bundle size as mobile components add additional code
3. **Testing**: Test on both platforms after making changes
4. **Responsive Design**: Make sure the web version works well at all screen sizes

## Troubleshooting

1. **Platform-specific imports**: If you see errors about missing modules, check that you're using the correct import for the platform
2. **Styling differences**: Some styles will behave differently between web and native - test both
3. **Navigation issues**: The navigation systems are different - ensure universal screen wrappers handle navigation consistently

## Recommended Tools

- **React DevTools**: For inspecting component hierarchies
- **Chrome DevTools**: For testing responsive designs
- **Expo DevTools**: For debugging React Native
- **Flipper**: For deeper React Native debugging 