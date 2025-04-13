/**
 * frontend/src/components/Header.tsx
 * Header component with animated GIF banner
 */
import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import headerAnimation from '../assets/headerdesktop.gif';
import { terraColors } from '../theme';

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
        borderRadius: isMobile ? '0 0 16px 16px' : 1,
        boxShadow: 2,
      }}
    >
      {/* Overlay gradient for better text visibility on mobile */}
      {isMobile && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '40%',
            background: `linear-gradient(to top, ${terraColors.prussianBlue}80, transparent)`,
            zIndex: 1,
          }}
        />
      )}
      
      <Box
        component="img"
        src={headerAnimation}
        alt="Perfect LifeTracker Pro"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: isMobile ? 'center top' : 'center',
          filter: isMobile ? 'brightness(0.9)' : 'none',
        }}
      />
      
      {/* Optional: Add logo or text overlay for mobile */}
      {isMobile && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 16,
            zIndex: 2,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
          }}
        >
          Perfect LifeTracker Pro
        </Box>
      )}
    </Box>
  );
};

export default Header;
