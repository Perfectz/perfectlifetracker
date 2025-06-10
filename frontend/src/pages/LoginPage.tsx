/**
 * frontend/src/pages/LoginPage.tsx
 * Login page component
 */
import React from 'react';
import { Typography, Box, Container, Paper, Divider } from '@mui/material';
import LoginButton from '../components/LoginButton';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 8, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom color="text.secondary" sx={{ mb: 4 }}>
          Sign in to access your Perfect LifeTracker Pro account
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Secure Login
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Sign in with your Microsoft account to access all features and sync your data.
          </Typography>
          
          <LoginButton />
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body2" color="text.secondary">
            Your account includes:
            <br />
            • Weight tracking with cloud sync
            <br />
            • Task management with data persistence
            <br />
            • Cross-device access
            <br />
            • Secure data backup
          </Typography>
        </Paper>
        
        <Typography variant="body2" color="text.secondary">
          Want to explore without logging in?{' '}
          <Typography 
            component="span" 
            sx={{ 
              color: 'primary.main', 
              cursor: 'pointer', 
              textDecoration: 'underline' 
            }}
            onClick={() => navigate('/')}
          >
            Return to Home
          </Typography>
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;
