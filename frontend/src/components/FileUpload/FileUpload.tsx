/**
 * frontend/src/components/FileUpload/FileUpload.tsx
 * Reusable file upload component with Azure Blob Storage integration
 */
import React, { useState, useRef, useCallback } from 'react';
import { 
  Box,
  Button,
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Paper,
  Alert,
  AlertTitle,
  LinearProgress
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { uploadFile, uploadMultipleFiles, deleteFile, ApiError, UploadProgressCallback } from '../../services/apiService';

// Generate a temporary ID for optimistic updates
const generateTempId = (): string => {
  return `temp-${Math.random().toString(36).substring(2, 11)}`;
};

export interface FileData {
  id: string;
  fileName: string;
  url: string;
  contentType: string;
  size: number;
  blobName: string;
  status?: 'pending' | 'uploading' | 'success' | 'error'; // for optimistic updates
  progress?: number; // for upload progress
  tempId?: string; // temporary ID for optimistic updates
  error?: string; // error message
}

interface FileUploadProps {
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  maxSize?: number; // in bytes
  category?: string;
  relatedEntityId?: string;
  onUploadComplete?: (files: FileData | FileData[]) => void;
  onUploadError?: (error: Error) => void;
  initialFiles?: FileData[];
  dropzoneText?: string;
  uploadButtonText?: string;
  showUploadButton?: boolean;
  autoUpload?: boolean;
  enableRetry?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  multiple = false,
  maxFiles = 5,
  accept = '*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  category,
  relatedEntityId,
  onUploadComplete,
  onUploadError,
  initialFiles = [],
  dropzoneText = 'Drag and drop files here or click to browse',
  uploadButtonText = 'Upload',
  showUploadButton = true,
  autoUpload = false,
  enableRetry = true,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>(initialFiles);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Create optimistic file entry
  const createOptimisticFile = (file: File): FileData => {
    const tempId = generateTempId();
    return {
      id: tempId,
      fileName: file.name,
      url: URL.createObjectURL(file),
      contentType: file.type,
      size: file.size,
      blobName: file.name,
      status: 'pending',
      progress: 0,
      tempId
    };
  };

  // Update file progress
  const updateFileProgress = (tempId: string, progress: number) => {
    setUploadedFiles(prev => 
      prev.map(file => 
        file.tempId === tempId 
          ? { ...file, progress, status: 'uploading' } 
          : file
      )
    );
  };

  // Update file status
  const updateFileStatus = (tempId: string, status: 'success' | 'error', actualFile?: FileData, errorMessage?: string) => {
    setUploadedFiles(prev => 
      prev.map(file => {
        if (file.tempId === tempId) {
          if (status === 'success' && actualFile) {
            return { 
              ...actualFile, 
              status: 'success', 
              progress: 100, 
              tempId 
            };
          } else if (status === 'error') {
            // Format error message to be more user-friendly
            let userFriendlyError = errorMessage || 'Upload failed';
            
            // Map common error codes to user-friendly messages
            if (errorMessage?.includes('403')) {
              userFriendlyError = 'Permission denied. You may not have access to upload to this location.';
            } else if (errorMessage?.includes('413')) {
              userFriendlyError = 'File is too large for the server to accept.';
            } else if (errorMessage?.includes('415')) {
              userFriendlyError = 'File type is not supported by the server.';
            } else if (errorMessage?.includes('429')) {
              userFriendlyError = 'Too many upload requests. Please try again in a moment.';
            } else if (errorMessage?.includes('network error')) {
              userFriendlyError = 'Network error. Please check your internet connection and try again.';
            } else if (errorMessage?.includes('timeout')) {
              userFriendlyError = 'Request timed out. The file might be too large or your connection is slow.';
            }
            
            return { 
              ...file, 
              status: 'error', 
              error: userFriendlyError
            };
          }
        }
        return file;
      })
    );
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    
    const fileArray = Array.from(event.target.files);
    validateAndSetFiles(fileArray);
    
    // Reset the input value so the same file can be selected again
    if (event.target) {
      event.target.value = '';
    }
  };

  // Validate files before setting them
  const validateAndSetFiles = (files: File[]) => {
    setError(null);
    
    // Check number of files
    if (multiple && files.length > maxFiles) {
      setError(`You can upload a maximum of ${maxFiles} files`);
      return;
    }
    
    // Check file size and type
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is ${formatFileSize(maxSize)}`);
        return false;
      }
      
      if (accept !== '*' && !accept.split(',').some(type => {
        return type.trim() === file.type || 
               (type.includes('/*') && file.type.startsWith(type.split('/*')[0]));
      })) {
        setError(`File ${file.name} is not an accepted file type`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      
      // Auto upload if enabled
      if (autoUpload) {
        // Add optimistic updates first
        const optimisticFiles = validFiles.map(createOptimisticFile);
        setUploadedFiles(prev => [...prev, ...optimisticFiles]);
        setSelectedFiles([]);
        
        // Then start the actual upload
        handleUploadWithOptimistic(validFiles, optimisticFiles);
      }
    }
  };

  // Handle drag events
  const handleDrag = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    
    if (event.dataTransfer.files.length > 0) {
      const fileArray = Array.from(event.dataTransfer.files);
      validateAndSetFiles(fileArray);
    }
  }, [autoUpload]);

  // Trigger file input click
  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Upload files with optimistic updates
  const handleUploadWithOptimistic = async (filesToUpload: File[], optimisticFiles: FileData[]) => {
    setIsUploading(true);
    setError(null);
    
    try {
      if (multiple) {
        const uploadPromise = uploadMultipleFiles(
          filesToUpload, 
          category, 
          relatedEntityId,
          (progress) => {
            // Update progress for all files
            optimisticFiles.forEach(file => {
              updateFileProgress(file.tempId!, progress);
            });
          }
        );
        
        const result = await uploadPromise;
        const newFiles = result.files;
        
        // Update optimistic files with real data
        optimisticFiles.forEach((optimisticFile, index) => {
          if (index < newFiles.length) {
            updateFileStatus(optimisticFile.tempId!, 'success', newFiles[index]);
          }
        });
        
        if (onUploadComplete) onUploadComplete(newFiles);
      } else {
        const optimisticFile = optimisticFiles[0];
        const file = filesToUpload[0];
        
        const uploadPromise = uploadFile(
          file, 
          category, 
          relatedEntityId,
          (progress) => {
            updateFileProgress(optimisticFile.tempId!, progress);
          }
        );
        
        const result = await uploadPromise;
        const newFile = result.file;
        
        // Update optimistic file with real data
        updateFileStatus(optimisticFile.tempId!, 'success', newFile);
        
        if (onUploadComplete) onUploadComplete(newFile);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during upload';
      
      // Check for circuit breaker errors
      if (err.status === 503 && errorMessage.includes('temporarily unavailable')) {
        setError(`${errorMessage} The system has detected multiple failures and is preventing further attempts to protect resources. Please try again in 30 seconds.`);
      } else {
        setError(errorMessage);
      }
      
      // Update optimistic files with error status
      optimisticFiles.forEach(file => {
        updateFileStatus(file.tempId!, 'error', undefined, errorMessage);
      });
      
      if (onUploadError) onUploadError(err);
    } finally {
      setIsUploading(false);
    }
  };

  // Upload selected files (non-optimistic version for manual upload)
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    // Create optimistic updates
    const optimisticFiles = selectedFiles.map(createOptimisticFile);
    setUploadedFiles(prev => [...prev, ...optimisticFiles]);
    
    // Clear selected files
    const filesToUpload = [...selectedFiles];
    setSelectedFiles([]);
    
    // Start the actual upload
    await handleUploadWithOptimistic(filesToUpload, optimisticFiles);
  };

  // Retry failed upload
  const handleRetryUpload = async (fileData: FileData) => {
    // Find the original file in the uploaded files
    const fileToRetry = uploadedFiles.find(f => f.id === fileData.id);
    if (!fileToRetry) return;
    
    // Create a new file object from the blob URL
    try {
      const response = await fetch(fileToRetry.url);
      const blob = await response.blob();
      const file = new File([blob], fileToRetry.fileName, { type: fileToRetry.contentType });
      
      // Reset the file status to pending
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'pending', progress: 0, error: undefined } 
            : f
        )
      );
      
      // Start upload with the retry
      await handleUploadWithOptimistic([file], [fileToRetry]);
    } catch (err) {
      console.error('Failed to retry upload:', err);
      setError('Failed to retry upload. Please try again.');
    }
  };

  // Handle file deletion
  const handleDeleteFile = async (fileId: string) => {
    // If it's a temporary file (not yet uploaded to server)
    const fileToDelete = uploadedFiles.find(file => file.id === fileId);
    
    if (fileToDelete?.tempId && (fileToDelete.status === 'pending' || fileToDelete.status === 'error')) {
      // Just remove it from the UI for optimistic files that failed or are pending
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      return;
    }
    
    try {
      // Optimistically remove the file from UI first
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      
      // Then attempt the server deletion
      await deleteFile(fileId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete file');
      
      // Add the file back if deletion fails
      if (fileToDelete) {
        setUploadedFiles(prev => [...prev, fileToDelete]);
      }
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Dropzone area */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          backgroundColor: dragActive ? 'action.hover' : 'background.paper',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.light',
            backgroundColor: 'action.hover',
          },
        }}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="body1" gutterBottom>
          {dropzoneText}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Maximum file size: {formatFileSize(maxSize)}
        </Typography>
        {accept !== '*' && (
          <Typography variant="body2" color="textSecondary">
            Accepted file types: {accept}
          </Typography>
        )}
      </Paper>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Selected Files ({selectedFiles.length})
          </Typography>
          <List>
            {selectedFiles.map((file, index) => (
              <ListItem
                key={`${file.name}-${index}`}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}
              >
                <ListItemIcon>
                  <AttachFileIcon />
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={formatFileSize(file.size)}
                />
              </ListItem>
            ))}
          </List>
          {showUploadButton && !autoUpload && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={isUploading}
              startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ mt: 1 }}
            >
              {isUploading ? 'Uploading...' : uploadButtonText}
            </Button>
          )}
        </Box>
      )}

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Files ({uploadedFiles.length})
          </Typography>
          <List>
            {uploadedFiles.map((file) => (
              <ListItem
                key={file.id}
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {file.status === 'error' && enableRetry && (
                      <IconButton
                        edge="end"
                        aria-label="retry"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetryUpload(file);
                        }}
                        sx={{ mr: 1 }}
                      >
                        <RefreshIcon />
                      </IconButton>
                    )}
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
                sx={{ 
                  border: '1px solid', 
                  borderColor: file.status === 'error' ? 'error.light' : 'divider', 
                  borderRadius: 1, 
                  mb: 1,
                  backgroundColor: file.status === 'error' ? 'error.lightest' : 'background.paper',
                }}
              >
                <ListItemIcon>
                  {file.status === 'success' ? <CheckCircleIcon color="success" /> : <FileIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" component="span">
                        {file.fileName}
                      </Typography>
                      {file.status === 'uploading' && (
                        <Typography variant="body2" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                          ({file.progress}%)
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ width: '100%' }}>
                      {file.status === 'uploading' ? (
                        <LinearProgress 
                          variant="determinate" 
                          value={file.progress} 
                          sx={{ mt: 1, height: 4, borderRadius: 2 }} 
                        />
                      ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="body2" component="span">
                            {formatFileSize(file.size)}
                          </Typography>
                          {file.status === 'error' && (
                            <Typography variant="body2" component="span" color="error">
                              {file.error || 'Failed to upload'}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload; 