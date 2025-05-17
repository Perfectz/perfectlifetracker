import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface JournalHeaderProps {
  mode: 'create' | 'edit' | 'view';
  title: string;
  backPath?: string;
  onCancel?: () => void;
  journalId?: string;
}

const JournalHeader: React.FC<JournalHeaderProps> = ({
  mode,
  title,
  backPath,
  onCancel,
  journalId
}) => {
  const navigate = useNavigate();
  const buttonText = 'Cancel';
  
  const handleNavigation = () => {
    const path = backPath || (mode === 'create' ? '/journals' : `/journals/${journalId}`);
    navigate(path);
  };
  
  return (
    <Box display="flex" alignItems="center" mb={3}>
      {onCancel ? (
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onCancel}
          sx={{ mr: 2 }}
          aria-label="cancel"
        >
          {buttonText}
        </Button>
      ) : (
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleNavigation}
          sx={{ mr: 2 }}
          aria-label="cancel"
        >
          {buttonText}
        </Button>
      )}
      <Typography variant="h5">{title}</Typography>
    </Box>
  );
};

export default JournalHeader; 