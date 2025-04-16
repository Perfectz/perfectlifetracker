/**
 * frontend/src/components/Header.tsx
 * Header component with animated GIF banner
 */
import React, { useState, useEffect } from 'react';
import { Box, useTheme, useMediaQuery, Typography } from '@mui/material';
import { terraColors } from '../theme';

// Try to import the header animation, but handle failure gracefully
let headerAnimation: string | undefined;
try {
  // @ts-ignore - Dynamic import
  headerAnimation = new URL('../assets/headerdesktop.gif', import.meta.url).href;
} catch (error) {
  console.warn('Header animation not found:', error);
  headerAnimation = undefined;
}

interface HeaderProps {
  height?: string | number;
  marginBottom?: string | number;
}

const Header: React.FC<HeaderProps> = ({ height = 200, marginBottom = 2 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const numericHeight = typeof height === 'string' ? parseInt(height, 10) : height;
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // Check if the image can be loaded
  useEffect(() => {
    if (!headerAnimation) return;
    
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(false);
    img.src = headerAnimation;
  }, []);

  // If image can't be loaded, show a simple gradient background
  if (!headerAnimation || !imageLoaded) {
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
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(135deg, ${terraColors.prussianBlue}, ${terraColors.maastrichtBlue})`
            : `linear-gradient(135deg, ${terraColors.tropicalRain}, ${terraColors.softTeal})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
          }}
        >
          Perfect LifeTracker Pro
        </Typography>
      </Box>
    );
  }

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
