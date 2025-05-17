// frontend/src/components/journals/JournalEntryForm.tsx
// Form component for creating and editing journal entries with markdown support

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  FormControl, 
  FormControlLabel, 
  RadioGroup, 
  Radio, 
  Paper, 
  Tabs, 
  Tab,
  Chip,
  Stack,
  IconButton,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import SimpleMDE from 'react-simplemde-editor';
import ReactMarkdown from 'react-markdown';
import 'easymde/dist/easymde.min.css';
import { JournalEntry, JournalEntryCreateDTO, JournalEntryUpdateDTO, Attachment } from '../../types/journal';
import AttachmentGallery from './AttachmentGallery';

interface JournalEntryFormProps {
  initialValues?: Partial<JournalEntry>;
  onSubmit: (data: JournalEntryCreateDTO | JournalEntryUpdateDTO) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  availableTags?: string[];
}

const JournalEntryForm: React.FC<JournalEntryFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  availableTags = [],
}) => {
  const [content, setContent] = useState(initialValues?.content || '');
  const [contentFormat, setContentFormat] = useState<'plain' | 'markdown'>(
    initialValues?.contentFormat || 'plain'
  );
  const [date, setDate] = useState<Date | null>(
    initialValues?.date ? new Date(initialValues.date) : new Date()
  );
  const [attachments, setAttachments] = useState<Attachment[]>(
    initialValues?.attachments || []
  );
  const [tags, setTags] = useState<string[]>(initialValues?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [editorTab, setEditorTab] = useState(0);
  
  // Reset form if initialValues changes
  useEffect(() => {
    if (initialValues) {
      setContent(initialValues.content || '');
      setContentFormat(initialValues.contentFormat || 'plain');
      setDate(initialValues.date ? new Date(initialValues.date) : new Date());
      setAttachments(initialValues.attachments || []);
      setTags(initialValues.tags || []);
    }
  }, [initialValues]);
  
  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };
  
  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };
  
  const handleAddAttachment = (attachment: Attachment) => {
    setAttachments([...attachments, attachment]);
  };
  
  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter((a) => a.id !== attachmentId));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return; // Don't submit empty content
    }
    
    const journalData: JournalEntryCreateDTO | JournalEntryUpdateDTO = {
      content,
      contentFormat,
      date: date?.toISOString(),
      attachments,
      tags: tags.length > 0 ? tags : undefined,
    };
    
    onSubmit(journalData);
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Format</Typography>
        <RadioGroup
          row
          value={contentFormat}
          onChange={(e) => setContentFormat(e.target.value as 'plain' | 'markdown')}
        >
          <FormControlLabel value="plain" control={<Radio />} label="Plain Text" />
          <FormControlLabel value="markdown" control={<Radio />} label="Markdown" />
        </RadioGroup>
      </FormControl>
      
      <DatePicker 
        label="Date"
        value={date}
        onChange={(newDate: Date | null) => setDate(newDate)}
        renderInput={(params) => <TextField {...params} fullWidth margin="normal" sx={{ mb: 2 }} />}
      />
      
      {contentFormat === 'markdown' ? (
        <Box sx={{ mb: 3 }}>
          <Paper variant="outlined" sx={{ mb: 2 }}>
            <Tabs
              value={editorTab}
              onChange={(_, newValue) => setEditorTab(newValue)}
              aria-label="markdown editor tabs"
            >
              <Tab label="Write" />
              <Tab label="Preview" />
            </Tabs>
            
            <Box sx={{ p: 2 }}>
              {editorTab === 0 ? (
                <SimpleMDE
                  value={content}
                  onChange={setContent}
                  options={{
                    spellChecker: true,
                    placeholder: 'Write your journal entry here...',
                    status: false,
                    autoDownloadFontAwesome: false,
                    autosave: {
                      enabled: true,
                      uniqueId: 'journal-entry',
                      delay: 1000,
                    },
                  }}
                />
              ) : (
                <Box sx={{ minHeight: '300px', p: 2 }}>
                  {content ? (
                    <ReactMarkdown>{content}</ReactMarkdown>
                  ) : (
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No content to preview
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      ) : (
        <TextField
          fullWidth
          label="Journal Content"
          multiline
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your journal entry here..."
          variant="outlined"
          sx={{ mb: 3 }}
        />
      )}
      
      <AttachmentGallery
        attachments={attachments}
        onAddAttachment={handleAddAttachment}
        onRemoveAttachment={handleRemoveAttachment}
        disabled={isLoading}
      />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Tags</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleDeleteTag(tag)}
              disabled={isLoading}
              size="small"
            />
          ))}
        </Stack>
        
        <Autocomplete
          freeSolo
          options={availableTags.filter(tag => !tags.includes(tag))}
          inputValue={newTag}
          onInputChange={(_, value) => setNewTag(value)}
          disabled={isLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Add a tag"
              size="small"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {params.InputProps.endAdornment}
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={handleAddTag}
                        disabled={!newTag.trim() || isLoading}
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  </>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
          )}
        />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {onCancel && (
          <Button onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          variant="contained" 
          disabled={!content.trim() || isLoading}
        >
          {initialValues?.id ? 'Update' : 'Create'} Journal Entry
        </Button>
      </Box>
    </Box>
  );
};

export default JournalEntryForm; 