import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccountInfo } from '@azure/msal-browser';
import { msalInstance, loginRequest } from './authConfig';

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

// Mock token for development
const generateMockToken = (): string => {
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
  
  // Check for existing session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // For development: check if we have a saved auth state in session storage
        const savedAuth = sessionStorage.getItem('mock_auth_state');
        
        if (savedAuth === 'authenticated') {
          setIsAuthenticated(true);
          setUser(mockUser);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // For development: simulate successful login without actual MSAL
      setTimeout(() => {
        setIsAuthenticated(true);
        setUser(mockUser);
        sessionStorage.setItem('mock_auth_state', 'authenticated');
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Login failed');
      console.error(err);
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    try {
      setIsLoading(true);
      
      // For development: clear mock auth state
      setTimeout(() => {
        setIsAuthenticated(false);
        setUser(null);
        sessionStorage.removeItem('mock_auth_state');
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError('Logout failed');
      console.error(err);
      setIsLoading(false);
    }
  };

  const acquireToken = async (scopes: string[]): Promise<string | null> => {
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