import React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import JournalList from './JournalList';
import JournalEditor from './JournalEditor';
import MoodChart from './MoodChart';
import { useJournalEntries } from '../../hooks/useJournals';
import { useNavigate } from 'react-router-dom';
import { JournalEntry } from '../../types/journal';

const JournalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useJournalEntries();

  // Handle API errors at the dashboard level
  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert 
          severity="error" 
          sx={{ my: 4 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        >
          Error loading journal data: {(error as Error).message}
        </Alert>
      </Container>
    );
  }

  // Display loading state
  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" my={8}>
          <CircularProgress size={60} sx={{ mb: 4 }} />
          <Typography variant="h6">
            Loading your journal...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Check if there are no journal entries
  const hasEntries = data && data.items && data.items.length > 0;

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Journal
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/journals/new')}
          data-testid="new-journal-button"
        >
          New Entry
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <JournalEditor 
            mode="create"
            onSave={(entry: JournalEntry) => navigate(`/journals/${entry.id}`)}
          />
        </Grid>
        
        <Grid item xs={12} md={hasEntries ? 6 : 12}>
          <JournalList 
            onSelectEntry={(entryId) => navigate(entryId)}
          />
        </Grid>
        
        {hasEntries && (
          <Grid item xs={12} md={6}>
            <MoodChart />
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default JournalDashboard; 