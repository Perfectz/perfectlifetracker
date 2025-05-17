import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  InputLabel
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { getJournalEntry } from '../../services/journals/journalApi';
import { JournalEntry, JournalEntryCreateDTO, JournalEntryUpdateDTO } from '../../types/journal';
import { useCreateJournalEntry, useUpdateJournalEntry } from '../../hooks/useJournals';
import JournalHeader from './JournalHeader';

interface JournalEditorProps {
  mode: 'create' | 'edit';
  onSave?: (entry: JournalEntry) => void;
  onCancel?: () => void;
  initialEntry?: JournalEntry;
}

const JournalEditor: React.FC<JournalEditorProps> = ({ mode, onSave, onCancel, initialEntry }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(mode === 'edit' && !initialEntry);
  const [content, setContent] = useState(initialEntry?.content || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialEntry?.tags || []);
  const [mood, setMood] = useState(initialEntry?.mood || '');
  
  // Use React Query hooks
  const { 
    mutate: createEntry, 
    isPending: isCreating,
    error: createError
  } = useCreateJournalEntry();
  
  const { 
    mutate: updateEntry, 
    isPending: isUpdating,
    error: updateError
  } = useUpdateJournalEntry();
  
  // Set error message based on React Query error
  const error = (mode === 'create' ? createError : updateError) 
    ? 'Failed to save journal entry' 
    : '';
  
  // Determine if saving (either create or update)
  const saving = isCreating || isUpdating;

  useEffect(() => {
    const fetchJournalEntry = async () => {
      if (mode === 'create' || initialEntry) return;
      
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getJournalEntry(id);
        setContent(data.content || '');
        setTags(data.tags || []);
        setMood(data.mood || '');
        setLoading(false);
      } catch (err) {
        console.error('Error loading journal entry:', err);
        setLoading(false);
      }
    };

    if (mode === 'edit' && !initialEntry) {
      fetchJournalEntry();
    }
  }, [id, mode, initialEntry]);

  const handleTagInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  }, [tagInput, tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }, [tags]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    if (mode === 'create') {
      const newEntry: JournalEntryCreateDTO = {
        content,
        contentFormat: 'plain',
        tags,
        mood
      };
      
      createEntry(newEntry, {
        onSuccess: (entry) => {
          if (onSave) onSave(entry);
          navigate('/journals');
        }
      });
    } else if (mode === 'edit') {
      const entryId = initialEntry?.id || id;
      
      if (!entryId) {
        console.error('Cannot update journal entry without ID');
        return;
      }
      
      const updatedEntry: JournalEntryUpdateDTO = {
        content,
        contentFormat: 'plain',
        tags,
        mood
      };
      
      updateEntry({ 
        id: entryId, 
        updates: updatedEntry 
      }, {
        onSuccess: (entry) => {
          if (onSave) onSave(entry);
          navigate(`/journals/${entryId}`);
        }
      });
    }
  }, [content, createEntry, id, initialEntry, mode, mood, navigate, onSave, tags, updateEntry]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <JournalHeader
          mode={mode}
          title={mode === 'create' ? 'Create New Journal Entry' : 'Edit Journal Entry'}
          onCancel={onCancel}
          journalId={id}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={2} sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Content"
              multiline
              rows={10}
              fullWidth
              value={content}
              onChange={(e) => setContent(e.target.value)}
              margin="normal"
              placeholder="Write your thoughts here..."
              required
            />

            <Box mt={3}>
              <TextField
                label="Mood (optional)"
                fullWidth
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                margin="normal"
                placeholder="How are you feeling?"
              />
            </Box>

            <Box mt={3}>
              <InputLabel htmlFor="tag-input">Tags (press Enter after each tag)</InputLabel>
              <TextField
                id="tag-input"
                fullWidth
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                margin="normal"
                placeholder="Enter tags..."
              />
              
              <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                  />
                ))}
              </Box>
            </Box>

            <Box mt={4} display="flex" justifyContent="flex-end">
              {saving && <CircularProgress size={24} sx={{ mr: 2 }} />}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={saving || !content.trim()}
                aria-label="save"
              >
                {saving ? 'Saving...' : 'Save Journal Entry'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default JournalEditor; 