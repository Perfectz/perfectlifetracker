import React from 'react';
import { useAuth } from '../../authContext';

/**
 * SignInButton component renders a button that handles user authentication
 */
export const SignInButton: React.FC = () => {
  const { login, isLoading } = useAuth();

  return (
    <button 
      className="sign-in-button" 
      onClick={login}
      disabled={isLoading}
    >
      {isLoading ? 'Signing in...' : 'Sign In'}
    </button>
  );
};

export default SignInButton; 