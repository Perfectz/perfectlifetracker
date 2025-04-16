/**
 * frontend/src/pages/HomePage.tsx
 * Home page component with feature showcase
 */
import React from 'react';
import { Typography, Box, Container, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/MockAuthContext';
import FitnessMetricsCard from '../components/FitnessMetricsCard';
import DevelopmentCard from '../components/DevelopmentCard';
import TasksCard from '../components/TasksCard';
import GoalsCard from '../components/GoalsCard';

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
          Your AI-powered personal assistant for tracking fitness goals, personal development, and daily tasks.
        </Typography>
        {!isAuthenticated && (
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Get Started
          </Button>
        )}
      </Box>

      {/* Feature Cards */}
      <Grid container spacing={3} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <FitnessMetricsCard 
            steps={8423} 
            goal={10000} 
            progress={75} 
            title="Track Your Fitness" 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DevelopmentCard title="Personal Development" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TasksCard title="Smart Task Management" />
        </Grid>
        <Grid item xs={12} md={6}>
          <GoalsCard title="Goal Setting & Tracking" />
        </Grid>
      </Grid>

      {/* Features Section */}
      <Box sx={{ my: 8 }}>
        <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Key Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              AI-Powered Insights
            </Typography>
            <Typography variant="body1">
              Get personalized recommendations and insights based on your activity patterns and goals.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Comprehensive Tracking
            </Typography>
            <Typography variant="body1">
              Monitor your fitness, tasks, and personal development goals all in one place.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Smart Integration
            </Typography>
            <Typography variant="body1">
              Seamlessly integrate with your favorite fitness apps and productivity tools.
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;
