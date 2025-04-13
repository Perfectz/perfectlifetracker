/**
 * frontend/src/pages/FileUploadDemo.tsx
 * Demo page showcasing file upload capabilities with Azure Blob Storage
 */
import React, { useState } from 'react';
import { Container, Typography, Paper, Box, Divider, Tabs, Tab, Alert } from '@mui/material';
import FileUpload, { FileData } from '../components/FileUpload';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`file-upload-tabpanel-${index}`}
      aria-labelledby={`file-upload-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const FileUploadDemo: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [uploadedSingleFile, setUploadedSingleFile] = useState<FileData | null>(null);
  const [uploadedMultipleFiles, setUploadedMultipleFiles] = useState<FileData[]>([]);
  const [uploadedImagesFiles, setUploadedImagesFiles] = useState<FileData[]>([]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSingleFileUpload = (fileData: FileData | FileData[]) => {
    if (!Array.isArray(fileData)) {
      setUploadedSingleFile(fileData);
      console.log('Single file uploaded:', fileData);
    }
  };

  const handleMultipleFilesUpload = (fileData: FileData | FileData[]) => {
    if (Array.isArray(fileData)) {
      setUploadedMultipleFiles(prev => [...prev, ...fileData]);
      console.log('Multiple files uploaded:', fileData);
    }
  };

  const handleImagesUpload = (fileData: FileData | FileData[]) => {
    if (Array.isArray(fileData)) {
      setUploadedImagesFiles(prev => [...prev, ...fileData]);
      console.log('Image files uploaded:', fileData);
    } else {
      setUploadedImagesFiles(prev => [...prev, fileData]);
      console.log('Image file uploaded:', fileData);
    }
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        File Upload Demo
      </Typography>
      <Typography variant="body1" paragraph>
        This page demonstrates file uploads to Azure Blob Storage using different configurations.
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="file upload demos">
            <Tab label="Single File Upload" id="file-upload-tab-0" />
            <Tab label="Multiple Files Upload" id="file-upload-tab-1" />
            <Tab label="Images Only" id="file-upload-tab-2" />
          </Tabs>
        </Box>

        {/* Single File Upload Example */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Single File Upload
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Upload a single file (max 10MB) to Azure Blob Storage.
          </Typography>

          <FileUpload
            multiple={false}
            category="demo"
            onUploadComplete={handleSingleFileUpload}
            onUploadError={handleUploadError}
            dropzoneText="Drop a file here or click to browse"
            uploadButtonText="Upload File"
          />

          {uploadedSingleFile && (
            <Alert severity="success" sx={{ mt: 3 }}>
              File uploaded successfully: {uploadedSingleFile.fileName} ({(uploadedSingleFile.size / 1024).toFixed(2)} KB)
            </Alert>
          )}
        </TabPanel>

        {/* Multiple Files Upload Example */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Multiple Files Upload
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Upload up to 5 files simultaneously (max 10MB each) to Azure Blob Storage.
          </Typography>

          <FileUpload
            multiple={true}
            maxFiles={5}
            category="multi-demo"
            onUploadComplete={handleMultipleFilesUpload}
            onUploadError={handleUploadError}
            dropzoneText="Drop up to 5 files here or click to browse"
            uploadButtonText="Upload Files"
          />

          {uploadedMultipleFiles.length > 0 && (
            <Alert severity="success" sx={{ mt: 3 }}>
              {uploadedMultipleFiles.length} files uploaded successfully
            </Alert>
          )}
        </TabPanel>

        {/* Images Only Upload Example */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Images Only Upload
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Upload image files (JPEG, PNG, GIF) to Azure Blob Storage.
          </Typography>

          <FileUpload
            multiple={true}
            maxFiles={10}
            accept="image/jpeg,image/png,image/gif"
            category="images"
            onUploadComplete={handleImagesUpload}
            onUploadError={handleUploadError}
            dropzoneText="Drop image files here or click to browse"
            uploadButtonText="Upload Images"
          />

          {uploadedImagesFiles.length > 0 && (
            <Alert severity="success" sx={{ mt: 3 }}>
              {uploadedImagesFiles.length} image files uploaded successfully
            </Alert>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default FileUploadDemo; 