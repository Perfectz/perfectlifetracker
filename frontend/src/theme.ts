/**
 * frontend/src/theme.ts
 * Material UI theme configuration with Terra color palette and responsive options
 */
import { createTheme, responsiveFontSizes, ThemeOptions } from '@mui/material/styles';

// Terra Color Palette
const terraPalette = {
  pearl: '#E8DDCB',        // background
  softTeal: '#70A9A1',     // borders, accents
  tropicalRain: '#036564', // interactive elements
  prussianBlue: '#033649', // app bars, important text
  maastrichtBlue: '#031634' // primary text
};

// Define theme options with Terra palette
const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: terraPalette.tropicalRain, // Tropical Rain Forest for primary
    },
    secondary: {
      main: terraPalette.softTeal, // Soft Teal for secondary
    },
    background: {
      default: mode === 'light' ? terraPalette.pearl : '#121212',
      paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
    },
    text: {
      primary: terraPalette.maastrichtBlue,
      secondary: terraPalette.prussianBlue,
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
          border: `1px solid ${terraPalette.softTeal}20`, // Light border with soft teal
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 16px 8px 16px',
          color: terraPalette.prussianBlue,
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
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: terraPalette.prussianBlue,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: terraPalette.pearl,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: `${terraPalette.tropicalRain}20`,
            color: terraPalette.tropicalRain,
            '&:hover': {
              backgroundColor: `${terraPalette.tropicalRain}30`,
            },
          },
          '&:hover': {
            backgroundColor: `${terraPalette.softTeal}20`,
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          backgroundColor: terraPalette.tropicalRain,
          color: terraPalette.pearl,
          '&:hover': {
            backgroundColor: terraPalette.prussianBlue,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: `${terraPalette.pearl}`,
          borderRadius: 5,
          height: 10,
        },
        bar: {
          backgroundColor: terraPalette.tropicalRain,
          borderRadius: 5,
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
          border: `1px solid ${terraPalette.softTeal}30`,
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
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: terraPalette.maastrichtBlue,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#121212',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: `${terraPalette.tropicalRain}40`,
            color: terraPalette.softTeal,
            '&:hover': {
              backgroundColor: `${terraPalette.tropicalRain}50`,
            },
          },
          '&:hover': {
            backgroundColor: `${terraPalette.softTeal}30`,
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          backgroundColor: terraPalette.tropicalRain,
          color: terraPalette.pearl,
          '&:hover': {
            backgroundColor: terraPalette.prussianBlue,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: '#2A2A2A',
          borderRadius: 5,
          height: 10,
        },
        bar: {
          backgroundColor: terraPalette.softTeal,
          borderRadius: 5,
        },
      },
    },
  },
});

// Export Terra palette for use in other components
export const terraColors = terraPalette;

// Apply responsive font sizes
export const responsiveLightTheme = responsiveFontSizes(lightTheme);
export const responsiveDarkTheme = responsiveFontSizes(darkTheme); 