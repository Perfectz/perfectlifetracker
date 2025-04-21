import React from 'react';
import { useUser } from '../../hooks/useUser';

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that requires authentication to show its children.
 * If the user is not authenticated, it displays a fallback component or a default login prompt.
 */
export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, login } = useUser();

  if (!isAuthenticated) {
    // If a fallback is provided, show it
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Otherwise show a default login prompt
    return (
      <div className="auth-required">
        <h3>Authentication Required</h3>
        <p>Please sign in to access this content</p>
        <button onClick={login} className="sign-in-button">
          Sign In
        </button>
      </div>
    );
  }

  // Show children if authenticated
  return <>{children}</>;
};

export default RequireAuth; 