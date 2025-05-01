// frontend/src/components/activities/ActivityForm.tsx
// Form to create or edit an activity

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  MenuItem, 
  Paper,
  Grid,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Activity, CreateActivityRequest } from '../../services/activityService';
import { useCreateActivity, useUpdateActivity, useActivityTypes } from '../../hooks/useActivities';
import { useNavigate } from 'react-router-dom';

// Understanding: This component allows a user to enter activity details, validates inputs,
//              and submits them to the POST /activities endpoint (or updates via useUpdateActivity).
// Plan:
//   Step 1: Define validation schema using Yup.
//   Step 2: Initialize React Hook Form with the resolver and default values.
//   Step 3: Initialize data hooks: activity types, createActivity and updateActivity mutations.
//   Step 4: Render form fields for type, date, duration, calories, and notes.
//   Step 5: Wire onSubmit to call the appropriate mutation (create or update).
//   Step 6: Disable form during loading and handle navigation/toasts on success.

// Form schema for validation
const schema = yup.object({
  // Step 1: Define the form validation rules
  type: yup.string().required('Activity type is required'),
  duration: yup.number()
    .required('Duration is required')
    .positive('Duration must be a positive number')
    .integer('Duration must be a whole number'),
  calories: yup.number()
    .required('Calories is required')
    .positive('Calories must be a positive number')
    .integer('Calories must be a whole number'),
  date: yup.date().required('Date is required').max(new Date(), 'Date cannot be in the future'),
  notes: yup.string()
}).required();

type FormData = Omit<CreateActivityRequest, 'date'> & {
  date: Date;
};

interface ActivityFormProps {
  activity?: Activity;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ activity }) => {
  const activityTypes = useActivityTypes();
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity(activity?.id);
  const navigate = useNavigate();
  
  // Set up form with validation and default values
  const { 
    control, 
    handleSubmit, 
    formState: { errors, isValid } 
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: activity ? {
      type: activity.type,
      duration: activity.duration,
      calories: activity.calories,
      date: new Date(activity.date),
      notes: activity.notes || ''
    } : {
      type: '',
      duration: 30,
      calories: 1,
      date: new Date(),
      notes: ''
    }
  }); // Step 2: Initialize React Hook Form with Yup resolver

  // Handle form submission
  const onSubmit = (data: FormData) => {
    // Step 5: Handle form submission (create or update)
    const activityData = {
      ...data,
      date: data.date.toISOString()
    };
    
    if (activity) {
      updateActivity.mutate(activityData);
    } else {
      createActivity.mutate(activityData);
    }
  };

  // Using isPending for React Query v5 (TanStack Query)
  const isLoading = createActivity.isPending || updateActivity.isPending;

  return (
    // Step 4: Render form with fields and submit button
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Typography variant="h6" gutterBottom>
          {activity ? 'Edit Activity' : 'Log New Activity'}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Activity Type"
                  fullWidth
                  error={!!errors.type}
                  helperText={errors.type?.message}
                  disabled={isLoading}
                  required
                >
                  {activityTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date"
                    disableFuture
                    value={field.value}
                    onChange={(date) => field.onChange(date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.date}
                        helperText={errors.date?.message}
                        required
                        aria-label="Date"
                        id="activity-date-input"
                      />
                    )}
                  />
                </LocalizationProvider>
              )}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Duration (minutes)"
                  type="number"
                  fullWidth
                  error={!!errors.duration}
                  helperText={errors.duration?.message}
                  disabled={isLoading}
                  required
                  inputProps={{ min: 1 }}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Controller
              name="calories"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Calories Burned"
                  type="number"
                  fullWidth
                  error={!!errors.calories}
                  helperText={errors.calories?.message}
                  disabled={isLoading}
                  required
                  inputProps={{ min: 0 }}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notes"
                  multiline
                  rows={3}
                  fullWidth
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              {activity && (
                <Button
                  onClick={() => navigate('/activities')}
                  variant="outlined"
                  color="secondary"
                  disabled={isLoading}
                  fullWidth
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!isValid || isLoading}
                fullWidth={!activity}
              >
                {isLoading ? 'Saving...' : activity ? 'Update Activity' : 'Log Activity'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ActivityForm; 