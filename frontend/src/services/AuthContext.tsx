/**
 * frontend/src/services/AuthContext.tsx
 * Authentication context provider for React components
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AccountInfo, BrowserAuthError } from '@azure/msal-browser';
import { authService, msalInstance } from './authService';
import { googleLoginRequest, microsoftLoginRequest } from './authConfig';

// Type definitions for our authentication context
interface AuthContextType {
  isAuthenticated: boolean;
  user: AccountInfo | null;
  userProfile: any | null;
  signIn: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signInRedirect: () => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle redirect login results on component mount
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
          setUser(response.account);
          setIsAuthenticated(true);
          const profile = await authService.getUserInfo();
          setUserProfile(profile);
        }
      } catch (err: any) {
        console.error('Redirect handling error:', err);
        setError(err.message || 'Failed to process redirect login');
      } finally {
        setIsLoading(false);
      }
    };

    handleRedirectResult();
  }, []);

  // Microsoft sign-in function
  const signInWithMicrosoft = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loginResponse = await msalInstance.loginPopup(microsoftLoginRequest);
      
      if (loginResponse) {
        setUser(loginResponse.account);
        setIsAuthenticated(true);
        const profile = await authService.getUserInfo();
        setUserProfile(profile);
      }
    } catch (err: any) {
      console.error('Microsoft login error:', err);
      
      if (err instanceof BrowserAuthError) {
        if (err.errorCode === 'user_cancelled') {
          setError('Login was cancelled. Please try again.');
        } else if (err.errorCode === 'popup_window_error') {
          setError('Popup was blocked. Please allow popups for this site and try again.');
        } else if (err.errorCode === 'popup_timeout') {
          setError('Login timed out. Please try again.');
        } else {
          setError(`Login failed: ${err.errorMessage || err.message}`);
        }
      } else {
        setError(err.message || 'Failed to login with Microsoft');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign-in function
  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loginResponse = await msalInstance.loginPopup(googleLoginRequest);
      
      if (loginResponse) {
        setUser(loginResponse.account);
        setIsAuthenticated(true);
        const profile = await authService.getUserInfo();
        setUserProfile(profile);
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      
      if (err instanceof BrowserAuthError) {
        if (err.errorCode === 'user_cancelled') {
          setError('Login was cancelled. Please try again.');
        } else if (err.errorCode === 'popup_window_error') {
          setError('Popup was blocked. Please allow popups for this site and try again.');
        } else if (err.errorCode === 'popup_timeout') {
          setError('Login timed out. Please try again.');
        } else {
          setError(`Login failed: ${err.errorMessage || err.message}`);
        }
      } else {
        setError(err.message || 'Failed to login with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await msalInstance.logoutPopup();
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to logout');
    }
  };

  // For backward compatibility
  const signIn = signInWithMicrosoft;
  const signInRedirect = signInWithMicrosoft;

  const value = {
    isAuthenticated,
    user,
    userProfile,
    signIn,
    signInWithGoogle,
    signInWithMicrosoft,
    signInRedirect,
    signOut,
    isLoading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 