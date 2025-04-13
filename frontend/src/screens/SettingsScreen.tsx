/**
 * frontend/src/screens/SettingsScreen.tsx
 * Application settings and preferences screen (web version)
 */
import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button
} from '@mui/material';
import { 
  Brightness4, 
  Brightness7, 
  CloudSync, 
  Backup, 
  Language, 
  CalendarToday, 
  AccessTime, 
  Security, 
  Info
} from '@mui/icons-material';
import { terraColors } from '../theme';
import type { StackScreenProps } from '@react-navigation/stack';
import type { MainTabParamList } from '../navigation/AppNavigator';

type SettingsScreenProps = StackScreenProps<MainTabParamList, 'Settings'>;

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [cloudSync, setCloudSync] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [language, setLanguage] = useState('en');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [weekStartDay, setWeekStartDay] = useState('Sunday');

  return (
    <Box sx={{ 
      flex: 1, 
      backgroundColor: terraColors.pearl,
      p: 2,
      overflow: 'auto'
    }}>
      <Container maxWidth="md">
        <Typography variant="h5" sx={{ color: terraColors.prussianBlue, mb: 3 }}>
          Settings
        </Typography>

        {/* Display Settings */}
        <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, mb: 1 }}>
            Display
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>{darkMode ? <Brightness4 /> : <Brightness7 />}</ListItemIcon>
              <ListItemText primary="Dark Mode" />
              <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
            </ListItem>
            <ListItem>
              <ListItemIcon><CloudSync /></ListItemIcon>
              <ListItemText primary="Compact Mode" />
              <Switch checked={compactMode} onChange={() => setCompactMode(!compactMode)} />
            </ListItem>
          </List>
        </Paper>

        {/* Data and Storage */}
        <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, mb: 1 }}>
            Data & Storage
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CloudSync /></ListItemIcon>
              <ListItemText primary="Cloud Sync" />
              <Switch checked={cloudSync} onChange={() => setCloudSync(!cloudSync)} />
            </ListItem>
            <ListItem>
              <ListItemIcon><Backup /></ListItemIcon>
              <ListItemText primary="Automatic Backup" />
              <Switch checked={autoBackup} onChange={() => setAutoBackup(!autoBackup)} />
            </ListItem>
            <ListItem>
              <Button variant="outlined" sx={{ mt: 1 }}>Manage Storage</Button>
            </ListItem>
          </List>
        </Paper>

        {/* Regional Settings */}
        <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, mb: 1 }}>
            Regional
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Language /></ListItemIcon>
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel id="language-select-label">Language</InputLabel>
                <Select
                  labelId="language-select-label"
                  value={language}
                  label="Language"
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem>
              <ListItemIcon><CalendarToday /></ListItemIcon>
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel id="date-format-select-label">Date Format</InputLabel>
                <Select
                  labelId="date-format-select-label"
                  value={dateFormat}
                  label="Date Format"
                  onChange={(e) => setDateFormat(e.target.value)}
                >
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem>
              <ListItemIcon><AccessTime /></ListItemIcon>
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel id="time-format-select-label">Time Format</InputLabel>
                <Select
                  labelId="time-format-select-label"
                  value={timeFormat}
                  label="Time Format"
                  onChange={(e) => setTimeFormat(e.target.value)}
                >
                  <MenuItem value="12h">12-hour</MenuItem>
                  <MenuItem value="24h">24-hour</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem>
              <ListItemIcon><CalendarToday /></ListItemIcon>
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel id="week-start-select-label">Week Starts On</InputLabel>
                <Select
                  labelId="week-start-select-label"
                  value={weekStartDay}
                  label="Week Starts On"
                  onChange={(e) => setWeekStartDay(e.target.value)}
                >
                  <MenuItem value="Sunday">Sunday</MenuItem>
                  <MenuItem value="Monday">Monday</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
          </List>
        </Paper>

        {/* Privacy and Security */}
        <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, mb: 1 }}>
            Privacy & Security
          </Typography>
          <List>
            <ListItem button>
              <ListItemIcon><Security /></ListItemIcon>
              <ListItemText primary="Change Password" />
            </ListItem>
            <ListItem button>
              <ListItemIcon><Security /></ListItemIcon>
              <ListItemText primary="Two-Factor Authentication" />
            </ListItem>
            <ListItem button>
              <ListItemIcon><Security /></ListItemIcon>
              <ListItemText primary="Privacy Policy" />
            </ListItem>
          </List>
        </Paper>

        {/* About */}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, mb: 1 }}>
            About
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info /></ListItemIcon>
              <ListItemText primary="App Version" secondary="1.0.0" />
            </ListItem>
            <ListItem button>
              <ListItemIcon><Info /></ListItemIcon>
              <ListItemText primary="Terms of Service" />
            </ListItem>
            <ListItem button>
              <ListItemIcon><Info /></ListItemIcon>
              <ListItemText primary="Help & Support" />
            </ListItem>
          </List>
        </Paper>
      </Container>
    </Box>
  );
};

export default SettingsScreen; 