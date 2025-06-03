/**
 * frontend/src/screens/settings/settingsData.tsx
 * Data-driven settings configuration
 */
import React from 'react';
import {
  Brightness4,
  Brightness7,
  CloudSync,
  Backup,
  Language,
  CalendarToday,
  AccessTime,
  Security,
  Info,
} from '@mui/icons-material';

export interface SelectOption {
  value: string;
  label: string;
}

export interface ToggleSettingConfig {
  id: string;
  label: string;
  getIcon: (value: boolean) => React.ReactElement;
}

export interface SelectSettingConfig {
  id: string;
  label: string;
  icon: React.ReactElement;
  labelId: string;
  options: SelectOption[];
}

export interface ActionSettingConfig {
  id: string;
  label: string;
  icon: React.ReactElement;
  secondary?: string;
  errorStyle?: boolean;
}

// Display settings configuration
export const displaySettings: ToggleSettingConfig[] = [
  {
    id: 'darkMode',
    label: 'Dark Mode',
    getIcon: value => (value ? <Brightness4 /> : <Brightness7 />),
  },
  {
    id: 'compactMode',
    label: 'Compact Mode',
    getIcon: () => <CloudSync />,
  },
];

// Data settings configuration
export const dataSettings: ToggleSettingConfig[] = [
  {
    id: 'cloudSync',
    label: 'Cloud Sync',
    getIcon: () => <CloudSync />,
  },
  {
    id: 'autoBackup',
    label: 'Automatic Backup',
    getIcon: () => <Backup />,
  },
];

// Regional settings configuration
export const regionalSettings: SelectSettingConfig[] = [
  {
    id: 'language',
    label: 'Language',
    icon: <Language />,
    labelId: 'language-select-label',
    options: [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' },
      { value: 'fr', label: 'Français' },
    ],
  },
  {
    id: 'dateFormat',
    label: 'Date Format',
    icon: <CalendarToday />,
    labelId: 'date-format-select-label',
    options: [
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    ],
  },
  {
    id: 'timeFormat',
    label: 'Time Format',
    icon: <AccessTime />,
    labelId: 'time-format-select-label',
    options: [
      { value: '12h', label: '12-hour' },
      { value: '24h', label: '24-hour' },
    ],
  },
  {
    id: 'weekStartDay',
    label: 'Week Starts On',
    icon: <CalendarToday />,
    labelId: 'week-start-select-label',
    options: [
      { value: 'Sunday', label: 'Sunday' },
      { value: 'Monday', label: 'Monday' },
    ],
  },
];

// Security settings configuration
export const securitySettings: ActionSettingConfig[] = [
  {
    id: 'changePassword',
    label: 'Change Password',
    icon: <Security />,
  },
  {
    id: 'twoFactor',
    label: 'Two-Factor Authentication',
    icon: <Security />,
  },
  {
    id: 'privacyPolicy',
    label: 'Privacy Policy',
    icon: <Security />,
  },
];

// About settings configuration
export const aboutSettings: ActionSettingConfig[] = [
  {
    id: 'termsOfService',
    label: 'Terms of Service',
    icon: <Info />,
  },
  {
    id: 'helpSupport',
    label: 'Help & Support',
    icon: <Info />,
  },
];
