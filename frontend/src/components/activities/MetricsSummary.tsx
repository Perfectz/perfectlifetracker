// frontend/src/components/activities/MetricsSummary.tsx
// Component to display summary metrics for activities

import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  DirectionsRun as RunIcon,
  LocalFireDepartment as CalorieIcon,
  AccessTime as TimeIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Activity } from '../../services/activityService';

interface MetricsSummaryProps {
  activities: Activity[];
  isLoading: boolean;
}

// StatCard component to display individual metric
interface StatCardProps {
  icon: React.ReactNode;
  iconColor?: 'primary' | 'error' | 'success' | 'info';
  title: string;
  value: string | number;
  subtitle?: string;
  tooltip?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  iconColor = 'primary', 
  title, 
  value, 
  subtitle,
  tooltip
}) => (
  <Grid item xs={12} sm={6}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box component="span" aria-hidden="true">
        {React.cloneElement(icon as React.ReactElement, { color: iconColor, sx: { mr: 1 } })}
      </Box>
      <Typography variant="subtitle1">{title}</Typography>
    </Box>
    {tooltip ? (
      <Tooltip title={tooltip}>
        <Typography variant="h4" sx={{ fontWeight: 500 }} aria-label={`${value} ${subtitle || ''}`}>
          {value}
        </Typography>
      </Tooltip>
    ) : (
      <Typography variant="h4" sx={{ fontWeight: 500 }} aria-label={`${value} ${subtitle || ''}`}>
        {value}
      </Typography>
    )}
    {subtitle && (
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Grid>
);

const MetricsSummary: React.FC<MetricsSummaryProps> = ({ activities, isLoading }) => {
  // Step 2: Compute metrics with useMemo to avoid unnecessary recalculation
  const metrics = useMemo(() => {
    if (!activities || activities.length === 0) {
      return {
        totalDuration: 0,
        totalCalories: 0,
        avgDurationPerDay: 0,
        uniqueDays: 0
      };
    }

    // Total duration and calories
    const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0);
    const totalCalories = activities.reduce((sum, activity) => sum + activity.calories, 0);
    
    // Count unique days
    const uniqueDays = new Set(
      activities.map(activity => format(new Date(activity.date), 'yyyy-MM-dd'))
    ).size;
    
    // Average duration per day
    // Convert to number with 1 decimal place for more precise feedback
    const avgDurationPerDay = uniqueDays > 0 ? 
      Number((totalDuration / uniqueDays).toFixed(1)) : 0;
    
    return {
      totalDuration,
      totalCalories,
      avgDurationPerDay,
      uniqueDays
    };
  }, [activities]);

  // Step 3: Loading state
  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, minHeight: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={40} aria-label="Loading activity summary" />
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Activity Summary
      </Typography>
      
      {/* Step 4: Empty state when no activities to summarize */}
      {activities.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          No activities to summarize. Log some activities to see your stats.
        </Typography>
      ) : (
        /* Step 5: Render metrics cards in grid */
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <StatCard
            key="totalTime"
            icon={<TimeIcon />}
            iconColor="primary"
            title="Total Time"
            value={`${metrics.totalDuration} mins`}
            subtitle={
              metrics.totalDuration >= 60 
                ? `(${Math.floor(metrics.totalDuration / 60)} hours, ${metrics.totalDuration % 60} minutes)`
                : undefined
            }
          />
          
          <StatCard
            key="totalCalories"
            icon={<CalorieIcon />}
            iconColor="error"
            title="Total Calories"
            value={metrics.totalCalories.toLocaleString()}
            subtitle={`burned across ${activities.length} activities`}
          />
          
          <Grid item xs={12} key="divider">
            <Divider sx={{ my: 2 }} />
          </Grid>
          
          <StatCard
            key="avgDuration"
            icon={<RunIcon />}
            iconColor="success"
            title="Average Duration"
            value={`${metrics.avgDurationPerDay} mins/day`}
            tooltip={`${metrics.totalDuration} minutes across ${metrics.uniqueDays} days`}
          />
          
          <StatCard
            key="activeDays"
            icon={<CalendarIcon />}
            iconColor="info"
            title="Active Days"
            value={metrics.uniqueDays}
            subtitle="days with logged activities"
          />
        </Grid>
      )}
    </Paper>
  );
};

export default MetricsSummary; 