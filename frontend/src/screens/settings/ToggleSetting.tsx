/**
 * frontend/src/screens/settings/ToggleSetting.tsx
 * Reusable toggle setting component with icon, label and switch
 */
import React from 'react';
import { 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Switch,
  SxProps
} from '@mui/material';

interface ToggleSettingProps {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: () => void;
  secondary?: string;
  disabled?: boolean;
  sx?: SxProps;
}

export const ToggleSetting: React.FC<ToggleSettingProps> = React.memo(({
  icon,
  label,
  checked,
  onChange,
  secondary,
  disabled = false,
  sx
}) => (
  <ListItem sx={sx}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={label} secondary={secondary} />
    <Switch 
      checked={checked} 
      onChange={onChange} 
      disabled={disabled}
    />
  </ListItem>
));

ToggleSetting.displayName = 'ToggleSetting';

export default ToggleSetting; 