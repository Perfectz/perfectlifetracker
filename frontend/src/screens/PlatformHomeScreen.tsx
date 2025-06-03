/**
 * frontend/src/screens/PlatformHomeScreen.tsx
 * Platform-adaptive Home screen that works on both web and mobile
 */
import React from 'react';
import { useMediaQuery } from '@mui/material';

// Web components
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Button,
  IconButton,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AddIcon from '@mui/icons-material/Add';

// Import the Header component
import Header from '../components/Header';

// Import from the theme
import { terraColors } from '../theme';

/**
 * Platform-adaptive HomeScreen
 * Renders appropriate components based on platform (web or mobile)
 */
const PlatformHomeScreen: React.FC = () => {
  const isMobile = useMediaQuery('(max-width:768px)');

  return (
    <Box
      sx={{
        backgroundColor: terraColors.pearl,
        minHeight: '100%',
        borderRadius: 1,
      }}
    >
      {/* Header Banner Image */}
      <Header height={isMobile ? 160 : 220} marginBottom={3} />

      {/* Dashboard Content */}
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        {/* Welcome Card */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" color={terraColors.prussianBlue} gutterBottom>
              Good Morning, Jane!
            </Typography>
            <Typography variant="body1" color={terraColors.maastrichtBlue}>
              You have 3 goals to complete today
            </Typography>
            <Typography variant="caption" color={terraColors.softTeal}>
              AI-powered insights available
            </Typography>
          </CardContent>
        </Card>

        {/* Progress Section */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" color={terraColors.prussianBlue} gutterBottom>
              Today's Progress
            </Typography>
            <LinearProgress
              variant="determinate"
              value={75}
              sx={{
                height: 10,
                borderRadius: 5,
                mb: 1,
                backgroundColor: `${terraColors.pearl}`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: terraColors.tropicalRain,
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color={terraColors.tropicalRain}>
                75% Complete
              </Typography>
              <Typography variant="caption" color={terraColors.softTeal}>
                25% remaining
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Typography variant="h6" color={terraColors.prussianBlue} gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3,
                },
              }}
            >
              <FitnessCenterIcon sx={{ color: terraColors.tropicalRain, mb: 1 }} />
              <Typography variant="body2" color={terraColors.maastrichtBlue}>
                Workout
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3,
                },
              }}
            >
              <MenuBookIcon sx={{ color: terraColors.tropicalRain, mb: 1 }} />
              <Typography variant="body2" color={terraColors.maastrichtBlue}>
                Journal
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3,
                },
              }}
            >
              <ChecklistIcon sx={{ color: terraColors.tropicalRain, mb: 1 }} />
              <Typography variant="body2" color={terraColors.maastrichtBlue}>
                Tasks
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Upcoming Events */}
        <Typography variant="h6" color={terraColors.prussianBlue} gutterBottom>
          Coming Up Next
        </Typography>
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="body1" color={terraColors.maastrichtBlue}>
              Team Meeting
            </Typography>
            <Box sx={{ display: 'flex' }}>
              {['H', 'F', 'D', 'T'].map((letter, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: terraColors.pearl,
                    color: terraColors.maastrichtBlue,
                    fontSize: 14,
                    fontWeight: 'bold',
                    ml: 1,
                  }}
                >
                  {letter}
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Floating Action Button */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
        <IconButton
          sx={{
            backgroundColor: terraColors.tropicalRain,
            color: 'white',
            '&:hover': {
              backgroundColor: terraColors.prussianBlue,
            },
            width: 56,
            height: 56,
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default PlatformHomeScreen;
