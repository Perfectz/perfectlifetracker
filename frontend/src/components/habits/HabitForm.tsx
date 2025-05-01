import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHabitDetail, useHabitOperations } from '../../hooks/useHabits';
import { 
  createHabitSchema, 
  defaultHabitValues, 
  HabitFrequency, 
  CreateHabitInput 
} from '../../schemas/habits.schema';

// Define form data type from schema
type HabitFormData = CreateHabitInput;

interface HabitFormProps {
  open: boolean;
  habitId: string | null;
  onClose: () => void;
}

const HabitForm: React.FC<HabitFormProps> = ({ open, habitId, onClose }) => {
  const [formError, setFormError] = useState<string | null>(null);
  
  const isEditMode = !!habitId;
  const formTitle = isEditMode ? 'Edit Habit' : 'Add New Habit';

  // Fetch habit detail if in edit mode
  const {
    data: habitData,
    isLoading: isLoadingHabit,
    error: habitError
  } = useHabitDetail(habitId ?? '', {
    enabled: isEditMode && open,
  });

  // Get habit operations
  const { createHabit, updateHabit } = useHabitOperations();

  // Initialize the form with react-hook-form and zod validation
  const { 
    control, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm<HabitFormData>({
    resolver: zodResolver(createHabitSchema),
    defaultValues: defaultHabitValues
  });

  // Update form values when habit data changes (for edit mode)
  useEffect(() => {
    if (habitData && isEditMode) {
      reset({
        name: habitData.name,
        frequency: habitData.frequency as HabitFrequency,
        description: habitData.description || '',
        streak: habitData.streak
      });
    } else if (!isEditMode) {
      // Reset form for new habits
      reset(defaultHabitValues);
    }
  }, [habitData, isEditMode, reset]);

  // Handle form submission
  const onSubmit = async (formData: HabitFormData) => {
    try {
      setFormError(null);
      
      if (isEditMode && habitId) {
        // For updates, pass ID and update data separately
        await updateHabit.mutateAsync(habitId, formData);
      } else {
        // For new habits, just pass the form data
        await createHabit.mutateAsync(formData);
      }
      
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      setFormError('Failed to save habit. Please try again.');
    }
  };

  // Handle form close - reset state
  const handleClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle data-testid="habit-form-title">{formTitle}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {/* Show error message if API returns error */}
          {(formError || habitError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError || 'Error loading habit data. Please try again.'}
            </Alert>
          )}

          {/* Loading state */}
          {isEditMode && isLoadingHabit ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <CircularProgress />
            </div>
          ) : (
            <>
              {/* Name field */}
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Habit Name"
                    fullWidth
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    required
                    InputProps={{
                      inputProps: { 'data-testid': 'habit-name-input' }
                    }}
                  />
                )}
              />

              {/* Frequency field */}
              <Controller
                name="frequency"
                control={control}
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    margin="normal" 
                    error={!!errors.frequency}
                  >
                    <InputLabel id="frequency-label">Frequency</InputLabel>
                    <Select
                      {...field}
                      labelId="frequency-label"
                      label="Frequency"
                      required
                      inputProps={{ 'data-testid': 'habit-frequency-select' }}
                    >
                      <MenuItem value={HabitFrequency.DAILY}>Daily</MenuItem>
                      <MenuItem value={HabitFrequency.WEEKLY}>Weekly</MenuItem>
                      <MenuItem value={HabitFrequency.MONTHLY}>Monthly</MenuItem>
                      <MenuItem value={HabitFrequency.CUSTOM}>Custom</MenuItem>
                    </Select>
                    {errors.frequency && (
                      <FormHelperText>{errors.frequency.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              {/* Description field */}
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    InputProps={{
                      inputProps: { 'data-testid': 'habit-description-input' }
                    }}
                  />
                )}
              />

              {/* Streak field */}
              <Controller
                name="streak"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <TextField
                    {...field}
                    value={value || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChange(val === '' ? '' : Number(val));
                    }}
                    label="Current Streak"
                    type="number"
                    fullWidth
                    margin="normal"
                    error={!!errors.streak}
                    helperText={errors.streak?.message}
                    InputProps={{
                      inputProps: { 
                        min: 0,
                        'data-testid': 'habit-streak-input'
                      }
                    }}
                  />
                )}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isSubmitting || isLoadingHabit}
            data-testid="habit-submit-button"
          >
            {isSubmitting ? (
              <>Saving <CircularProgress size={20} sx={{ ml: 1 }} /></>
            ) : (
              isEditMode ? 'Update' : 'Create'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default HabitForm; 