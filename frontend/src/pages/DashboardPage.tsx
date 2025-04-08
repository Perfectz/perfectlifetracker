/**
 * frontend/src/pages/DashboardPage.tsx
 * Dashboard page component displaying user's habits and goals
 */
import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

const DashboardPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6">Habits</Typography>
            <Typography variant="body2">
              Your habits will appear here. Track daily progress and build consistency.
            </Typography>
          </Paper>
          
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6">Goals</Typography>
            <Typography variant="body2">
              Your goals will appear here. Monitor progress and stay motivated.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default DashboardPage; 