// frontend/src/components/activities/ActivitiesPage.tsx
// Main activities page integrating all activity components

import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

import ActivityList from './ActivityList';
import MetricsSummary from './MetricsSummary';
import { useActivities } from '../../hooks/useActivities';

const ActivitiesPage: React.FC = () => {
  // Fetch activities for metrics summary (no filters)
  const { data, isLoading } = useActivities();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Activities
        </Typography>
        
        <Button
          component={Link}
          to="/activities/new"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Log Activity
        </Button>
      </Box>
      
      {/* Metrics summary */}
      <MetricsSummary 
        activities={data?.items || []} 
        isLoading={isLoading} 
      />
      
      {/* Activity list with filters */}
      <ActivityList />
    </Container>
  );
};

export default ActivitiesPage; 