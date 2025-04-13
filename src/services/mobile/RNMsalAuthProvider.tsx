/**
 * src/services/mobile/RNMsalAuthProvider.tsx
 * Mobile-specific Auth Provider for React Native
 */
import React, { useState, useEffect, ReactNode } from 'react';
import { AuthProvider } from '../AuthContext';
import { rnMsalAuthService } from './RNMsalAuthService';
import { AuthState } from '../authConfig';

interface RNAuthProviderProps {
  children: ReactNode;
}

export const RNMsalAuthWrapper: React.FC<RNAuthProviderProps> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [initialState, setInitialState] = useState<Partial<AuthState>>({
    isLoading: true,
  });

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for active account
        if (rnMsalAuthService.isAuthenticated()) {
          const userProfile = await rnMsalAuthService.getUserProfile();
          setInitialState({
            isAuthenticated: true,
            user: userProfile,
            isLoading: false,
          });
        } else {
          setInitialState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setInitialState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: 'Failed to initialize authentication',
        });
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Wait until we've initialized before rendering the AuthProvider
  if (!initialized) {
    return null; // Or a loading spinner component
  }

  return (
    <AuthProvider 
      authImplementation={rnMsalAuthService}
      initialAuthState={initialState}
    >
      {children}
    </AuthProvider>
  );
}; 