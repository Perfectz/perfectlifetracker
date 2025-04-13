/**
 * frontend/src/pages/HomePage.tsx
 * Home page component
 */
import React from 'react';
import { Typography, Box, Container } from '@mui/material';

const HomePage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Perfect LifeTracker Pro
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Your AI-powered personal assistant for tracking fitness goals, personal development, and daily tasks.
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;
