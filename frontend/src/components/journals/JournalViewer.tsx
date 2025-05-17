// frontend/src/components/journals/JournalViewer.tsx
// Component to display a journal entry with markdown and attachments

import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import { 
  SentimentVerySatisfied as HappyIcon, 
  SentimentSatisfied as NeutralIcon, 
  SentimentVeryDissatisfied as SadIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { JournalEntry, Attachment } from '../../types/journal';

interface JournalViewerProps {
  entry: JournalEntry;
  onEdit?: () => void;
  onDelete?: () => void;
}

const JournalViewer: React.FC<JournalViewerProps> = ({ entry, onEdit, onDelete }) => {
  // Function to render the correct sentiment icon based on the score
  const renderSentimentIcon = () => {
    if (entry.sentimentScore >= 0.6) {
      return (
        <Tooltip title={`Positive sentiment (${Math.round(entry.sentimentScore * 100)}%)`}>
          <HappyIcon 
            color="success" 
            data-testid="SentimentVerySatisfiedIcon"
          />
        </Tooltip>
      );
    } else if (entry.sentimentScore >= 0.4) {
      return (
        <Tooltip title={`Neutral sentiment (${Math.round(entry.sentimentScore * 100)}%)`}>
          <NeutralIcon 
            color="info" 
            data-testid="SentimentNeutralIcon"
          />
        </Tooltip>
      );
    } else {
      return (
        <Tooltip title={`Negative sentiment (${Math.round(entry.sentimentScore * 100)}%)`}>
          <SadIcon 
            color="error" 
            data-testid="SentimentVeryDissatisfiedIcon"
          />
        </Tooltip>
      );
    }
  };
  
  // Function to render attachments grid
  const renderAttachments = () => {
    if (!entry.attachments || entry.attachments.length === 0) {
      return null;
    }
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Attachments ({entry.attachments.length})
        </Typography>
        <Grid container spacing={2}>
          {entry.attachments.map((attachment: Attachment) => (
            <Grid item xs={12} sm={4} md={3} key={attachment.id}>
              <Card variant="outlined">
                {attachment.contentType.startsWith('image/') ? (
                  <CardMedia
                    component="img"
                    height="140"
                    image={attachment.url}
                    alt={attachment.fileName}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => window.open(attachment.url, '_blank')}
                  />
                ) : (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height={140}
                    bgcolor="action.hover"
                    onClick={() => window.open(attachment.url, '_blank')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {attachment.fileName}
                    </Typography>
                  </Box>
                )}
                <CardContent sx={{ py: 1 }}>
                  <Tooltip title={attachment.fileName}>
                    <Typography variant="body2" noWrap aria-label={attachment.fileName}>
                      {attachment.fileName}
                    </Typography>
                  </Tooltip>
                  <Typography variant="caption" color="text.secondary">
                    {(attachment.size / 1024).toFixed(1)} KB
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  
  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h5" component="h2">
            {format(new Date(entry.date), 'MMMM d, yyyy')}
          </Typography>
          {renderSentimentIcon()}
        </Box>
        
        <Box>
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton onClick={onEdit} size="small" sx={{ mr: 1 }} aria-label="Edit">
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton onClick={onDelete} size="small" color="error" aria-label="Delete">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5} mb={1}>
          <CalendarIcon fontSize="small" />
          Created: {format(new Date(entry.createdAt), 'PPp')}
          {entry.updatedAt !== entry.createdAt && ` (Updated: ${format(new Date(entry.updatedAt), 'PPp')})`}
        </Typography>
        
        {entry.tags && entry.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {entry.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Box>
        )}
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        {entry.contentFormat === 'markdown' ? (
          <ReactMarkdown>{entry.content}</ReactMarkdown>
        ) : (
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{entry.content}</Typography>
        )}
      </Box>
      
      {renderAttachments()}
    </Paper>
  );
};

export default JournalViewer; 