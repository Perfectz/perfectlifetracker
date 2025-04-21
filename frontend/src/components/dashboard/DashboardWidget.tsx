import React, { memo } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Paper, 
  Box,
  LinearProgress
} from '@mui/material';
import { 
  Timeline as TimelineIcon, 
  FitnessCenter as FitnessCenterIcon,
  TrendingUp as TrendingUpIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';

// Define widget type for better type checking
interface DashboardWidgetItem {
  title: string;
  icon: React.ReactNode;
  value: string;
  description: string;
  progress: number;
  color?: string;
  ariaLabel?: string;
}

const DashboardWidget: React.FC = () => {
  // Placeholder data for the dashboard widgets
  const widgets: DashboardWidgetItem[] = [
    {
      title: 'Fitness Progress',
      icon: <FitnessCenterIcon fontSize="large" color="primary" />,
      value: '75%',
      description: 'Weekly goal progress',
      progress: 75,
      ariaLabel: 'Fitness progress is at 75% of weekly goal'
    },
    {
      title: 'Activity Streak',
      icon: <TimelineIcon fontSize="large" color="secondary" />,
      value: '5 days',
      description: 'Current streak',
      progress: 60,
      ariaLabel: 'Current activity streak is 5 days'
    },
    {
      title: 'Health Score',
      icon: <FavoriteIcon fontSize="large" style={{ color: '#e91e63' }} />,
      value: '82/100',
      description: 'Based on your activities',
      progress: 82,
      ariaLabel: 'Health score is 82 out of 100'
    },
    {
      title: 'Improvement',
      icon: <TrendingUpIcon fontSize="large" style={{ color: '#4caf50' }} />,
      value: '+12%',
      description: 'Since last month',
      progress: 65,
      ariaLabel: 'Improvement of 12% since last month'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Welcome to your health and fitness dashboard. Here&apos;s your progress at a glance.
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {widgets.map((widget, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper 
              elevation={3} 
              sx={{ 
                height: '100%', 
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Card 
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                aria-label={widget.ariaLabel}
                tabIndex={0}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    {widget.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {widget.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h4" component="div" gutterBottom>
                    {widget.value}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary">
                    {widget.description}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={widget.progress} 
                      sx={{ height: 8, borderRadius: 5 }}
                      aria-valuenow={widget.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      <Typography variant="body2" color="textSecondary" sx={{ mt: 4, textAlign: 'center' }}>
        This is a placeholder dashboard. Real data tracking features will be added soon.
      </Typography>
    </Box>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default memo(DashboardWidget); 