/**
 * frontend/src/components/PlatformScreenWrapper.tsx
 * A wrapper component that handles platform-specific screen rendering
 */
import React, { ReactNode } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { isWeb } from '../utils/platformUtils';

interface PlatformScreenWrapperProps {
  webComponent: ReactNode;
  mobileComponent: ReactNode;
  fallbackComponent?: ReactNode;
}

/**
 * Platform-aware screen wrapper that renders the appropriate component
 * based on the current platform (web/mobile) and screen size
 */
const PlatformScreenWrapper: React.FC<PlatformScreenWrapperProps> = ({
  webComponent,
  mobileComponent,
  fallbackComponent
}) => {
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Determine which component to render
  const renderComponent = () => {
    // For web browsers
    if (isWeb()) {
      // Use responsive design based on screen size
      return isMobileView ? mobileComponent : webComponent;
    }
    
    // For React Native (mobile devices)
    return mobileComponent;
  };
  
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {renderComponent() || fallbackComponent || null}
    </Box>
  );
};

export default PlatformScreenWrapper; 