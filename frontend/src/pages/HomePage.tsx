import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

const HomePage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Home Page
        </Typography>
        <Typography variant="body1">
          Welcome to Perfect LifeTracker Pro. Track your goals, habits, and life data all in one place.
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage; 