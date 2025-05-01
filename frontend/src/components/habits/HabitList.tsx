import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Pagination,
  Paper,
  Chip,
  Skeleton,
  Alert,
  Stack
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  EmojiEvents as StreakIcon
} from '@mui/icons-material';
import { useHabitsList, useHabitOperations } from '../../hooks/useHabits';
import { HabitFrequency } from '../../services/habitService';
import HabitForm from './HabitForm';

// Map habit frequency to readable text
const frequencyLabels: Record<HabitFrequency, string> = {
  [HabitFrequency.DAILY]: 'Daily',
  [HabitFrequency.WEEKLY]: 'Weekly',
  [HabitFrequency.MONTHLY]: 'Monthly',
  [HabitFrequency.CUSTOM]: 'Custom'
};

// Get color based on streak
const getStreakColor = (streak: number) => {
  if (streak >= 30) return 'success';
  if (streak >= 15) return 'info';
  if (streak >= 7) return 'primary';
  if (streak >= 3) return 'warning';
  return 'default';
};

const HabitList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch habits with pagination
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useHabitsList(page, limit);

  // Habit operations
  const { deleteHabit } = useHabitOperations();

  // Handle habit form
  const handleAddHabit = () => {
    setSelectedHabitId(null);
    setIsFormOpen(true);
  };

  const handleEditHabit = (id: string) => {
    setSelectedHabitId(id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedHabitId(null);
  };

  // Handle pagination
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Handle delete habit
  const handleDeleteHabit = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await deleteHabit.mutateAsync(id);
        // Refetch first page if we deleted the last item on the current page
        if (data?.items.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          refetch();
        }
      } catch (error) {
        console.error('Failed to delete habit', error);
      }
    }
  };

  // Calculate total pages
  const totalPages = data && data.total ? Math.ceil(data.total / limit) : 0;

  if (error) {
    return (
      <Alert severity="error">
        Error loading habits: {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', mt: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h1">
          Habits Tracker
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddHabit}
        >
          Add Habit
        </Button>
      </Box>

      <Paper elevation={2} sx={{ mb: 2 }}>
        {isLoading ? (
          // Loading skeleton
          <List>
            {[...Array(5)].map((_, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={<Skeleton width="70%" height={24} />}
                  secondary={<Skeleton width="40%" height={20} />}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="circular" width={40} height={40} />
                </Box>
              </ListItem>
            ))}
          </List>
        ) : data && data.items && data.items.length === 0 ? (
          // Empty state
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              No habits found. Click 'Add Habit' to create your first habit.
            </Typography>
          </Box>
        ) : data && data.items ? (
          // Habits list
          <List>
            {data.items.map((habit) => (
              <ListItem key={habit.id} divider>
                <ListItemText
                  primary={habit.name}
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="textSecondary">
                        {frequencyLabels[habit.frequency]}
                      </Typography>
                      {habit.description && (
                        <Typography variant="body2" color="textSecondary">
                          • {habit.description}
                        </Typography>
                      )}
                    </Stack>
                  }
                />
                <Stack direction="row" spacing={1} alignItems="center" mr={1}>
                  <Chip
                    icon={<StreakIcon />}
                    label={`Streak: ${habit.streak}`}
                    color={getStreakColor(habit.streak) as any}
                    size="small"
                  />
                </Stack>
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    aria-label="edit"
                    onClick={() => handleEditHabit(habit.id)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={() => handleDeleteHabit(habit.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          // Fallback for when data is null or undefined
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              Unable to load habits. Please try again later.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Habit Form Dialog */}
      <HabitForm
        open={isFormOpen}
        habitId={selectedHabitId}
        onClose={handleCloseForm}
      />
    </Box>
  );
};

export default HabitList; 