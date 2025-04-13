/**
 * src/services/AuthContext.tsx
 * Shared authentication context for both web and mobile platforms
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, AuthState, AuthActions } from './authConfig';

// Create a generic auth context that will work for both web and mobile
interface AuthContextType extends AuthState, AuthActions {}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
  signInWithMicrosoft: async () => null,
  signInWithGoogle: async () => null,
  signOut: async () => {},
  getAccessToken: async () => null,
  getUserProfile: async () => null,
  isAuthenticated: () => false,
});

// Props for our provider component
interface AuthProviderProps {
  children: ReactNode;
  authImplementation: AuthActions;
  initialAuthState?: Partial<AuthState>;
}

// Provider component that uses platform-specific implementation
export const AuthProvider = ({ 
  children, 
  authImplementation,
  initialAuthState = {} 
}: AuthProviderProps) => {
  // Initialize state with platform defaults and any provided initial state
  const [state, setState] = useState<AuthState>({
    isAuthenticated: initialAuthState.isAuthenticated || false,
    user: initialAuthState.user || null,
    isLoading: initialAuthState.isLoading !== undefined ? initialAuthState.isLoading : true,
    error: initialAuthState.error || null,
  });

  // Check authentication state on mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        if (authImplementation.isAuthenticated()) {
          const userProfile = await authImplementation.getUserProfile();
          if (userProfile) {
            setState(prev => ({
              ...prev,
              isAuthenticated: true,
              user: userProfile,
              isLoading: false,
            }));
            return;
          }
        }
        
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to initialize authentication',
          isLoading: false,
        }));
      }
    };

    checkAuthState();
  }, [authImplementation]);

  // Sign in with Microsoft
  const signInWithMicrosoft = async (): Promise<AuthUser | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await authImplementation.signInWithMicrosoft();
      if (user) {
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user,
          isLoading: false,
        }));
        return user;
      }
      setState(prev => ({ ...prev, isLoading: false }));
      return null;
    } catch (error: any) {
      console.error('Microsoft sign-in error:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to sign in with Microsoft',
        isLoading: false,
      }));
      return null;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<AuthUser | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await authImplementation.signInWithGoogle();
      if (user) {
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user,
          isLoading: false,
        }));
        return user;
      }
      setState(prev => ({ ...prev, isLoading: false }));
      return null;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to sign in with Google',
        isLoading: false,
      }));
      return null;
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await authImplementation.signOut();
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Sign-out error:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to sign out',
        isLoading: false,
      }));
    }
  };

  // Get access token - delegate to implementation
  const getAccessToken = async (): Promise<string | null> => {
    return authImplementation.getAccessToken();
  };

  // Get user profile - delegate to implementation
  const getUserProfile = async (): Promise<any> => {
    return authImplementation.getUserProfile();
  };

  // Check if authenticated - delegate to implementation
  const isAuthenticatedFn = (): boolean => {
    return authImplementation.isAuthenticated();
  };

  // Combine state and methods for context value
  const value: AuthContextType = {
    ...state,
    signInWithMicrosoft,
    signInWithGoogle,
    signOut,
    getAccessToken,
    getUserProfile,
    isAuthenticated: isAuthenticatedFn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = () => useContext(AuthContext); 