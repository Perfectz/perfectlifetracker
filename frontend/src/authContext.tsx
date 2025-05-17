import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccountInfo } from '@azure/msal-browser';

// Types
interface AuthContextProps {
  isAuthenticated: boolean;
  user: AccountInfo | null;
  login: () => Promise<void>;
  logout: () => void;
  acquireToken: (scopes: string[]) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

// Mock user for development
const mockUser: AccountInfo = {
  homeAccountId: 'mock-account-id',
  localAccountId: 'mock-local-id',
  environment: 'localhost',
  tenantId: 'mock-tenant',
  username: 'user@example.com',
  name: 'Demo User'
};

// Mock token for development (exported for use in apiService fallback)
export const generateMockToken = (): string => {
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRlbW8gVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.${Math.random().toString(36).substring(2)}`;
};

// Create context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to update screen reader announcements
  const updateScreenReaderAnnouncement = (message: string) => {
    const statusElement = document.getElementById('auth-status');
    if (statusElement) {
      statusElement.textContent = message;
    }
  };
  
  // Check for existing session
  useEffect(() => {
    // In development, bypass sessionStorage and auto-authenticate
    if (process.env.NODE_ENV !== 'production') {
      setIsAuthenticated(true);
      setUser(mockUser);
      updateScreenReaderAnnouncement('You are signed in (development mode)');
      setIsLoading(false);
      return;
    }

    // Existing sessionStorage initialization for production
    const initializeAuth = async () => {
      try {
        const savedAuth = sessionStorage.getItem('mock_auth_state');
        if (savedAuth === 'authenticated') {
          setIsAuthenticated(true);
          setUser(mockUser);
          updateScreenReaderAnnouncement('You are signed in');
        } else {
          updateScreenReaderAnnouncement('Please sign in to continue');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        updateScreenReaderAnnouncement('Authentication initialization error');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (): Promise<void> => {
    try {
      setIsLoading(true);
      updateScreenReaderAnnouncement('Signing in...');
      
      // For development: simulate successful login without actual MSAL
      setTimeout(() => {
        setIsAuthenticated(true);
        setUser(mockUser);
        sessionStorage.setItem('mock_auth_state', 'authenticated');
        updateScreenReaderAnnouncement('Sign in successful. Welcome to LifeTracker Pro.');
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Login failed');
      updateScreenReaderAnnouncement('Sign in failed. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    try {
      setIsLoading(true);
      updateScreenReaderAnnouncement('Signing out...');
      
      // For development: clear mock auth state
      setTimeout(() => {
        setIsAuthenticated(false);
        setUser(null);
        sessionStorage.removeItem('mock_auth_state');
        updateScreenReaderAnnouncement('You have been signed out.');
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError('Logout failed');
      updateScreenReaderAnnouncement('Sign out failed.');
      console.error(err);
      setIsLoading(false);
    }
  };

  const acquireToken = async (_scopes: string[]): Promise<string | null> => {
    if (!isAuthenticated) {
      return null;
    }

    // For development: return a mock token
    return Promise.resolve(generateMockToken());
  };

  const contextValue: AuthContextProps = {
    isAuthenticated,
    user,
    login,
    logout,
    acquireToken,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext; 