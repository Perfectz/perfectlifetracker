import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccountInfo, InteractionRequiredAuthError } from '@azure/msal-browser';
import { msalInstance, loginRequest, protectedResources } from './authConfig';

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

// Create context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already signed in
        const accounts = msalInstance.getAllAccounts();
        
        if (accounts.length > 0) {
          setIsAuthenticated(true);
          setUser(accounts[0]);
        }
      } catch (err) {
        setError('Failed to initialize authentication');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await msalInstance.loginPopup(loginRequest);
      
      if (response) {
        setIsAuthenticated(true);
        setUser(response.account);
      }
    } catch (err) {
      setError('Login failed');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    try {
      setIsLoading(true);
      msalInstance.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      setError('Logout failed');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const acquireToken = async (scopes: string[]): Promise<string | null> => {
    if (!isAuthenticated || !user) {
      return null;
    }

    try {
      const silentRequest = {
        scopes,
        account: user,
      };

      const response = await msalInstance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (err) {
      if (err instanceof InteractionRequiredAuthError) {
        try {
          const response = await msalInstance.acquireTokenPopup({
            ...loginRequest,
            scopes,
          });
          return response.accessToken;
        } catch (popupErr) {
          setError('Failed to acquire token');
          console.error(popupErr);
          return null;
        }
      }
      setError('Failed to acquire token silently');
      console.error(err);
      return null;
    }
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