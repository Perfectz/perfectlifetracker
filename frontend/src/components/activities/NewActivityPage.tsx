// frontend/src/components/activities/NewActivityPage.tsx
// Page for creating a new activity

import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import ActivityForm from './ActivityForm';

const NewActivityPage: React.FC = () => {
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
          Log New Activity
        </Typography>
      </Box>

      <ActivityForm />
    </Container>
  );
};

export default NewActivityPage; 