/**
 * frontend/src/components/Grid.tsx
 * Custom Grid component to handle Material-UI v7 compatibility
 */
import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

// Define Grid component props
interface GridProps extends Omit<BoxProps, 'sx'> {
  container?: boolean;
  item?: boolean;
  xs?: number | 'auto';
  sm?: number | 'auto';
  md?: number | 'auto';
  lg?: number | 'auto';
  xl?: number | 'auto';
  spacing?: number;
  sx?: SxProps<Theme>;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>((props, ref) => {
  const { container, item, xs, sm, md, lg, xl, spacing, children, sx, ...other } = props;
  
  // Generate base styles for grid
  let flexStyles = {};
  
  if (container) {
    flexStyles = {
      display: 'flex',
      flexWrap: 'wrap',
      width: '100%',
      ...(spacing !== undefined && {
        margin: -spacing / 2,
      }),
    };
  }
  
  if (item) {
    flexStyles = {
      ...flexStyles,
      ...(spacing !== undefined && {
        padding: spacing / 2,
      }),
    };
  }
  
  // Responsive styles
  const responsiveStyles = {};
  
  if (xs !== undefined) {
    Object.assign(responsiveStyles, {
      flexBasis: xs === 'auto' ? 'auto' : `${(xs / 12) * 100}%`,
      flexGrow: xs === 'auto' ? 0 : 1,
      maxWidth: xs === 'auto' ? 'none' : `${(xs / 12) * 100}%`,
    });
  }
  
  if (sm !== undefined) {
    Object.assign(responsiveStyles, {
      '@media (min-width: 600px)': {
        flexBasis: sm === 'auto' ? 'auto' : `${(sm / 12) * 100}%`,
        flexGrow: sm === 'auto' ? 0 : 1,
        maxWidth: sm === 'auto' ? 'none' : `${(sm / 12) * 100}%`,
      },
    });
  }
  
  if (md !== undefined) {
    Object.assign(responsiveStyles, {
      '@media (min-width: 900px)': {
        flexBasis: md === 'auto' ? 'auto' : `${(md / 12) * 100}%`,
        flexGrow: md === 'auto' ? 0 : 1,
        maxWidth: md === 'auto' ? 'none' : `${(md / 12) * 100}%`,
      },
    });
  }
  
  if (lg !== undefined) {
    Object.assign(responsiveStyles, {
      '@media (min-width: 1200px)': {
        flexBasis: lg === 'auto' ? 'auto' : `${(lg / 12) * 100}%`,
        flexGrow: lg === 'auto' ? 0 : 1,
        maxWidth: lg === 'auto' ? 'none' : `${(lg / 12) * 100}%`,
      },
    });
  }
  
  if (xl !== undefined) {
    Object.assign(responsiveStyles, {
      '@media (min-width: 1536px)': {
        flexBasis: xl === 'auto' ? 'auto' : `${(xl / 12) * 100}%`,
        flexGrow: xl === 'auto' ? 0 : 1,
        maxWidth: xl === 'auto' ? 'none' : `${(xl / 12) * 100}%`,
      },
    });
  }
  
  // Combine all styles
  const combinedSx = {
    ...flexStyles,
    ...responsiveStyles,
    ...(sx || {}),
  };

  return (
    <Box ref={ref} sx={combinedSx} {...other}>
      {children}
    </Box>
  );
});

Grid.displayName = 'Grid';

export default Grid; 