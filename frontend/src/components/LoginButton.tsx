/**
 * frontend/src/components/LoginButton.tsx
 * Login button component with authentication handling
 */
import React from 'react';
import { Button, CircularProgress, Alert, Box } from '@mui/material';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginButton = () => {
  const { signInWithMicrosoft, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      await signInWithMicrosoft();
      // Navigate to dashboard after successful login
      navigate('/dashboard');
    } catch (err) {
      // Error is already handled in the context
      console.error('Login error:', err);
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleSignIn}
        disabled={isLoading}
        sx={{
          minWidth: 250,
          py: 1.5,
        }}
      >
        {isLoading ? (
          <>
            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
            Signing in...
          </>
        ) : (
          'Sign in with Microsoft'
        )}
      </Button>
      <Box sx={{ mt: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
        Secure login with your Microsoft account
      </Box>
    </Box>
  );
};

export default LoginButton;
