/**
 * frontend/src/screens/HomeScreen.tsx
 * Home screen for the web app
 */
import React from 'react';
import { Box, Card, Typography, Paper, LinearProgress } from '@mui/material';
import Grid from '../components/Grid';
import { terraColors } from '../theme';
import type { StackScreenProps } from '@react-navigation/stack';
import type { MainTabParamList } from '../navigation/AppNavigator';

// Import the Header component
import Header from '../components/Header';

type HomeScreenProps = StackScreenProps<MainTabParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <Box sx={{ 
      flex: 1, 
      backgroundColor: terraColors.pearl,
    }}>
      {/* Header Banner Image - optimized for mobile */}
      <Header height={140} marginBottom={2} />
      
      <Box sx={{ p: 2, overflow: 'auto' }}>
        {/* Welcome Card */}
        <Card sx={{ mb: 2, p: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, fontWeight: 'bold' }}>
            Good Morning, Jane!
          </Typography>
          <Typography sx={{ color: terraColors.maastrichtBlue, mb: 0.5 }}>
            You have 3 goals to complete today
          </Typography>
          <Typography sx={{ color: terraColors.softTeal, fontSize: '0.75rem' }}>
            AI-powered insights available
          </Typography>
        </Card>

        {/* Progress Card */}
        <Card sx={{ mb: 2, p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ color: terraColors.prussianBlue, mb: 1 }}>
            Today's Progress
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={75} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: terraColors.tropicalRain
              }
            }} 
          />
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 1 
          }}>
            <Typography sx={{ color: terraColors.tropicalRain, fontSize: '0.75rem' }}>
              75% Complete
            </Typography>
            <Typography sx={{ color: terraColors.softTeal, fontSize: '0.75rem' }}>
              25% remaining
            </Typography>
          </Box>
        </Card>

        {/* Quick Actions */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Card 
              sx={{ 
                p: 1.5, 
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => navigation?.navigate && navigation.navigate('Fitness')}
            >
              <Box sx={{ fontSize: 24, color: terraColors.tropicalRain }}>🏋️</Box>
              <Typography sx={{ color: terraColors.maastrichtBlue, fontSize: '0.75rem', mt: 1, textAlign: 'center' }}>
                Workout
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={4}>
            <Card 
              sx={{ 
                p: 1.5, 
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => navigation?.navigate && navigation.navigate('Development')}
            >
              <Box sx={{ fontSize: 24, color: terraColors.tropicalRain }}>📚</Box>
              <Typography sx={{ color: terraColors.maastrichtBlue, fontSize: '0.75rem', mt: 1, textAlign: 'center' }}>
                Journal
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={4}>
            <Card 
              sx={{ 
                p: 1.5, 
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => navigation?.navigate && navigation.navigate('Tasks')}
            >
              <Box sx={{ fontSize: 24, color: terraColors.tropicalRain }}>✓</Box>
              <Typography sx={{ color: terraColors.maastrichtBlue, fontSize: '0.75rem', mt: 1, textAlign: 'center' }}>
                Tasks
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Upcoming */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ color: terraColors.prussianBlue, mb: 1 }}>
            Coming Up Next
          </Typography>
          <Card sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: terraColors.maastrichtBlue }}>
                Team Meeting
              </Typography>
              <Box sx={{ display: 'flex' }}>
                {['H', 'F', 'D', 'T'].map((letter, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      backgroundColor: terraColors.pearl,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ml: 0.5
                    }}
                  >
                    <Typography>{letter}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default HomeScreen; 