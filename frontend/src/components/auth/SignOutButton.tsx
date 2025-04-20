import React from 'react';
import { useAuth } from '../../authContext';

/**
 * SignOutButton component renders a button that handles user sign-out
 */
export const SignOutButton: React.FC = () => {
  const { logout, isLoading, user } = useAuth();

  return (
    <div className="auth-header">
      <span className="welcome-user">Welcome, {user?.name || 'User'}</span>
      <button 
        className="sign-out-button" 
        onClick={logout}
        disabled={isLoading}
      >
        {isLoading ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  );
};

export default SignOutButton; 