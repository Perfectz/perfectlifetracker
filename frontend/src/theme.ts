import { createTheme } from '@mui/material/styles';

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
    // You can customize font sizes, weights, etc. here
  },
};

export const lightTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    ...baseThemeOptions.palette,
    mode: 'light',
    background: { default: '#f5f5f5' },
  },
});

export const darkTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    ...baseThemeOptions.palette,
    mode: 'dark',
    background: { default: '#121212' },
    // You might adjust primary/secondary for better contrast in dark mode if needed
  },
}); 