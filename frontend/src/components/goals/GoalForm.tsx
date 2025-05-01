// frontend/src/components/goals/GoalForm.tsx
// Component for creating and editing fitness goals

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  FormControl, 
  FormControlLabel, 
  Switch, 
  Slider, 
  CircularProgress, 
  Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './goals.css'; // Import custom CSS for components including DatePicker
import { CreateGoalRequest, UpdateGoalRequest } from '../../services/goalService';
import { useGoal, useCreateGoal, useUpdateGoal } from '../../hooks/useGoals';

interface GoalFormProps {
  mode: 'create' | 'edit';
}

const GoalForm: React.FC<GoalFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [title, setTitle] = useState<string>('');
  const [targetDate, setTargetDate] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState<string>('');
  const [achieved, setAchieved] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  // Use React Query hooks
  const { 
    data: goalData, 
    isLoading: isLoadingGoal, 
    isError: isErrorFetching, 
    error: fetchError 
  } = useGoal(mode === 'edit' ? id : undefined);
  
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal(id);
  
  // Set form data when editing an existing goal
  useEffect(() => {
    if (mode === 'edit' && goalData) {
      setTitle(goalData.title);
      setTargetDate(goalData.targetDate ? new Date(goalData.targetDate) : null);
      setNotes(goalData.notes || '');
      setAchieved(goalData.achieved || false);
      setProgress(goalData.progress || 0);
    }
  }, [mode, goalData]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !targetDate) {
      setError('Please fill out all required fields');
      return;
    }
    
    try {
      if (mode === 'create') {
        const newGoalData: CreateGoalRequest = {
          title,
          targetDate: targetDate.toISOString(),
          notes: notes || undefined,
          achieved,
          progress
        };
        
        createMutation.mutate(newGoalData);
      } else if (mode === 'edit') {
        const updatedGoalData: UpdateGoalRequest = {
          title,
          targetDate: targetDate.toISOString(),
          notes: notes || undefined,
          achieved,
          progress
        };
        
        updateMutation.mutate(updatedGoalData);
      }
    } catch (err) {
      setError((err as Error)?.message || 'Failed to save goal. Please try again.');
    }
  };
  
  // Handle progress slider change
  const handleProgressChange = (_event: Event, newValue: number | number[]) => {
    setProgress(newValue as number);
    
    // If progress is 100%, automatically set achieved to true
    if (newValue === 100) {
      setAchieved(true);
    }
  };
  
  // Handle progress text input change
  const handleProgressInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setProgress(isNaN(value) ? 0 : Math.min(100, Math.max(0, value)));
    
    // If progress is 100%, automatically set achieved to true
    if (value === 100) {
      setAchieved(true);
    }
  };
  
  // Handle achieved status change
  const handleAchievedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isAchieved = event.target.checked;
    setAchieved(isAchieved);
    
    // If achieved is true, set progress to 100%
    if (isAchieved) {
      setProgress(100);
    }
  };
  
  // Determine if we're in a loading state
  const isLoading = isLoadingGoal || createMutation.isPending || updateMutation.isPending;
  
  // Determine if there's an error to display
  const errorMessage = error || 
    (isErrorFetching ? (fetchError as Error)?.message : null) ||
    (createMutation.isError ? (createMutation.error as Error)?.message : null) ||
    (updateMutation.isError ? (updateMutation.error as Error)?.message : null);
  
  if (isLoadingGoal) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper sx={{ p: 3, maxWidth: 600, margin: '0 auto', mt: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {mode === 'create' ? 'Create New Goal' : 'Edit Goal'}
      </Typography>
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="title"
          label="Goal Title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />
        
        <Box mt={2} mb={2}>
          <Typography variant="body1" gutterBottom>
            Target Date *
          </Typography>
          <DatePicker
            selected={targetDate}
            onChange={(date: Date | null) => setTargetDate(date)}
            dateFormat="yyyy-MM-dd"
            wrapperClassName="date-picker-wrapper"
            disabled={isLoading}
          />
        </Box>
        
        <TextField
          margin="normal"
          fullWidth
          id="notes"
          label="Notes"
          name="notes"
          multiline
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
        />
        
        <Box mt={3}>
          <Typography gutterBottom>Progress: {progress}%</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Slider
              value={progress}
              onChange={handleProgressChange}
              aria-labelledby="progress-slider"
              valueLabelDisplay="auto"
              disabled={isLoading}
            />
            <TextField
              sx={{ width: 70, ml: 2 }}
              value={progress}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleProgressInputChange(e)}
              inputProps={{
                min: 0,
                max: 100,
                type: 'number',
              }}
              size="small"
              disabled={isLoading}
            />
          </Box>
        </Box>
        
        <FormControl component="fieldset" sx={{ mt: 2, mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={achieved}
                onChange={handleAchievedChange}
                name="achieved"
                color="primary"
                disabled={isLoading}
              />
            }
            label="Mark as Achieved"
          />
        </FormControl>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/goals')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading || !title || !targetDate}
          >
            {isLoading ? 
              <CircularProgress size={24} /> : 
              (mode === 'create' ? 'Create Goal' : 'Save Changes')
            }
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default GoalForm; 