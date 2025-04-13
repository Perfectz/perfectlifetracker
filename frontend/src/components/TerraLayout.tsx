/**
 * frontend/src/components/TerraLayout.tsx
 * Responsive layout component for Terra design
 */
import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import TerraAppBar from './TerraAppBar';
import TerraLeftNavigation from './TerraLeftNavigation';
import TerraBottomNavigation from './TerraBottomNavigation';
import { terraColors } from '../../src/theme';

interface TerraLayoutProps {
  children: React.ReactNode;
}

const TerraLayout: React.FC<TerraLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeItem, setActiveItem] = useState('dashboard');

  const handleNavItemClick = (item: string) => {
    setActiveItem(item);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <TerraAppBar />

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Left Navigation (Desktop Only) */}
        {!isMobile && (
          <TerraLeftNavigation activeItem={activeItem} onItemClick={handleNavItemClick} />
        )}

        {/* Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: terraColors.pearl,
            ...(isMobile
              ? { pb: 7 } // Add padding at bottom for mobile navigation
              : {}),
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Bottom Navigation (Mobile Only) */}
      {isMobile && (
        <TerraBottomNavigation activeItem={activeItem} onItemClick={handleNavItemClick} />
      )}
    </Box>
  );
};

export default TerraLayout;
