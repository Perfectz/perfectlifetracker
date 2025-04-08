/**
 * frontend/src/pages/HomePage.tsx
 * Home page component with welcome message and app introduction
 */
import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '../components/Grid';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useTheme } from '@mui/material/styles';

const HomePage: React.FC = () => {
  const theme = useTheme();

  const features = [
    {
      title: 'Fitness Tracking',
      description: 'Log workouts, track progress, and set fitness goals to maintain a healthy lifestyle.',
      icon: <FitnessCenterIcon fontSize="large" />,
    },
    {
      title: 'Personal Development',
      description: 'Monitor habits, set personal goals, and track achievements to grow continuously.',
      icon: <PersonIcon fontSize="large" />,
    },
    {
      title: 'Task Management',
      description: 'Create and manage daily tasks with priority and deadline tracking for better productivity.',
      icon: <AssignmentIcon fontSize="large" />,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        my: { xs: 2, md: 4 },
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {/* Hero Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, md: 4 }, 
            mb: 4, 
            borderRadius: 2,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 600
            }}
          >
            Perfect LifeTracker Pro
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3, 
              maxWidth: '800px', 
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            Track your goals, habits, and life data all in one place with AI-powered insights.
          </Typography>
        </Paper>

        {/* Features Section */}
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom
          sx={{ 
            mb: 3,
            fontSize: { xs: '1.5rem', md: '2rem' }
          }}
        >
          Key Features
        </Typography>
        
        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            {features.map((feature, index) => (
              <Grid container item xs={12} sm={6} md={4} key={index}>
                <Card 
                  elevation={1}
                  sx={{ 
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        color: 'primary.main', 
                        display: 'flex', 
                        mr: 1,
                        alignItems: 'center'
                      }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" component="h3">
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage; 