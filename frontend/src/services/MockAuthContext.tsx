/**
 * frontend/src/services/MockAuthContext.tsx
 * A simplified mock authentication context for development and testing
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import mockAuthService, { MockUser } from './mockAuthService';

// Type definitions for our mock authentication context
interface MockAuthContextType {
  isAuthenticated: boolean;
  user: MockUser | null;
  userProfile: MockUser | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

interface MockAuthProviderProps {
  children: ReactNode;
}

export const MockAuthProvider = ({ children }: MockAuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<MockUser | null>(null);
  const [userProfile, setUserProfile] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = mockAuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setUserProfile(currentUser);
          setIsAuthenticated(true);
        }
      } catch (err: any) {
        console.error('Auth initialization error:', err);
        setError(err.message || 'Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Sign in function
  const signIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await mockAuthService.demoSignIn();
      setUser(user);
      setUserProfile(user);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await mockAuthService.signOut();
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Failed to sign out');
    }
  };

  const value = {
    isAuthenticated,
    user,
    userProfile,
    signIn,
    signOut,
    isLoading,
    error,
  };

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
};

export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};

// Replace this export with useAuth for easy switching between real and mock auth
export const useAuth = useMockAuth;
