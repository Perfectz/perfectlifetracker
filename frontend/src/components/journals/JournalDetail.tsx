// frontend/src/components/journals/JournalDetail.tsx
// Component to display a single journal entry with its sentiment analysis

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Chip,
  Button,
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';
import { Edit as EditIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { getJournalEntry } from '../../services/journals/journalApi';
import { JournalEntry } from '../../types/journal';

const JournalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJournalEntry = async () => {
      if (!id) {
        setError('No journal ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getJournalEntry(id);
        setEntry(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading journal entry:', err);
        setError('Error loading journal entry');
        setLoading(false);
      }
    };

    fetchJournalEntry();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box my={4}>
          <Alert severity="error">{error}</Alert>
          <Box mt={2}>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBackIcon />} 
              onClick={() => navigate('/journals')}
            >
              Back to Journals
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  if (!entry) {
    return (
      <Container maxWidth="md">
        <Box my={4}>
          <Alert severity="info">Journal entry not found</Alert>
          <Box mt={2}>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/journals')}
            >
              Back to Journals
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/journals')}
          >
            Back to Journals
          </Button>
          
          <Button 
            variant="contained" 
            startIcon={<EditIcon />}
            onClick={() => navigate(`/journals/edit/${id}`)}
          >
            Edit Entry
          </Button>
        </Box>

        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="caption" color="text.secondary">
            {formatDate(entry.createdAt)}
          </Typography>
          
          <Box my={2}>
            <Typography variant="body1" component="div" whiteSpace="pre-wrap">
              {entry.content}
            </Typography>
          </Box>
          
          {entry.tags && entry.tags.length > 0 && (
            <Box mt={3}>
              <Divider sx={{ mb: 2 }} />
              {entry.tags.map((tag, index) => (
                <Chip 
                  key={index} 
                  label={tag} 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }} 
                />
              ))}
            </Box>
          )}
          
          {entry.mood && (
            <Box mt={2}>
              <Typography variant="body2">
                <strong>Mood:</strong> {entry.mood}
              </Typography>
            </Box>
          )}
          
          {entry.sentimentScore !== undefined && (
            <Box mt={1}>
              <Typography variant="body2">
                <strong>Sentiment Score:</strong> {entry.sentimentScore.toFixed(2)}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default JournalDetail; 