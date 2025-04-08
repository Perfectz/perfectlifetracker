/**
 * frontend/src/theme.ts
 * Material UI theme configuration with light and dark mode options
 */
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Define theme options without the problematic component styling
const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: '#1976d2', // blue tone for primary
    },
    secondary: {
      main: '#9c27b0', // purple tone for secondary
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#121212',
    },
  },
  typography: {
    fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

// Create light and dark themes
const lightThemeBase = createTheme(getThemeOptions('light'));
const darkThemeBase = createTheme(getThemeOptions('dark'));

// Apply component styling to the created themes
export const lightTheme = createTheme(lightThemeBase, {
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: '8px 16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 16px 8px 16px',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 16,
          '&:last-child': {
            paddingBottom: 16,
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: {
            xs: 16,
            sm: 24,
          },
          paddingRight: {
            xs: 16,
            sm: 24,
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme(darkThemeBase, {
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: '8px 16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 16px 8px 16px',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 16,
          '&:last-child': {
            paddingBottom: 16,
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: {
            xs: 16,
            sm: 24,
          },
          paddingRight: {
            xs: 16,
            sm: 24,
          },
        },
      },
    },
  },
});

// Apply responsive font sizes
export const responsiveLightTheme = responsiveFontSizes(lightTheme);
export const responsiveDarkTheme = responsiveFontSizes(darkTheme); 