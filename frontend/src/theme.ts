/**
 * frontend/src/theme.ts
 * Material UI theme configuration with light and dark mode options
 */
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const baseThemeOptions = {
  palette: {
    primary: {
      main: '#1976d2', // blue tone for primary
    },
    secondary: {
      main: '#9c27b0', // purple tone for secondary
    },
  },
  typography: {
    fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '3.5rem',
      },
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '3rem',
      },
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '1.25rem',
      },
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          paddingTop: 8,
          paddingBottom: 8,
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
};

// Create base themes with mode set
const baseLightTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    ...baseThemeOptions.palette,
    mode: 'light',
    background: { default: '#f5f5f5' },
  },
});

const baseDarkTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    ...baseThemeOptions.palette,
    mode: 'dark',
    background: { default: '#121212' },
  },
});

// Apply responsive font sizes
export const lightTheme = responsiveFontSizes(baseLightTheme);
export const darkTheme = responsiveFontSizes(baseDarkTheme); 