// frontend/src/components/goals/GoalDetail.tsx
// Component for displaying detailed information about a single fitness goal

import React, { useMemo } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  CircularProgress, 
  Button, 
  Alert, 
  Chip, 
  Grid, 
  Divider 
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { Edit, ArrowBack, Done, Pending } from '@mui/icons-material';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useGoal } from '../../hooks/useGoals';
import { FitnessGoal } from '../../services/goalService';

// Interface for progress chart data
interface ProgressDataPoint {
  date: string;
  progress: number;
}

const GoalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Use React Query hook to fetch goal data
  const { 
    data: goal, 
    isLoading, 
    isError, 
    error 
  } = useGoal(id);
  
  // Generate mock historical progress data for the chart
  const progressData = useMemo(() => {
    if (!goal) return [];
    
    const currentDate = new Date();
    const startDate = new Date(goal.createdAt);
    
    // Generate data points from creation to current date
    const numberOfDays = Math.max(7, Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const dataPoints: ProgressDataPoint[] = [];
    
    // Calculate initial progress value based on current progress
    // If the goal is recently created, start from 0
    // Otherwise, back-calculate to create a realistic progression
    const currentProgress = goal.progress || 0;
    const progressIncrement = currentProgress / numberOfDays;
    
    // Generate data points with gradually increasing progress
    for (let i = 0; i <= numberOfDays; i++) {
      const date = subDays(currentDate, numberOfDays - i);
      // For achieved goals, make the last data point reach 100%
      const progressValue = goal.achieved && i === numberOfDays 
        ? 100 
        : Math.min(Math.round(progressIncrement * i), currentProgress);
      
      dataPoints.push({
        date: format(date, 'MMM dd'),
        progress: progressValue
      });
    }
    
    return dataPoints;
  }, [goal]);
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (err) {
      return 'Invalid date';
    }
  };
  
  // Calculate days remaining until target date
  const getDaysRemaining = (targetDateString: string): number => {
    const targetDate = new Date(targetDateString);
    const now = new Date();
    
    // Check if date is in the past
    if (targetDate < now) {
      return 0;
    }
    
    const difference = targetDate.getTime() - now.getTime();
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };
  
  // Handle edit button click
  const handleEdit = () => {
    navigate(`/goals/edit/${id}`);
  };
  
  // Handle back button click
  const handleBack = () => {
    navigate('/goals');
  };
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (isError || !goal) {
    return (
      <Paper sx={{ p: 3, maxWidth: 800, margin: '0 auto', mt: 3 }}>
        <Alert severity="error">
          {isError ? (error as Error)?.message : 'Goal not found'}
        </Alert>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={handleBack}>
            Back to Goals
          </Button>
        </Box>
      </Paper>
    );
  }
  
  // At this point goal is guaranteed to be a FitnessGoal
  const typedGoal = goal as FitnessGoal;
  const daysRemaining = getDaysRemaining(typedGoal.targetDate);
  
  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: '0 auto', mt: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <Typography variant="h4" component="h1">
            {typedGoal.title}
          </Typography>
          {typedGoal.achieved && (
            <Chip 
              label="Achieved" 
              color="success" 
              icon={<Done />} 
              sx={{ ml: 2 }}
            />
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={handleEdit}
        >
          Edit
        </Button>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Target Date
            </Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(typedGoal.targetDate)}
            </Typography>
            
            {!typedGoal.achieved && daysRemaining > 0 && (
              <Chip 
                label={`${daysRemaining} days remaining`} 
                color="primary" 
                variant="outlined"
                icon={<Pending />}
                size="small"
                sx={{ mt: 1 }}
              />
            )}
            
            {!typedGoal.achieved && daysRemaining === 0 && (
              <Chip 
                label="Due today" 
                color="warning" 
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              />
            )}
            
            {!typedGoal.achieved && new Date(typedGoal.targetDate) < new Date() && (
              <Chip 
                label="Overdue" 
                color="error" 
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
          
          {typedGoal.notes && (
            <Box mt={3}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Notes
              </Typography>
              <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                {typedGoal.notes}
              </Typography>
            </Box>
          )}
          
          <Box mt={3}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Created
            </Typography>
            <Typography variant="body1">
              {formatDate(typedGoal.createdAt)}
            </Typography>
          </Box>
          
          {typedGoal.updatedAt && (
            <Box mt={3}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Last Updated
              </Typography>
              <Typography variant="body1">
                {formatDate(typedGoal.updatedAt)}
              </Typography>
            </Box>
          )}
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
            <Box position="relative" display="inline-flex" sx={{ width: 200, height: 200 }}>
              <CircularProgress
                variant="determinate"
                value={typedGoal.progress || 0}
                size={200}
                thickness={4}
                color={typedGoal.achieved ? "success" : "primary"}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h3" component="div" color="text.secondary">
                  {typedGoal.progress || 0}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="h6" align="center" sx={{ mt: 2 }}>
              {typedGoal.achieved ? 'Completed' : 'Progress'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      {/* Progress Chart Section */}
      <Box mt={4}>
        <Typography variant="h5" component="h2" gutterBottom>
          Progress Over Time
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Paper sx={{ p: 2, height: 300 }} elevation={2}>
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={progressData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tickCount={6} 
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: 'Progress (%)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' } 
                  }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Progress']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="progress" 
                  name="Progress" 
                  stroke={typedGoal.achieved ? "#4caf50" : "#1976d2"} 
                  fill={typedGoal.achieved ? "rgba(76, 175, 80, 0.2)" : "rgba(25, 118, 210, 0.2)"} 
                  activeDot={{ r: 8 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography variant="body1" color="text.secondary">
                No progress data available
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
      
      <Box display="flex" justifyContent="flex-start" mt={4}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
        >
          Back to Goals
        </Button>
      </Box>
    </Paper>
  );
};

export default GoalDetail; 