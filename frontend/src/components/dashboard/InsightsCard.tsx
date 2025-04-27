// frontend/src/components/dashboard/InsightsCard.tsx
// Component for displaying analytics metrics and AI summary

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Skeleton,
  Box,
  Tooltip,
  Alert,
  useTheme
} from '@mui/material';
import {
  ShowChart as ChartIcon,
  Insights as InsightsIcon,
  LocalFireDepartment as CalorieIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import useAnalytics from '../../hooks/useAnalytics';
import useFitnessSummary from '../../hooks/useFitnessSummary';

interface InsightsCardProps {
  startDate?: Date;
  endDate?: Date;
}

interface MetricItemProps {
  icon: React.ReactElement;
  label: string;
  value: string | number;
  isLoading?: boolean;
  color?: string;
}

// MetricItem component for rendering individual metrics
const MetricItem: React.FC<MetricItemProps> = ({
  icon,
  label,
  value,
  isLoading = false,
  color
}) => {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        '&:last-child': { mb: 0 }
      }}
      aria-label={`${label}: ${value}`}
    >
      {React.cloneElement(icon, { 
        sx: { 
          mr: 1.5, 
          color: color || theme.palette.primary.main
        },
        "aria-hidden": "true" // Decorative icon, not needed for screen readers
      })}
      <Box>
        <Typography variant="body2" color="text.secondary" component="span">
          {label}
        </Typography>
        {isLoading ? (
          <Skeleton width={80} height={24} animation="wave" />
        ) : (
          <Typography variant="body1" fontWeight="medium" component="div">
            {value}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const InsightsCard: React.FC<InsightsCardProps> = ({ startDate, endDate }) => {
  // Fetch analytics data
  const { 
    data: analyticsData, 
    isLoading: isAnalyticsLoading,
    error: analyticsError
  } = useAnalytics({ startDate, endDate });
  
  // Fetch AI fitness summary
  const { 
    data: summaryData, 
    isLoading: isSummaryLoading,
    error: summaryError
  } = useFitnessSummary({ startDate, endDate });

  // Format numerical values for display
  const formattedMetrics = useMemo(() => {
    if (!analyticsData) return null;
    
    return {
      totalDuration: `${analyticsData.totalDuration || 0} mins`,
      totalCalories: (analyticsData.totalCalories || 0).toLocaleString(),
      averageDurationPerDay: `${Math.round(analyticsData.averageDurationPerDay || 0)} mins/day`,
      averageCaloriesPerDay: Math.round(analyticsData.averageCaloriesPerDay || 0).toLocaleString()
    };
  }, [analyticsData]);

  // Determine if any data is loading
  const isLoading = isAnalyticsLoading || isSummaryLoading;
  
  // Handle error states
  const hasError = analyticsError || summaryError;
  const errorMessage = (analyticsError || summaryError)?.message || 'Failed to load data';

  // Date range text for display
  const dateRangeText = useMemo(() => {
    if (!startDate || !endDate) return 'Last 30 days';
    
    // Format dates to display as range
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const startDay = startDate.getDate();
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    const endDay = endDate.getDate();
    const year = endDate.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    }
    
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }, [startDate, endDate]);

  return (
    <Card 
      elevation={3}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InsightsIcon color="primary" sx={{ mr: 1.5 }} aria-hidden="true" />
          <Box>
            <Typography variant="h6" component="h2">
              Activity Insights
            </Typography>
            <Typography variant="caption" color="text.secondary" component="span">
              {dateRangeText}
            </Typography>
          </Box>
        </Box>

        {/* Error state */}
        {hasError && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            aria-live="assertive"
          >
            {errorMessage}
          </Alert>
        )}

        {/* Metrics Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }} role="group" aria-label="Activity Metrics">
          <Grid item xs={12} sm={6}>
            <MetricItem
              icon={<TimeIcon />}
              label="Total Activity Time"
              value={formattedMetrics?.totalDuration || '0 mins'}
              isLoading={isAnalyticsLoading}
              color="#3f51b5"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MetricItem
              icon={<CalorieIcon />}
              label="Total Calories Burned"
              value={formattedMetrics?.totalCalories || '0'}
              isLoading={isAnalyticsLoading}
              color="#e91e63"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MetricItem
              icon={<TimeIcon />}
              label="Average Time Per Day"
              value={formattedMetrics?.averageDurationPerDay || '0 mins/day'}
              isLoading={isAnalyticsLoading}
              color="#3f51b5"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MetricItem
              icon={<CalorieIcon />}
              label="Average Calories Per Day"
              value={formattedMetrics?.averageCaloriesPerDay || '0'}
              isLoading={isAnalyticsLoading}
              color="#e91e63"
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 2 }} />

        {/* AI Summary Section */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <ChartIcon color="info" sx={{ mr: 1 }} aria-hidden="true" />
            <Typography variant="subtitle1" component="h3">
              Your Fitness Summary
            </Typography>
          </Box>
          
          {isSummaryLoading ? (
            <Box role="status" aria-label="Loading fitness summary">
              <Skeleton animation="wave" height={20} width="90%" />
              <Skeleton animation="wave" height={20} width="95%" />
              <Skeleton animation="wave" height={20} width="85%" />
              <Skeleton animation="wave" height={20} width="90%" />
            </Box>
          ) : summaryData?.summary ? (
            <Typography variant="body2" color="text.secondary" component="div">
              {summaryData.summary}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" component="div">
              No fitness summary available. Log more activities to get personalized insights.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default InsightsCard; 