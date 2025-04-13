/**
 * React Native Paper Theme Creator for Mobile Application
 */

import { colors, fontSizes, spacing } from './constants';

// Type declaration for the React Native Paper theme (simplified)
export interface PaperTheme {
  dark: boolean;
  colors: {
    primary: string;
    primaryContainer: string;
    secondary: string;
    secondaryContainer: string;
    tertiary: string;
    tertiaryContainer: string;
    surface: string;
    surfaceVariant: string;
    surfaceDisabled: string;
    background: string;
    error: string;
    errorContainer: string;
    onPrimary: string;
    onPrimaryContainer: string;
    onSecondary: string;
    onSecondaryContainer: string;
    onTertiary: string;
    onTertiaryContainer: string;
    onSurface: string;
    onSurfaceVariant: string;
    onSurfaceDisabled: string;
    onError: string;
    onErrorContainer: string;
    onBackground: string;
    outline: string;
    outlineVariant: string;
    inverseSurface: string;
    inverseOnSurface: string;
    inversePrimary: string;
    backdrop: string;
    elevation: {
      level0: string;
      level1: string;
      level2: string;
      level3: string;
      level4: string;
      level5: string;
    };
  };
  fonts: {
    regular: {
      fontFamily: string;
      fontWeight?: string;
    };
    medium: {
      fontFamily: string;
      fontWeight?: string;
    };
    light: {
      fontFamily: string;
      fontWeight?: string;
    };
    thin: {
      fontFamily: string;
      fontWeight?: string;
    };
  };
  animation: {
    scale: number;
  };
  spacing: typeof spacing;
  roundness: number;
}

export const createPaperTheme = (darkMode: boolean = false): PaperTheme => {
  const backgroundColor = darkMode ? colors.background.dark : colors.background.default;
  const textColor = darkMode ? colors.text.white : colors.text.primary;
  const surfaceColor = darkMode ? colors.grey[900] : colors.background.paper;

  return {
    dark: darkMode,
    colors: {
      primary: colors.primary.main,
      primaryContainer: colors.primary.light,
      secondary: colors.secondary.main,
      secondaryContainer: colors.secondary.light,
      tertiary: colors.info.main,
      tertiaryContainer: colors.info.light,
      surface: surfaceColor,
      surfaceVariant: darkMode ? colors.grey[800] : colors.grey[100],
      surfaceDisabled: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      background: backgroundColor,
      error: colors.error.main,
      errorContainer: colors.error.light,
      onPrimary: colors.primary.contrastText,
      onPrimaryContainer: darkMode ? colors.text.white : colors.primary.dark,
      onSecondary: colors.secondary.contrastText,
      onSecondaryContainer: darkMode ? colors.text.white : colors.secondary.dark,
      onTertiary: colors.info.contrastText,
      onTertiaryContainer: darkMode ? colors.text.white : colors.info.dark,
      onSurface: textColor,
      onSurfaceVariant: darkMode ? colors.grey[300] : colors.grey[700],
      onSurfaceDisabled: darkMode ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)',
      onError: colors.error.contrastText,
      onErrorContainer: darkMode ? colors.text.white : colors.error.dark,
      onBackground: textColor,
      outline: darkMode ? colors.grey[500] : colors.grey[400],
      outlineVariant: darkMode ? colors.grey[700] : colors.grey[200],
      inverseSurface: darkMode ? colors.background.paper : colors.grey[900],
      inverseOnSurface: darkMode ? colors.text.primary : colors.text.white,
      inversePrimary: colors.primary.light,
      backdrop: 'rgba(0, 0, 0, 0.5)',
      elevation: {
        level0: 'transparent',
        level1: darkMode ? '#1E1E1E' : '#FFFFFF',
        level2: darkMode ? '#232323' : '#F6F6F6',
        level3: darkMode ? '#272727' : '#EEEEEE',
        level4: darkMode ? '#2C2C2C' : '#E0E0E0',
        level5: darkMode ? '#313131' : '#D6D6D6',
      },
    },
    fonts: {
      regular: {
        fontFamily: 'Roboto',
        fontWeight: '400',
      },
      medium: {
        fontFamily: 'Roboto',
        fontWeight: '500',
      },
      light: {
        fontFamily: 'Roboto',
        fontWeight: '300',
      },
      thin: {
        fontFamily: 'Roboto',
        fontWeight: '100',
      },
    },
    animation: {
      scale: 1.0,
    },
    spacing: spacing,
    roundness: 4,
  };
}; 