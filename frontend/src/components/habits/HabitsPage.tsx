import React from 'react';
import { Box, Container, Typography, Paper, Divider } from '@mui/material';
import HabitList from './HabitList';
import StreakChart from './StreakChart';
import { useHabitsList, useStreakData } from '../../hooks/useHabits';

const HabitsPage: React.FC = () => {
  // Get habits list
  const { data: habitsData } = useHabitsList(1, 100); // Load more habits for chart data
  const habits = habitsData?.items || [];

  // Get streak data for chart
  const { data: streakData, isLoading: isLoadingStreak } = useStreakData(habits);

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Habit Tracker
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Track and maintain your daily, weekly, and monthly habits. Build streaks and visualize your progress over time.
          </Typography>
        </Paper>

        {/* Habits List Component */}
        <HabitList />

        <Divider sx={{ my: 4 }} />

        {/* Streak Chart */}
        <Typography variant="h5" component="h2" gutterBottom>
          Streak Visualization
        </Typography>
        <StreakChart 
          data={streakData || []} 
          isLoading={isLoadingStreak}
          height={350}
        />
      </Box>
    </Container>
  );
};

export default HabitsPage; 