/**
 * frontend/src/screens/SettingsScreen.tsx
 * Application settings and preferences screen (web version)
 */
import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  SelectChangeEvent,
  Typography,
  Info,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

import {
  SettingsSection,
  ToggleSetting,
  SelectSetting,
  ActionButton,
  settingsStyles,
  displaySettings,
  dataSettings,
  regionalSettings,
  securitySettings,
  aboutSettings,
} from './settings';

import type { StackScreenProps } from '@react-navigation/stack';
import type { MainTabParamList } from '../navigation/AppNavigator';

type SettingsScreenProps = StackScreenProps<MainTabParamList, 'Settings'>;

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  // Display Settings state
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  // Data Settings state
  const [cloudSync, setCloudSync] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  // Regional Settings state
  const [language, setLanguage] = useState('en');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [weekStartDay, setWeekStartDay] = useState('Sunday');

  // Toggle setting change handlers
  const handleToggleChange = useCallback((settingId: string, currentValue: boolean) => {
    switch (settingId) {
      case 'darkMode':
        setDarkMode(!currentValue);
        break;
      case 'compactMode':
        setCompactMode(!currentValue);
        break;
      case 'cloudSync':
        setCloudSync(!currentValue);
        break;
      case 'autoBackup':
        setAutoBackup(!currentValue);
        break;
    }
  }, []);

  // Select setting change handlers
  const handleSelectChange = useCallback((settingId: string, event: SelectChangeEvent) => {
    const value = event.target.value;
    switch (settingId) {
      case 'language':
        setLanguage(value);
        break;
      case 'dateFormat':
        setDateFormat(value);
        break;
      case 'timeFormat':
        setTimeFormat(value);
        break;
      case 'weekStartDay':
        setWeekStartDay(value);
        break;
    }
  }, []);

  // Action button handlers
  const handleActionClick = useCallback((actionId: string) => {
    // Implement action handlers
    console.log(`Action clicked: ${actionId}`);
  }, []);

  return (
    <Box sx={settingsStyles.container}>
      <Container maxWidth="md">
        <Typography variant="h5" sx={settingsStyles.pageTitle}>
          Settings
        </Typography>

        {/* Display Settings */}
        <SettingsSection title="Display">
          {displaySettings.map(setting => (
            <ToggleSetting
              key={setting.id}
              icon={setting.getIcon(setting.id === 'darkMode' ? darkMode : compactMode)}
              label={setting.label}
              checked={setting.id === 'darkMode' ? darkMode : compactMode}
              onChange={() =>
                handleToggleChange(setting.id, setting.id === 'darkMode' ? darkMode : compactMode)
              }
            />
          ))}
        </SettingsSection>

        {/* Data and Storage */}
        <SettingsSection title="Data & Storage">
          {dataSettings.map(setting => (
            <ToggleSetting
              key={setting.id}
              icon={setting.getIcon(setting.id === 'cloudSync' ? cloudSync : autoBackup)}
              label={setting.label}
              checked={setting.id === 'cloudSync' ? cloudSync : autoBackup}
              onChange={() =>
                handleToggleChange(setting.id, setting.id === 'cloudSync' ? cloudSync : autoBackup)
              }
            />
          ))}
          <ListItem>
            <Button variant="outlined" sx={settingsStyles.buttonContainer}>
              Manage Storage
            </Button>
          </ListItem>
        </SettingsSection>

        {/* Regional Settings */}
        <SettingsSection title="Regional">
          {regionalSettings.map((setting, index) => (
            <React.Fragment key={setting.id}>
              {index > 0 && <Divider sx={settingsStyles.divider} />}
              <SelectSetting
                icon={setting.icon}
                label={setting.label}
                labelId={setting.labelId}
                value={
                  setting.id === 'language'
                    ? language
                    : setting.id === 'dateFormat'
                      ? dateFormat
                      : setting.id === 'timeFormat'
                        ? timeFormat
                        : weekStartDay
                }
                options={setting.options}
                onChange={e => handleSelectChange(setting.id, e)}
              />
            </React.Fragment>
          ))}
        </SettingsSection>

        {/* Privacy and Security */}
        <SettingsSection title="Privacy & Security">
          {securitySettings.map(setting => (
            <ActionButton
              key={setting.id}
              icon={setting.icon}
              label={setting.label}
              onClick={() => handleActionClick(setting.id)}
            />
          ))}
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About" marginBottom={false}>
          <ListItem>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="App Version" secondary="1.0.0" />
          </ListItem>
          {aboutSettings.map(setting => (
            <ActionButton
              key={setting.id}
              icon={setting.icon}
              label={setting.label}
              onClick={() => handleActionClick(setting.id)}
            />
          ))}
        </SettingsSection>
      </Container>
    </Box>
  );
};

export default SettingsScreen;
