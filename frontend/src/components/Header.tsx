/**
 * frontend/src/components/Header.tsx
 * Header component with animated GIF banner
 */
import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import headerAnimation from '../assets/headerdesktop.gif';

interface HeaderProps {
  height?: string | number;
  marginBottom?: string | number;
}

const Header: React.FC<HeaderProps> = ({ height = 200, marginBottom = 2 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const numericHeight = typeof height === 'string' ? parseInt(height, 10) : height;

  return (
    <Box
      sx={{
        width: '100%',
        height: isMobile ? numericHeight * 0.6 : numericHeight,
        marginBottom,
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 1,
        boxShadow: 2,
      }}
    >
      <Box
        component="img"
        src={headerAnimation}
        alt="Perfect LifeTracker Pro"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
    </Box>
  );
};

export default Header;
