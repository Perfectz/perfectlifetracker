/**
 * frontend/src/screens/ProfileScreen.tsx
 * User profile and account settings screen (web version)
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
  Divider,
  Button,
  Avatar,
  Switch,
  ListItemButton
} from '@mui/material';
import Grid from '../components/Grid';
import {
  AccountCircle,
  Edit,
  Notifications,
  Security,
  GetApp,
  ExitToApp,
  FitnessCenter,
  School,
  CheckCircle
} from '@mui/icons-material';
import { terraColors } from '../theme';
import type { StackScreenProps } from '@react-navigation/stack';
import type { MainTabParamList } from '../navigation/AppNavigator';

type ProfileScreenProps = StackScreenProps<MainTabParamList, 'Profile'>;

// Mock data for user profile
const mockUser = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  role: 'Pro User',
  joinDate: 'Joined: Jan 2023',
  profileImage: 'https://via.placeholder.com/80', // Placeholder image
  completedTasks: 125,
  workoutStreak: 15,
  learningHours: 42
};

// Mock recent activities
const mockRecentActivities = [
  { id: '1', type: 'workout', title: 'Completed 45 min strength training', date: 'Today, 8:30 AM' },
  { id: '2', type: 'task', title: 'Completed task: Finalize Q3 report', date: 'Yesterday, 4:15 PM' },
  { id: '3', type: 'learning', title: 'Watched video: Advanced TypeScript', date: '2 days ago, 11:00 AM' },
];

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const [user, setUser] = useState(mockUser);
  const [recentActivities, setRecentActivities] = useState(mockRecentActivities);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    report: false,
  });

  const handleNotificationChange = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workout': return <FitnessCenter />; 
      case 'task': return <CheckCircle />;
      case 'learning': return <School />;
      default: return <AccountCircle />;
    }
  };

  return (
    <Box sx={{ 
      flex: 1, 
      backgroundColor: terraColors.pearl,
      p: 2,
      overflow: 'auto'
    }}>
      <Container maxWidth="lg">
        <Typography variant="h5" sx={{ color: terraColors.prussianBlue, mb: 3 }}>
          Profile & Settings
        </Typography>

        {/* Profile Header Card */}
        <Paper sx={{ mb: 3, p: 3, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar src={user.profileImage} sx={{ width: 80, height: 80 }} />
            </Grid>
            <Grid item xs>
              <Typography variant="h6" sx={{ color: terraColors.prussianBlue }}>{user.name}</Typography>
              <Typography variant="body2" sx={{ color: terraColors.maastrichtBlue }}>{user.email}</Typography>
              <Typography variant="caption" sx={{ color: terraColors.softTeal }}>{user.role} | {user.joinDate}</Typography>
            </Grid>
            <Grid item>
              <Button variant="outlined" startIcon={<Edit />}>Edit Profile</Button>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2} sx={{ textAlign: 'center' }}>
            <Grid item xs={4}>
              <Typography variant="h6" sx={{ color: terraColors.maastrichtBlue }}>{user.completedTasks}</Typography>
              <Typography variant="body2" sx={{ color: terraColors.softTeal }}>Tasks Completed</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" sx={{ color: terraColors.maastrichtBlue }}>{user.workoutStreak}</Typography>
              <Typography variant="body2" sx={{ color: terraColors.softTeal }}>Workout Streak</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" sx={{ color: terraColors.maastrichtBlue }}>{user.learningHours} hrs</Typography>
              <Typography variant="body2" sx={{ color: terraColors.softTeal }}>Learning</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Recent Activity Card */}
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, p: 2, pb: 1 }}>
            Recent Activity
          </Typography>
          <List>
            {recentActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem>
                  <ListItemIcon>
                    {getActivityIcon(activity.type)}
                  </ListItemIcon>
                  <ListItemText primary={activity.title} secondary={activity.date} />
                </ListItem>
                {index < recentActivities.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" size="small">View All Activity</Button>
          </Box>
        </Paper>

        {/* Notification Settings Card */}
        <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, mb: 1 }}>
            Notification Settings
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Notifications /></ListItemIcon>
              <ListItemText primary="Email Notifications" />
              <Switch 
                checked={notificationSettings.email} 
                onChange={() => handleNotificationChange('email')}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Notifications /></ListItemIcon>
              <ListItemText primary="Push Notifications" />
              <Switch 
                checked={notificationSettings.push} 
                onChange={() => handleNotificationChange('push')}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Notifications /></ListItemIcon>
              <ListItemText primary="Weekly Report Email" />
              <Switch 
                checked={notificationSettings.report} 
                onChange={() => handleNotificationChange('report')}
              />
            </ListItem>
          </List>
        </Paper>

        {/* Account Actions Card */}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, mb: 1 }}>
            Account Actions
          </Typography>
          <List>
            <ListItemButton>
              <ListItemIcon><Security /></ListItemIcon>
              <ListItemText primary="Change Password" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon><GetApp /></ListItemIcon>
              <ListItemText primary="Download Your Data" />
            </ListItemButton>
            <ListItemButton sx={{ color: 'error.main' }}>
              <ListItemIcon><ExitToApp sx={{ color: 'error.main' }}/></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProfileScreen; 