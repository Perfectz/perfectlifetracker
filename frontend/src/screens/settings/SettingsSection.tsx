/**
 * frontend/src/screens/settings/SettingsSection.tsx
 * Reusable settings section component with title and content
 */
import React from 'react';
import { Paper, Typography, List, SxProps } from '@mui/material';
import { settingsStyles } from './styles';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  marginBottom?: boolean;
  paperSx?: SxProps;
  titleSx?: SxProps;
}

export const SettingsSection: React.FC<SettingsSectionProps> = React.memo(({ 
  title, 
  children, 
  marginBottom = true,
  paperSx,
  titleSx,
}) => (
  <Paper 
    sx={{ 
      ...settingsStyles.section,
      mb: marginBottom ? 3 : 0,
      ...paperSx 
    }}
  >
    <Typography variant="h6" sx={{ ...settingsStyles.sectionTitle, ...titleSx }}>
      {title}
    </Typography>
    <List>
      {children}
    </List>
  </Paper>
));

SettingsSection.displayName = 'SettingsSection';

export default SettingsSection; 