/**
 * Shared Authentication Context
 * Used by both web and mobile applications
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Auth state interface
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// User interface
export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

// Auth context interface
export interface AuthContextType extends AuthState {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
});

// Auth provider props interface
export interface AuthProviderProps {
  children: ReactNode;
  authImplementation: {
    signIn: () => Promise<User>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    getCurrentUser: () => Promise<User | null>;
  };
}

// Auth provider component
export const AuthProvider = ({ children, authImplementation }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authImplementation.getCurrentUser();
        setState({
          isAuthenticated: !!user,
          user,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
    };

    initAuth();
  }, [authImplementation]);

  const signIn = async () => {
    setState((prev: AuthState) => ({ ...prev, loading: true, error: null }));
    try {
      const user = await authImplementation.signIn();
      setState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev: AuthState) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to sign in',
      }));
    }
  };

  const signOut = async () => {
    setState((prev: AuthState) => ({ ...prev, loading: true, error: null }));
    try {
      await authImplementation.signOut();
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev: AuthState) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to sign out',
      }));
    }
  };

  const resetPassword = async (email: string) => {
    setState((prev: AuthState) => ({ ...prev, loading: true, error: null }));
    try {
      await authImplementation.resetPassword(email);
      setState((prev: AuthState) => ({ ...prev, loading: false }));
    } catch (error) {
      setState((prev: AuthState) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to reset password',
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 