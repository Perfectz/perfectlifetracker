/**
 * frontend/src/screens/settings/ActionButton.tsx
 * Reusable action button component for settings
 */
import React from 'react';
import { 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  SxProps
} from '@mui/material';

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  secondary?: string;
  sx?: SxProps;
}

export const ActionButton: React.FC<ActionButtonProps> = React.memo(({
  icon,
  label,
  onClick,
  secondary,
  sx
}) => (
  <ListItemButton onClick={onClick} sx={sx}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={label} secondary={secondary} />
  </ListItemButton>
));

ActionButton.displayName = 'ActionButton';

export default ActionButton; 