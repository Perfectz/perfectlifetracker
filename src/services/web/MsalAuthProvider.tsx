/**
 * src/services/web/MsalAuthProvider.tsx
 * Web-specific Auth Provider that integrates with MSAL browser
 */
import React, { useState, useEffect, ReactNode } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { AuthProvider } from '../AuthContext';
import { msalAuthService, msalInstance } from './MsalAuthService';
import { AuthState } from '../authConfig';

interface MsalAuthProviderProps {
  children: ReactNode;
}

export const MsalAuthWrapper: React.FC<MsalAuthProviderProps> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [initialState, setInitialState] = useState<Partial<AuthState>>({
    isLoading: true,
  });

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for active account
        if (msalAuthService.isAuthenticated()) {
          const userProfile = await msalAuthService.getUserProfile();
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
    return null; // Or a loading spinner
  }

  return (
    // Wrap with MSAL Provider for MSAL React hooks
    <MsalProvider instance={msalInstance}>
      {/* Then use our shared AuthProvider with the web implementation */}
      <AuthProvider 
        authImplementation={msalAuthService}
        initialAuthState={initialState}
      >
        {children}
      </AuthProvider>
    </MsalProvider>
  );
}; 