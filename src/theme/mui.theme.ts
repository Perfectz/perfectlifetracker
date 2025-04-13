/**
 * Material UI Theme Creator for Web Application
 */

import { colors, fontSizes, spacing as spacingValues, zIndex } from './constants';
import { createTheme as createMuiThemeBase, ThemeOptions } from '@mui/material/styles';

export const createMuiTheme = (darkMode: boolean = false) => {
  const backgroundColor = darkMode ? colors.background.dark : colors.background.default;
  const textPrimary = darkMode ? colors.text.white : colors.text.primary;
  const textSecondary = darkMode ? 'rgba(255, 255, 255, 0.7)' : colors.text.secondary;

  const themeOptions: ThemeOptions = {
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: colors.primary.main,
        light: colors.primary.light,
        dark: colors.primary.dark,
        contrastText: colors.primary.contrastText,
      },
      secondary: {
        main: colors.secondary.main,
        light: colors.secondary.light,
        dark: colors.secondary.dark,
        contrastText: colors.secondary.contrastText,
      },
      error: {
        main: colors.error.main,
        light: colors.error.light,
        dark: colors.error.dark,
        contrastText: colors.error.contrastText,
      },
      warning: {
        main: colors.warning.main,
        light: colors.warning.light,
        dark: colors.warning.dark,
        contrastText: colors.warning.contrastText,
      },
      info: {
        main: colors.info.main,
        light: colors.info.light,
        dark: colors.info.dark,
        contrastText: colors.info.contrastText,
      },
      success: {
        main: colors.success.main,
        light: colors.success.light,
        dark: colors.success.dark,
        contrastText: colors.success.contrastText,
      },
      background: {
        default: backgroundColor,
        paper: darkMode ? colors.grey[900] : colors.background.paper,
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
        disabled: darkMode ? 'rgba(255, 255, 255, 0.5)' : colors.text.disabled,
      },
      grey: colors.grey,
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14,
      h1: {
        fontSize: fontSizes.h1 / 16 + 'rem',
        fontWeight: 300,
        letterSpacing: '-0.01562em',
      },
      h2: {
        fontSize: fontSizes.h2 / 16 + 'rem',
        fontWeight: 300,
        letterSpacing: '-0.00833em',
      },
      h3: {
        fontSize: fontSizes.h3 / 16 + 'rem',
        fontWeight: 400,
        letterSpacing: '0em',
      },
      h4: {
        fontSize: fontSizes.h4 / 16 + 'rem',
        fontWeight: 400,
        letterSpacing: '0.00735em',
      },
      h5: {
        fontSize: fontSizes.h5 / 16 + 'rem',
        fontWeight: 400,
        letterSpacing: '0em',
      },
      h6: {
        fontSize: fontSizes.h6 / 16 + 'rem',
        fontWeight: 500,
        letterSpacing: '0.0075em',
      },
      subtitle1: {
        fontSize: fontSizes.subtitle1 / 16 + 'rem',
        fontWeight: 400,
        letterSpacing: '0.00938em',
      },
      subtitle2: {
        fontSize: fontSizes.subtitle2 / 16 + 'rem',
        fontWeight: 500,
        letterSpacing: '0.00714em',
      },
      body1: {
        fontSize: fontSizes.body1 / 16 + 'rem',
        fontWeight: 400,
        letterSpacing: '0.00938em',
      },
      body2: {
        fontSize: fontSizes.body2 / 16 + 'rem',
        fontWeight: 400,
        letterSpacing: '0.01071em',
      },
      button: {
        fontSize: fontSizes.button / 16 + 'rem',
        fontWeight: 500,
        letterSpacing: '0.02857em',
        textTransform: 'uppercase',
      },
      caption: {
        fontSize: fontSizes.caption / 16 + 'rem',
        fontWeight: 400,
        letterSpacing: '0.03333em',
      },
      overline: {
        fontSize: fontSizes.overline / 16 + 'rem',
        fontWeight: 400,
        letterSpacing: '0.08333em',
        textTransform: 'uppercase',
      },
    },
    spacing: spacingValues.unit,
    zIndex: {
      mobileStepper: zIndex.mobileStepper,
      speedDial: zIndex.speedDial,
      appBar: zIndex.appBar,
      drawer: zIndex.drawer,
      modal: zIndex.modal,
      snackbar: zIndex.snackbar,
      tooltip: zIndex.tooltip,
    },
  };

  return createMuiThemeBase(themeOptions);
}; 