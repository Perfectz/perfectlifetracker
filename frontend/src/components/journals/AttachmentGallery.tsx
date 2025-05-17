// frontend/src/components/journals/AttachmentGallery.tsx
// Gallery component for displaying and managing attachments

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { Attachment } from '../../types/journal';
import { useUploadAttachment } from '../../hooks/useJournals';

interface AttachmentGalleryProps {
  attachments: Attachment[];
  onAddAttachment: (attachment: Attachment) => void;
  onRemoveAttachment: (attachmentId: string) => void;
  maxFiles?: number;
  disabled?: boolean;
}

const AttachmentGallery: React.FC<AttachmentGalleryProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  maxFiles = 10,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const uploadAttachmentMutation = useUploadAttachment();
  
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit');
      return;
    }
    
    // Check file type (only images for now)
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are allowed');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const attachment = await uploadAttachmentMutation.mutateAsync(file);
      onAddAttachment(attachment);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('File upload failed:', error);
      setUploadError('File upload failed');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Helper function to get appropriate thumbnail for attachment
  const getThumbnail = (attachment: Attachment) => {
    if (attachment.contentType.startsWith('image/')) {
      return attachment.url;
    }
    
    // For other file types, use appropriate icons (could be expanded)
    return '/assets/file-icon.png';
  };
  
  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Attachments</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleFileSelect}
          disabled={disabled || attachments.length >= maxFiles || isUploading}
        >
          Add Attachment
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept="image/*"
        />
      </Box>
      
      {uploadError && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {uploadError}
        </Typography>
      )}
      
      {isUploading && (
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <CircularProgress size={24} />
          <Typography>Uploading...</Typography>
        </Box>
      )}
      
      {attachments.length > 0 ? (
        <Grid container spacing={2}>
          {attachments.map((attachment) => (
            <Grid item key={attachment.id} xs={12} sm={6} md={4} lg={3}>
              <Card variant="outlined">
                <CardMedia
                  component="img"
                  height="140"
                  image={getThumbnail(attachment)}
                  alt={attachment.fileName}
                  sx={{ objectFit: 'contain', bgcolor: 'background.default' }}
                />
                <CardContent sx={{ py: 1 }}>
                  <Tooltip title={attachment.fileName}>
                    <Typography noWrap variant="body2">
                      {attachment.fileName}
                    </Typography>
                  </Tooltip>
                  <Typography variant="caption" color="text.secondary">
                    {(attachment.size / 1024).toFixed(1)} KB
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => onRemoveAttachment(attachment.id)}
                    disabled={disabled}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            p: 3,
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography color="text.secondary">
            No attachments yet. Click "Add Attachment" to upload an image.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AttachmentGallery; 