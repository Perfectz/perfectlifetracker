import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import { useUser } from '../../hooks/useUser';
import SignInButton from './SignInButton';

/**
 * WelcomeScreen component displays the landing page for non-authenticated users
 */
const WelcomeScreen: React.FC = () => {
  const { isAuthenticated } = useUser();
  
  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <Box 
      className="welcome-container" 
      component={Paper} 
      elevation={3}
      aria-labelledby="welcome-title"
    >
      <Typography variant="h4" component="h2" id="welcome-title" color="primary" gutterBottom>
        Welcome to LifeTracker Pro
      </Typography>
      
      <Typography variant="body1" paragraph>
        Please sign in to access your profile and track your progress.
      </Typography>
      
      <Box className="sign-in-container" sx={{ mt: 3 }}>
        <SignInButton />
      </Box>

      {/* Accessibility enhancement - status message for screen readers */}
      <div className="sr-only" aria-live="polite" id="auth-status"></div>
    </Box>
  );
};

export default WelcomeScreen; 