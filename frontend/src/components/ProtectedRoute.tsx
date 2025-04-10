/**
 * frontend/src/components/ProtectedRoute.tsx
 * Component to protect routes that require authentication
 */
import React, { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
// import { useAppDispatch, useAppSelector } from '../hooks/redux';
// import { openLoginModal } from '../store/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoading, isAuthenticated: authContextAuthenticated } = useAuth();
  const location = useLocation();
  // const dispatch = useAppDispatch();
  // const { isAuthenticated } = useAppSelector(state => state.auth);
  const isAuthenticated = authContextAuthenticated;

  useEffect(() => {
    // If user is not authenticated, show the login modal
    if (!isAuthenticated && !isLoading) {
      // dispatch(openLoginModal());
      console.log('User is not authenticated, would show login modal');
    }
  }, [isAuthenticated, isLoading]);

  // Show loading indicator while authentication state is being determined
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, render null (the login modal will be shown via Redux)
  // We could redirect here, but showing a modal is often better UX
  if (!isAuthenticated) {
    // return null;
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 