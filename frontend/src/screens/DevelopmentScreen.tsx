/**
 * frontend/src/screens/DevelopmentScreen.tsx
 * Personal development tracking screen (web version)
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
  School,
  Book,
  OndemandVideo,
  Timeline,
  Add as AddIcon,
  ShowChart as ShowChartIcon,
  BarChart as BarChartIcon // Placeholder for chart
} from '@mui/icons-material';
import { terraColors } from '../theme';
import type { StackScreenProps } from '@react-navigation/stack';
import type { MainTabParamList } from '../navigation/AppNavigator';

type DevelopmentScreenProps = StackScreenProps<MainTabParamList, 'Development'>;

// Placeholder for chart data
const chartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      data: [
        Math.random() * 10,
        Math.random() * 10,
        Math.random() * 10,
        Math.random() * 10,
        Math.random() * 10,
        Math.random() * 10
      ]
    }
  ]
};

const DevelopmentScreen: React.FC<DevelopmentScreenProps> = () => {
  const [selectedArea, setSelectedArea] = useState('learning');

  // Mock Recent Activities
  const recentActivities = [
    { id: '1', type: 'Course', title: 'Advanced React Patterns', duration: '2 hours', date: 'Today' },
    { id: '2', type: 'Book', title: 'Clean Code', duration: '45 min', date: 'Yesterday' },
    { id: '3', type: 'Project', title: 'Personal Portfolio', duration: '3 hours', date: '2 days ago' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'course': return <OndemandVideo />;
      case 'book': return <Book />;
      case 'project': return <School />;
      default: return <School />;
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
          Personal Development
        </Typography>

        {/* Development Area Summary */}
        <Paper sx={{ mb: 2, p: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, mb: 2 }}>
            Focus Areas
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={selectedArea} onChange={(e, newValue) => setSelectedArea(newValue)} aria-label="Development area filters">
              <Tab label="Learning" value="learning" />
              <Tab label="Skills" value="skills" />
              <Tab label="Projects" value="projects" />
            </Tabs>
          </Box>
          
          {/* Placeholder for Chart */}
          <Box sx={{ height: 220, bgcolor: '#f0f0f0', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <BarChartIcon sx={{ fontSize: 60, color: '#ccc' }} />
            <Typography variant="caption" sx={{ color: '#999' }}>Chart Placeholder</Typography>
          </Box>

          <Grid container spacing={2} sx={{ textAlign: 'center' }}>
            <Grid item xs={4}>
              <Typography variant="h6" sx={{ color: terraColors.maastrichtBlue }}>12</Typography>
              <Typography variant="body2" sx={{ color: terraColors.softTeal }}>Courses Completed</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" sx={{ color: terraColors.maastrichtBlue }}>5</Typography>
              <Typography variant="body2" sx={{ color: terraColors.softTeal }}>Active Projects</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" sx={{ color: terraColors.maastrichtBlue }}>25 hours</Typography>
              <Typography variant="body2" sx={{ color: terraColors.softTeal }}>Total Learning</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Recent Activity */}
        <Paper sx={{ mb: 2, borderRadius: 2, flexGrow: 1, overflow: 'auto' }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, p: 2, pb: 0 }}>
            Recent Development Activity
          </Typography>
          <List>
            {recentActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem>
                  <ListItemIcon>
                    {getActivityIcon(activity.type)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={activity.title}
                    secondary={`${activity.type} - ${activity.date}`}
                  />
                  <Typography variant="body2" sx={{ color: terraColors.maastrichtBlue }}>{activity.duration}</Typography>
                </ListItem>
                {index < recentActivities.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" size="small">View All Activity</Button>
          </Box>
        </Paper>

        {/* Learning Recommendations */}
        <Paper sx={{ p: 2, borderRadius: 2, backgroundColor: terraColors.paleViolet }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, mb: 1 }}>
            Personalized Recommendations
          </Typography>
          <Typography sx={{ color: terraColors.maastrichtBlue, mb: 1 }}>
            Based on your focus on React, consider exploring state management patterns with Redux or Context API.
          </Typography>
          <Button 
            variant="text" 
            sx={{ color: terraColors.tropicalRain, alignSelf: 'flex-start' }}
          >
            Get More Recommendations
          </Button>
        </Paper>
      </Container>

      {/* Floating Action Button */}
      <Fab 
        color="primary" 
        aria-label="log activity" 
        sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: terraColors.tropicalRain }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default DevelopmentScreen; 