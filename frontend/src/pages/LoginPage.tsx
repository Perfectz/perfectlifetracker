/**
 * frontend/src/pages/LoginPage.tsx
 * Login page component
 */
import React from 'react';
import { Typography, Box, Container } from '@mui/material';
import LoginButton from '../components/LoginButton';

const LoginPage = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Login
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Sign in to access your Perfect LifeTracker Pro account
        </Typography>
        <Box sx={{ mt: 4 }}>
          <LoginButton />
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
