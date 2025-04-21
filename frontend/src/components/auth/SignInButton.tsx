import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../authContext';

/**
 * SignInButton component renders a button that handles user authentication
 */
export const SignInButton: React.FC = () => {
  const { login } = useUser();
  const { isLoading } = useAuth();

  return (
    <Button 
      variant="contained"
      color="primary"
      onClick={login}
      disabled={isLoading}
      aria-label="Sign in to your account"
      className="sign-in-button"
      sx={{ minWidth: '120px' }}
    >
      {isLoading ? (
        <CircularProgress size={24} color="inherit" aria-label="Signing in..." />
      ) : (
        'Sign In'
      )}
    </Button>
  );
};

export default SignInButton; 