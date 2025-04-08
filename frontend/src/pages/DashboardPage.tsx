/**
 * frontend/src/pages/DashboardPage.tsx
 * Dashboard page component displaying user's habits and goals
 */
import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '../components/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useTheme } from '@mui/material/styles';

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  
  const habits = [
    { name: 'Morning Exercise', progress: 80, streak: 12, icon: <FitnessCenterIcon /> },
    { name: 'Reading', progress: 65, streak: 8, icon: <MenuBookIcon /> },
    { name: 'Meditation', progress: 45, streak: 5, icon: <AccessTimeIcon /> },
  ];
  
  const goals = [
    { name: 'Learn TypeScript', target: 'Complete course', dueDate: '2024-05-30', progress: 70 },
    { name: 'Run 5K', target: '5 kilometers', dueDate: '2024-06-15', progress: 40 },
    { name: 'Improve Sleep', target: '8 hours daily', dueDate: '2024-04-30', progress: 60 },
  ];

  return (
    <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        my: { xs: 2, md: 4 },
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, mb: 3 }}
        >
          Your Dashboard
        </Typography>
        
        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            <Grid container item xs={12} lg={6}>
              <Card elevation={2} sx={{ mb: 3, width: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader 
                  title={
                    <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                      Habits
                    </Typography>
                  }
                  subheader="Track daily progress and build consistency"
                />
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {habits.map((habit, index) => (
                      <Paper 
                        key={index} 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)' 
                            : 'rgba(0, 0, 0, 0.02)'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar 
                            sx={{ 
                              mr: 2, 
                              bgcolor: 'primary.main',
                              width: 40,
                              height: 40
                            }}
                          >
                            {habit.icon}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: 1
                            }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                {habit.name}
                              </Typography>
                              <Chip 
                                label={`${habit.streak} day streak`} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                              />
                            </Box>
                            <Box sx={{ mt: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={habit.progress} 
                                sx={{ height: 8, borderRadius: 4 }} 
                              />
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ mt: 0.5, textAlign: 'right' }}
                              >
                                {habit.progress}%
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid container item xs={12} lg={6}>
              <Card elevation={2} sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader 
                  title={
                    <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                      Goals
                    </Typography>
                  }
                  subheader="Monitor progress and stay motivated"
                />
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {goals.map((goal, index) => (
                      <Paper 
                        key={index} 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)' 
                            : 'rgba(0, 0, 0, 0.02)'
                        }}
                      >
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1
                          }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                              {goal.name}
                            </Typography>
                            <Chip 
                              label={`Due: ${new Date(goal.dueDate).toLocaleDateString()}`} 
                              size="small" 
                              color="secondary" 
                              variant="outlined" 
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Target: {goal.target}
                          </Typography>
                          <Box sx={{ mt: 1.5 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={goal.progress} 
                              sx={{ height: 8, borderRadius: 4 }} 
                            />
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ mt: 0.5, textAlign: 'right' }}
                            >
                              {goal.progress}%
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default DashboardPage; 