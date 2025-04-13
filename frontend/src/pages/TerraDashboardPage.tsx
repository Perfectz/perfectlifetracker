/**
 * frontend/src/pages/TerraDashboardPage.tsx
 * Terra-themed dashboard page component
 */
import React from 'react';
import {
  Typography,
  Container,
  Box,
  Grid as MuiGrid,
  Paper,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Grid from '../components/Grid';
import GoalsCard from '../components/GoalsCard';
import FitnessMetricsCard from '../components/FitnessMetricsCard';
import TasksCard from '../components/TasksCard';
import DevelopmentCard from '../components/DevelopmentCard';
import TerraFAB from '../components/TerraFAB';
import { terraColors } from '../../src/theme';

// Header image container
const HeaderImageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 180,
  backgroundColor: `${terraColors.softTeal}20`,
  borderRadius: 8,
  marginBottom: 24,
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    height: 140,
  },
}));

// Welcome section
const WelcomeSection = styled(Box)(({ theme }) => ({
  marginBottom: 16,
  padding: 16,
  backgroundColor: '#FFF',
  borderRadius: 8,
  border: `1px solid ${terraColors.softTeal}20`,
}));

const TerraDashboardPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userName = 'Jane'; // This would come from user context/state in a real app

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 8 }}>
      {/* Header Image Placeholder */}
      <HeaderImageContainer>
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            color: terraColors.maastrichtBlue,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            color={terraColors.prussianBlue}
            fontWeight="bold"
          >
            Perfect LifeTracker Pro - Terra
          </Typography>
        </Box>
      </HeaderImageContainer>

      {/* Welcome Section */}
      <WelcomeSection>
        <Typography
          variant="h5"
          component="h2"
          color={terraColors.prussianBlue}
          fontWeight="medium"
        >
          Good Morning, {userName}!
        </Typography>
        <Typography variant="body1" color={terraColors.maastrichtBlue}>
          Here's your daily progress overview
        </Typography>
      </WelcomeSection>

      {/* Dashboard Content */}
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
          bottom: 24,
          right: 24,
        }}
      >
        <TerraFAB size="large" aria-label="add" />
      </Box>
    </Container>
  );
};

export default TerraDashboardPage;
