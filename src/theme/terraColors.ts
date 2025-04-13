/**
 * src/theme/terraColors.ts
 * Terra color palette for frontend components
 */

import { colors } from './constants';

// Define Terra color palette using shared colors 
export const terraColors = {
  primary: colors.primary.main,
  secondary: colors.secondary.main,
  success: colors.success.main,
  info: colors.info.main,
  warning: colors.warning.main,
  error: colors.error.main,
  pearl: '#E8DDCB',
  softTeal: colors.info.main, // '#03A9F4',
  tropicalRain: '#00BCD4',
  prussianBlue: '#0D3B66',
  maastrichtBlue: '#033860',
  background: {
    light: colors.background.default,
    dark: colors.background.dark
  },
  text: {
    light: colors.text.primary,
    dark: colors.text.white
  }
}; 