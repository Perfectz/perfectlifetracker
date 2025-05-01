// frontend/src/components/activities/EditActivityPage.tsx
// Page for editing an existing activity

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Button, CircularProgress, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import ActivityForm from './ActivityForm';
import { useActivity } from '../../hooks/useActivities';

const EditActivityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: activity, isLoading, isError, error } = useActivity(id);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          to="/activities"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Activities
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Activity
        </Typography>
      </Box>

      {isLoading && (
        <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Paper>
      )}

      {isError && (
        <Paper sx={{ p: 3 }}>
          <Typography color="error">
            Error loading activity: {(error as Error).message || 'Unknown error'}
          </Typography>
          <Button
            component={Link}
            to="/activities"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Return to Activities
          </Button>
        </Paper>
      )}

      {!isLoading && !isError && activity && (
        <ActivityForm activity={activity} />
      )}
    </Container>
  );
};

export default EditActivityPage; 