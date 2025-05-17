// frontend/src/components/common/LoadingPlaceholder.tsx
// Reusable loading placeholder component

import React from 'react';
import { Box, CircularProgress, Skeleton, Typography } from '@mui/material';

type PlaceholderType = 'spinner' | 'skeleton' | 'text';

interface LoadingPlaceholderProps {
  type?: PlaceholderType;
  height?: number | string;
  width?: number | string;
  message?: string;
  variant?: 'rectangular' | 'circular' | 'rounded' | 'text';
  count?: number;
}

/**
 * A versatile loading placeholder component that can be customized
 * to show different types of loading indicators
 */
const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({
  type = 'spinner',
  height = 200,
  width = '100%',
  message = 'Loading...',
  variant = 'rectangular',
  count = 1
}) => {
  // Spinner loading indicator
  if (type === 'spinner') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height,
          width,
          p: 2
        }}
      >
        <CircularProgress size={40} />
        {message && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  // Text-only loading indicator
  if (type === 'text') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height,
          width
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Box>
    );
  }

  // Skeleton loading indicator
  return (
    <Box sx={{ width, height }}>
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <Skeleton
            key={index}
            variant={variant}
            animation="wave"
            sx={{
              height: typeof height === 'number' ? height / count : height,
              width: '100%',
              my: 1
            }}
          />
        ))}
    </Box>
  );
};

export default LoadingPlaceholder; 