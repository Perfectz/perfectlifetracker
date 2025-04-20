import React, { ReactNode } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';

/**
 * AuthenticatedTemplate renders children only when user is authenticated
 */
export const AuthenticatedTemplate: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();

  return isAuthenticated ? <>{children}</> : null;
};

export default AuthenticatedTemplate; 