// frontend/src/components/goals/GoalList.tsx
// Component for displaying a list of fitness goals

import React, { useState, useMemo } from 'react';
import { 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Divider, 
  Chip, 
  Box, 
  LinearProgress, 
  CircularProgress, 
  Button,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { format } from 'date-fns';
import { Delete, Edit } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoals, useDeleteGoal } from '../../hooks/useGoals';
import { FitnessGoal } from '../../services/goalService';
import GoalsPagination from './GoalsPagination';

// Default pagination values
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

const GoalList: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'achieved'>('all');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get pagination parameters from URL or use defaults
  const page = parseInt(searchParams.get('page') || String(DEFAULT_PAGE));
  const limit = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT));
  
  // Calculate offset based on page and limit
  const offset = (page - 1) * limit;
  
  // Use the useGoals hook to fetch goals data with pagination from URL
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useGoals({ limit, offset });
  
  // Extract goals array and pagination info
  const goals = data?.items || [];
  const totalItems = data?.total || 0;
  
  // Use the useDeleteGoal hook for deleting goals
  const deleteMutation = useDeleteGoal();

  // Filter goals based on the selected filter
  const filteredGoals = useMemo(() => {
    if (filter === 'all') {
      return goals;
    } else if (filter === 'active') {
      return goals.filter((goal: FitnessGoal) => !goal.achieved);
    } else {
      return goals.filter((goal: FitnessGoal) => goal.achieved);
    }
  }, [goals, filter]);

  // Handle deleting a goal
  const handleDeleteGoal = (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteMutation.mutate(id);
    }
  };

  // Handle editing a goal
  const handleEditGoal = (id: string) => {
    navigate(`/goals/edit/${id}`);
  };

  // Handle viewing a goal's details
  const handleViewGoalDetails = (id: string) => {
    navigate(`/goals/${id}`);
  };

  // Create a new goal
  const handleCreateGoal = () => {
    navigate('/goals/new');
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (err) {
      return 'Invalid date';
    }
  };

  if (isLoading && !goals.length) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2, maxWidth: 800, margin: '0 auto', mt: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2">
          My Fitness Goals
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleCreateGoal}
          data-testid="create-goal-button"
        >
          Add New Goal
        </Button>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error)?.message || 'Failed to load goals. Please try again.'}
        </Alert>
      )}

      {deleteMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(deleteMutation.error as Error)?.message || 'Failed to delete goal. Please try again.'}
        </Alert>
      )}

      <Box display="flex" mb={2} justifyContent="space-between" alignItems="center">
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="filter-select-label">Filter</InputLabel>
          <Select
            labelId="filter-select-label"
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'achieved')}
            label="Filter"
            data-testid="goal-filter"
          >
            <MenuItem value="all">All Goals</MenuItem>
            <MenuItem value="active">Active Goals</MenuItem>
            <MenuItem value="achieved">Achieved Goals</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredGoals.length === 0 ? (
        <Alert severity="info" data-testid="no-goals-message">
          No goals found. Click "Add New Goal" to create your first fitness goal.
        </Alert>
      ) : (
        <>
          <List data-testid="goals-list">
            {filteredGoals.map((goal: FitnessGoal, index: number) => (
              <React.Fragment key={goal.id}>
                {index > 0 && <Divider />}
                <ListItem 
                  alignItems="flex-start" 
                  button
                  onClick={() => handleViewGoalDetails(goal.id)}
                  data-testid={`goal-item-${goal.id}`}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="subtitle1" component="span">
                          {goal.title}
                        </Typography>
                        {goal.achieved && (
                          <Chip 
                            label="Achieved" 
                            color="success" 
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" component="span" color="text.secondary">
                          Target Date: {formatDate(goal.targetDate)}
                        </Typography>
                        {goal.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {goal.notes}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={goal.progress || 0} 
                              color={goal.achieved ? "success" : "primary"}
                            />
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {goal.progress || 0}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="edit" 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the list item click
                        handleEditGoal(goal.id);
                      }}
                      data-testid={`edit-goal-${goal.id}`}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the list item click
                        handleDeleteGoal(goal.id);
                      }}
                      disabled={deleteMutation.isPending}
                      data-testid={`delete-goal-${goal.id}`}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>

          <GoalsPagination 
            totalItems={totalItems}
            itemsPerPage={limit}
            currentPage={page}
          />
        </>
      )}
    </Paper>
  );
};

export default GoalList; 