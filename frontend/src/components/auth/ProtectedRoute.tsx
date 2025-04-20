import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../authContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

/**
 * ProtectedRoute component to protect routes that require authentication
 * If user is not authenticated, redirects to login page
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="loading">Checking authentication...</div>;
  }

  if (requireAuth && !isAuthenticated) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // Redirect authenticated users away from auth pages (login/register)
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 