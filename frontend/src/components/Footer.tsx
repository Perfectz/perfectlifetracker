/**
 * frontend/src/components/Footer.tsx
 * Footer component for the application
 */
import React from 'react';
import { Box, Typography, Link, useTheme } from '@mui/material';
import { terraColors } from '../theme';

const Footer: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        textAlign: 'center',
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="body2" color="textSecondary">
        © {new Date().getFullYear()} Perfect LifeTracker Pro. All rights reserved.
      </Typography>
      <Typography variant="body2">
        <Link href="/privacy" color="inherit" sx={{ mx: 1 }}>
          Privacy Policy
        </Link>
        <Link href="/terms" color="inherit" sx={{ mx: 1 }}>
          Terms of Service
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer; 