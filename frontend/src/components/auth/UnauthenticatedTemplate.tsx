import React, { ReactNode } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';

/**
 * UnauthenticatedTemplate renders children only when user is not authenticated
 */
export const UnauthenticatedTemplate: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();

  return !isAuthenticated ? <>{children}</> : null;
};

export default UnauthenticatedTemplate; 