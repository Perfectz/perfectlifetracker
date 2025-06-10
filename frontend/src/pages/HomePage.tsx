/**
 * frontend/src/pages/HomePage.tsx
 * Home page component with feature showcase
 */
import React from 'react';
import { Typography, Box, Container, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import FitnessMetricsCard from '../components/FitnessMetricsCard';
import TasksCard from '../components/TasksCard';
import { Scale, CheckCircle, FitnessCenter, Assignment } from '@mui/icons-material';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ my: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Perfect LifeTracker Pro
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
          Start tracking your weight and managing your tasks today.
        </Typography>
        
        {/* Primary Action Buttons - Weight and Tasks */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/weight')}
            startIcon={<Scale />}
            sx={{ minWidth: 200, py: 1.5 }}
          >
            Weight Tracker
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/dashboard/tasks')}
            startIcon={<CheckCircle />}
            sx={{ minWidth: 200, py: 1.5 }}
          >
            Task Manager
          </Button>
        </Box>

        {/* Login/Dashboard Navigation */}
        {!isAuthenticated ? (
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Login to Access Dashboard
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Go to Dashboard
          </Button>
        )}
      </Box>

      {/* Primary Feature Cards - Weight and Tasks */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Start Your Journey
        </Typography>
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              p: 3, 
              border: '2px solid #1976d2', 
              borderRadius: 2, 
              textAlign: 'center',
              backgroundColor: '#f8f9fa',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <Box>
                <Scale sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Weight Tracker
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Track your weight progress with easy logging and visual charts. 
                  Set goals and monitor your fitness journey.
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/weight')}
                sx={{ mt: 2 }}
              >
                Start Tracking Weight
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              p: 3, 
              border: '2px solid #dc004e', 
              borderRadius: 2, 
              textAlign: 'center',
              backgroundColor: '#f8f9fa',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <Box>
                <Assignment sx={{ fontSize: 48, color: '#dc004e', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Task Manager
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Organize your daily tasks with priority management, 
                  due dates, and completion tracking.
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate('/dashboard/tasks')}
                sx={{ mt: 2 }}
              >
                Manage Your Tasks
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Live Preview Cards */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Quick Preview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FitnessMetricsCard steps={8423} goal={10000} progress={75} title="Weight & Fitness" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TasksCard title="Recent Tasks" />
          </Grid>
        </Grid>
      </Box>

      {/* Additional Features */}
      <Box sx={{ my: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 4 }}>
          More Features Coming Soon
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2 }}>
              <FitnessCenter sx={{ fontSize: 40, color: '#666', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Fitness Tracking
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Complete workout logging and progress analysis
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h1" sx={{ fontSize: 40, color: '#666', mb: 2 }}>
                📊
              </Typography>
              <Typography variant="h6" gutterBottom>
                Analytics & Insights
              </Typography>
              <Typography variant="body1" color="text.secondary">
                AI-powered insights and progress reports
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h1" sx={{ fontSize: 40, color: '#666', mb: 2 }}>
                🎯
              </Typography>
              <Typography variant="h6" gutterBottom>
                Goal Setting
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Set and track long-term goals with milestones
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;
