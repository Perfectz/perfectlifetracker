/**
 * frontend/src/components/LoginButton.tsx
 * Login button component with authentication handling
 */
import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useAuth } from '../services/AuthContext';

const LoginButton = () => {
  const { signIn, isLoading } = useAuth();

  return (
    <Button
      variant="contained"
      color="primary"
      size="large"
      onClick={() => signIn()}
      disabled={isLoading}
      sx={{
        minWidth: 200,
        py: 1.5,
      }}
    >
      {isLoading ? (
        <CircularProgress size={24} color="inherit" />
      ) : (
        'Sign in with Microsoft'
      )}
    </Button>
  );
};

export default LoginButton; 