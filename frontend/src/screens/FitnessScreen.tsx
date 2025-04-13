/**
 * frontend/src/screens/FitnessScreen.tsx
 * Fitness tracking screen (web version)
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
  Tabs,
  Tab,
  Fab
} from '@mui/material';
import Grid from '../components/Grid';
import {
  FitnessCenter,
  DirectionsRun,
  LocalFireDepartment,
  Timeline,
  Add as AddIcon,
  ShowChart as ShowChartIcon,
  BarChart as BarChartIcon // Placeholder for chart
} from '@mui/icons-material';
import { terraColors } from '../theme';
import type { StackScreenProps } from '@react-navigation/stack';
import type { MainTabParamList } from '../navigation/AppNavigator';

type FitnessScreenProps = StackScreenProps<MainTabParamList, 'Fitness'>;

// Placeholder for chart data
const chartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      data: [
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100
      ]
    }
  ]
};

const FitnessScreen: React.FC<FitnessScreenProps> = () => {
  const [selectedMetric, setSelectedMetric] = useState('weight');

  // Mock Recent Activities
  const recentActivities = [
    { id: '1', type: 'Running', duration: '30 min', date: 'Today', calories: 350 },
    { id: '2', type: 'Weight Training', duration: '45 min', date: 'Yesterday', calories: 280 },
    { id: '3', type: 'Yoga', duration: '60 min', date: '2 days ago', calories: 150 },
  ];

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'running': return <DirectionsRun />;
      case 'weight training': return <FitnessCenter />;
      case 'yoga': return <LocalFireDepartment />; // Placeholder
      default: return <FitnessCenter />;
    }
  };

  return (
    <Box sx={{ 
      flex: 1, 
      backgroundColor: terraColors.pearl,
      p: 2,
      position: 'relative', 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" sx={{ color: terraColors.prussianBlue, mb: 2 }}>
          Fitness Tracker
        </Typography>

        {/* Fitness Summary Card */}
        <Paper sx={{ mb: 2, p: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, mb: 2 }}>
            Fitness Metrics
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={selectedMetric} onChange={(e, newValue) => setSelectedMetric(newValue)} aria-label="Fitness metric filters">
              <Tab label="Weight" value="weight" />
              <Tab label="Steps" value="steps" />
              <Tab label="Calories" value="calories" />
            </Tabs>
          </Box>
          
          {/* Placeholder for Chart */}
          <Box sx={{ height: 220, bgcolor: '#f0f0f0', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <BarChartIcon sx={{ fontSize: 60, color: '#ccc' }} />
            <Typography variant="caption" sx={{ color: '#999' }}>Chart Placeholder</Typography>
          </Box>

          <Grid container spacing={2} sx={{ textAlign: 'center' }}>
            <Grid item xs={4}>
              <Typography variant="h6" sx={{ color: terraColors.maastrichtBlue }}>75kg</Typography>
              <Typography variant="body2" sx={{ color: terraColors.softTeal }}>Current Weight</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" sx={{ color: terraColors.maastrichtBlue }}>8,500</Typography>
              <Typography variant="body2" sx={{ color: terraColors.softTeal }}>Today's Steps</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" sx={{ color: terraColors.maastrichtBlue }}>2,100</Typography>
              <Typography variant="body2" sx={{ color: terraColors.softTeal }}>Calories Burned</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Recent Activity */}
        <Paper sx={{ mb: 2, borderRadius: 2, flexGrow: 1, overflow: 'auto' }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, p: 2, pb: 0 }}>
            Recent Activity
          </Typography>
          <List>
            {recentActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem>
                  <ListItemIcon>
                    {getActivityIcon(activity.type)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={activity.type}
                    secondary={`${activity.duration} - ${activity.date}`}
                  />
                  <Typography variant="body2" sx={{ color: terraColors.maastrichtBlue }}>{`${activity.calories} kcal`}</Typography>
                </ListItem>
                {index < recentActivities.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" size="small">View All Activity</Button>
          </Box>
        </Paper>

        {/* AI Insights */}
        <Paper sx={{ p: 2, borderRadius: 2, backgroundColor: terraColors.paleViolet }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, mb: 1 }}>
            AI Fitness Insights
          </Typography>
          <Typography sx={{ color: terraColors.maastrichtBlue, mb: 1 }}>
            Based on your recent activity patterns, you're more likely to complete workouts in the morning. Consider scheduling your strength training sessions before 9 AM.
          </Typography>
          <Button 
            variant="text" 
            sx={{ color: terraColors.tropicalRain, alignSelf: 'flex-start' }}
          >
            Get More Insights
          </Button>
        </Paper>
      </Container>

      {/* Floating Action Button */}
      <Fab 
        color="primary" 
        aria-label="log workout" 
        sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: terraColors.tropicalRain }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default FitnessScreen; 