/**
 * frontend/src/pages/TerraLayoutDemo.tsx
 * Demo page showing the Terra layout implementation
 */
import React from 'react';
import { Box, Typography, Paper, useMediaQuery, useTheme } from '@mui/material';
import TerraLayout from '../components/TerraLayout';
import GoalsCard from '../components/GoalsCard';
import FitnessMetricsCard from '../components/FitnessMetricsCard';
import TasksCard from '../components/TasksCard';
import DevelopmentCard from '../components/DevelopmentCard';
import TerraFAB from '../components/TerraFAB';
import Grid from '../components/Grid';
import { terraColors } from '../../src/theme';

// Header image container
const HeaderImageContainer = React.memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        width: '100%',
        height: isMobile ? 140 : 180,
        backgroundColor: `${terraColors.softTeal}20`,
        borderRadius: 2,
        marginBottom: 3,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        padding: 2,
      }}
    >
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        component="h1"
        color={terraColors.prussianBlue}
        fontWeight="bold"
      >
        Terra Layout Demo
      </Typography>
    </Box>
  );
});

// Welcome section
const WelcomeSection = React.memo(() => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      mb: 3,
      backgroundColor: '#fff',
      borderRadius: 2,
      border: `1px solid ${terraColors.softTeal}20`,
    }}
  >
    <Typography variant="h5" component="h2" color={terraColors.prussianBlue} fontWeight="medium">
      Good Morning, Jane!
    </Typography>
    <Typography variant="body1" color={terraColors.maastrichtBlue}>
      Here's your daily progress overview
    </Typography>
  </Paper>
));

const TerraLayoutDemo: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <TerraLayout>
      <HeaderImageContainer />
      <WelcomeSection />

      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={3}>
          {/* First row */}
          <Grid container item xs={12} md={6}>
            <GoalsCard />
          </Grid>
          <Grid container item xs={12} md={6}>
            <FitnessMetricsCard />
          </Grid>

          {/* Second row */}
          <Grid container item xs={12} md={6}>
            <TasksCard />
          </Grid>
          <Grid container item xs={12} md={6}>
            <DevelopmentCard />
          </Grid>
        </Grid>
      </Box>

      {/* Floating Action Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: isMobile ? 70 : 24, // Position above bottom nav on mobile
          right: 24,
        }}
      >
        <TerraFAB size="large" aria-label="add" onClick={() => console.log('FAB clicked')} />
      </Box>
    </TerraLayout>
  );
};

export default TerraLayoutDemo;
