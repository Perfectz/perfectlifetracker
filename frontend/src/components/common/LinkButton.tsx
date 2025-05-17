import React, { forwardRef, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from '@mui/material';

// Simple props interface with required fields
interface LinkButtonProps {
  to: string;
  replace?: boolean;
  children?: ReactNode;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  startIcon?: React.ReactNode;
  sx?: any;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  'aria-label'?: string;
  [key: string]: any; // Allow any additional props
}

// Using forwardRef to make it work with MUI
const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (props, ref) => {
    const { to, children, ...rest } = props;
    
    return (
      <Button 
        component={RouterLink as any}
        to={to}
        ref={ref}
        {...rest}
      >
        {children}
      </Button>
    );
  }
);

LinkButton.displayName = 'LinkButton';

export default LinkButton; 