import { LinkProps } from 'react-router-dom';
import { ElementType } from 'react';

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    success: true;
    neutral: true;
  }

  interface ButtonPropsVariantOverrides {
    dashed: true;
  }

  interface ButtonPropsSizeOverrides {
    medium: true;
  }
}

declare module '@mui/material' {
  interface ButtonProps {
    component?: ElementType;
    to?: string;
  }
} 