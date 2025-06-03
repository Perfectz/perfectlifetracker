/**
 * frontend/src/components/ProtectedRoute.tsx
 * Protected route component for authenticated routes
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/MockAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Show a loading spinner or placeholder
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
