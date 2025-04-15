/**
 * frontend/src/screens/settings/styles.ts
 * Common styles for settings components
 */
import { SxProps } from '@mui/material';
import { terraColors } from '../../theme';

export const settingsStyles = {
  section: {
    mb: 3,
    p: 2,
    borderRadius: 2,
  },
  sectionTitle: {
    color: terraColors.prussianBlue,
    mb: 1,
  },
  container: {
    flex: 1,
    backgroundColor: terraColors.pearl,
    p: 2,
    overflow: 'auto',
  },
  pageTitle: {
    color: terraColors.prussianBlue,
    mb: 3,
  },
  divider: {
    my: 1,
  },
  buttonContainer: {
    mt: 1,
  },
  errorText: {
    color: 'error.main',
  },
} as const; 