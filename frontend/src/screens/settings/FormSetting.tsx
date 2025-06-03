/**
 * frontend/src/screens/settings/FormSetting.tsx
 * Reusable form setting component with icon and form control
 */
import React from 'react';
import { ListItem, ListItemIcon, SxProps } from '@mui/material';

interface FormSettingProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  sx?: SxProps;
}

export const FormSetting: React.FC<FormSettingProps> = React.memo(({ icon, children, sx }) => (
  <ListItem sx={sx}>
    <ListItemIcon>{icon}</ListItemIcon>
    {children}
  </ListItem>
));

FormSetting.displayName = 'FormSetting';

export default FormSetting;
