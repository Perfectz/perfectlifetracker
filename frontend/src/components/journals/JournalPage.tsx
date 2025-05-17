import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getJournalEntries } from '../../services/journals/journalApi';
import { JournalEntry } from '../../types/journal';
import JournalList from './JournalList';
import SearchPanel from './SearchPanel';

// A simple page that doesn't rely on any complex data fetching or components
const JournalPage: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEntryId, setSelectedEntryId] = React.useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const response = await getJournalEntries();
        setEntries(response.items || []);
        setError('');
      } catch (err) {
        console.error('Error fetching journal entries:', err);
        setError('Failed to load journal entries');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const handleSelectEntry = (entryId: string) => {
    setSelectedEntryId(entryId);
    navigate(`/journals/${entryId}`);
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Journal Page
        </Typography>
        <Typography variant="body1" paragraph>
          Record your thoughts, track your mood, and gain insights from your journal entries.
        </Typography>
        
        <Box mt={3} mb={4}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/journals/new')}
            sx={{ mr: 2 }}
          >
            Create New Entry
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => navigate('/journals/insights')}
            sx={{ mr: 2 }}
          >
            View Insights
          </Button>
        </Box>

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          <Box flex={1}>
            <SearchPanel onSelectEntry={handleSelectEntry} />
          </Box>
          <Box flex={2}>
            <JournalList onSelectEntry={handleSelectEntry} />
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default JournalPage; 