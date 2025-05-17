import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import { 
  SentimentSatisfiedAlt as HappyIcon,
  SentimentNeutral as NeutralIcon,
  SentimentVeryDissatisfied as SadIcon
} from '@mui/icons-material';
import { useJournalEntries } from '../../hooks/useJournals';
import { JournalEntry } from '../../types/journal';
import { format } from 'date-fns';

interface JournalListProps {
  onSelectEntry?: (id: string) => void;
}

const JournalList: React.FC<JournalListProps> = ({ onSelectEntry }) => {
  const { data, isLoading, error } = useJournalEntries();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        Error loading journal entries: {(error as Error).message}
      </Alert>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No journal entries found. Start writing to see entries here.
      </Alert>
    );
  }

  // Function to render sentiment icon based on score
  const renderSentimentIcon = (score: number) => {
    if (score >= 0.6) {
      return <HappyIcon color="success" data-testid="SentimentVerySatisfiedIcon" />;
    } else if (score >= 0.4) {
      return <NeutralIcon color="info" data-testid="SentimentNeutralIcon" />;
    } else {
      return <SadIcon color="error" data-testid="SentimentVeryDissatisfiedIcon" />;
    }
  };

  // Function to generate a short preview of content
  const getContentPreview = (content: string) => {
    return content.length > 100 ? `${content.substring(0, 100)}...` : content;
  };

  return (
    <Paper elevation={2} sx={{ mb: 3 }}>
      <Box p={2}>
        <Typography variant="h6" component="h2" gutterBottom>
          Your Journal Entries
        </Typography>
        <List>
          {data.items.map((entry: JournalEntry) => (
            <ListItem 
              key={entry.id}
              divider 
              button
              onClick={() => onSelectEntry && onSelectEntry(entry.id)}
              sx={{ 
                display: 'flex',
                alignItems: 'flex-start',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
              }}
            >
              <Box sx={{ mr: 2, mt: 1 }}>
                {renderSentimentIcon(entry.sentimentScore)}
              </Box>
              <ListItemText
                primary={
                  <Typography variant="subtitle1">
                    {format(new Date(entry.date), 'MMM d, yyyy')}
                  </Typography>
                }
                secondary={
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {getContentPreview(entry.content)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default JournalList; 