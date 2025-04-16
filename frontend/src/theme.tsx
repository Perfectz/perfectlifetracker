/**
 * frontend/src/theme.tsx
 * Theme definition for the web application using Material UI
 */
import React, { createContext, useState, useMemo, useContext, ReactNode } from 'react';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Define the custom color palette
export const terraColors = {
  prussianBlue: '#003C5A', // Primary dark blue
  maastrichtBlue: '#021E2F', // Darker blue for text
  tropicalRain: '#1976d2', // Primary accent color (MUI primary blue)
  softTeal: '#5BA5C2', // Secondary accent
  pearl: '#F5F7F7', // Light background color
  white: '#FFFFFF',
  error: '#B00020',
  success: '#4CAF50',
  warning: '#FB8C00',
  info: '#2196F3',
  disabled: '#BDBDBD',
  outline: '#E0E0E0',
};

// Theme context interface
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Create theme context
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook to use the theme context
export const useThemeMode = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};

// Theme provider props
interface ThemeModeProviderProps {
  children: ReactNode;
}

/**
 * Creates a Material UI theme based on the terraColors palette.
 * 
 * @param isDarkMode - Whether to create a dark theme or light theme
 * @returns A Material UI Theme object
 */
export const createMuiTheme = (isDarkMode: boolean) => {
  let theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: terraColors.tropicalRain,
      },
      secondary: {
        main: terraColors.softTeal,
      },
      error: {
        main: terraColors.error,
      },
      warning: {
        main: terraColors.warning,
      },
      info: {
        main: terraColors.info,
      },
      success: {
        main: terraColors.success,
      },
      background: {
        default: isDarkMode ? terraColors.maastrichtBlue : terraColors.pearl,
        paper: isDarkMode ? terraColors.prussianBlue : terraColors.white,
      },
      text: {
        primary: isDarkMode ? terraColors.pearl : terraColors.maastrichtBlue,
        secondary: isDarkMode ? terraColors.softTeal : terraColors.prussianBlue,
        disabled: terraColors.disabled,
      },
      divider: terraColors.outline,
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      h5: {
        fontWeight: 'bold',
      },
      h6: {
        fontWeight: 'bold',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none', // Prevent uppercase buttons
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none', // Ensure paper components don't have default gradients
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: terraColors.prussianBlue,
            color: terraColors.white,
          },
        },
      },
    },
  });

  // Make typography responsive
  theme = responsiveFontSizes(theme);

  return theme;
};

/**
 * Theme mode provider component that manages light/dark mode
 */
export const ThemeModeProvider: React.FC<ThemeModeProviderProps> = ({ children }) => {
  // Try to get the theme preference from localStorage
  const getInitialMode = (): boolean => {
    try {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' ? true : false;
    } catch (error) {
      // If localStorage is not available, use system preference or default to light
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialMode);

  // Toggle theme mode
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      // Save to localStorage
      try {
        localStorage.setItem('darkMode', String(newMode));
      } catch (error) {
        console.error('Could not save theme preference to localStorage:', error);
      }
      return newMode;
    });
  };

  // Create the theme based on the current mode
  const theme = useMemo(() => createMuiTheme(isDarkMode), [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

// Export a default light theme for standalone usage
export const defaultTheme = createMuiTheme(false);

export default defaultTheme; 