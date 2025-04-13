/**
 * frontend/src/pages/TestPage.tsx
 * Simple test page to verify rendering
 */
import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

const TestPage: React.FC = () => {
  const [counter, setCounter] = React.useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Test Page
        </Typography>
        <Typography variant="body1" paragraph>
          This is a simple test page to verify rendering is working.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => setCounter(prev => prev + 1)}
          >
            Click me: {counter}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default TestPage; 