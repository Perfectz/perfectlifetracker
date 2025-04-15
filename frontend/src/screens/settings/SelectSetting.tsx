/**
 * frontend/src/screens/settings/SelectSetting.tsx
 * Reusable select setting component with icon and select field
 */
import React from 'react';
import { 
  ListItem, 
  ListItemIcon, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SxProps,
  SelectChangeEvent
} from '@mui/material';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectSettingProps {
  icon: React.ReactNode;
  label: string;
  labelId: string;
  value: string;
  options: SelectOption[];
  onChange: (event: SelectChangeEvent) => void;
  sx?: SxProps;
}

export const SelectSetting: React.FC<SelectSettingProps> = React.memo(({
  icon,
  label,
  labelId,
  value,
  options,
  onChange,
  sx
}) => (
  <ListItem sx={sx}>
    <ListItemIcon>{icon}</ListItemIcon>
    <FormControl fullWidth sx={{ m: 1 }}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        value={value}
        label={label}
        onChange={onChange}
      >
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </ListItem>
));

SelectSetting.displayName = 'SelectSetting';

export default SelectSetting; 