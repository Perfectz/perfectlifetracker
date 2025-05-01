// frontend/src/testUtils.tsx
// Common utilities for testing

import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './authContext';

// Mock implementations
// Mock for MSAL - referenced by authConfig and apiService
jest.mock('@azure/msal-browser', () => ({
  PublicClientApplication: jest.fn().mockImplementation(() => ({
    acquireTokenSilent: jest.fn().mockResolvedValue({ accessToken: 'mock-token' }),
    getActiveAccount: jest.fn().mockReturnValue({ name: 'Test User' }),
    getAllAccounts: jest.fn().mockReturnValue([{ name: 'Test User' }]),
    setActiveAccount: jest.fn(),
    loginRedirect: jest.fn(),
    logoutRedirect: jest.fn(),
    handleRedirectPromise: jest.fn().mockResolvedValue(null)
  })),
  InteractionType: {
    Redirect: 'redirect',
    Popup: 'popup',
    Silent: 'silent'
  },
  BrowserAuthError: jest.fn().mockImplementation((errorCode, errorMessage) => {
    return { errorCode, errorMessage };
  })
}));

// Mock the auth context
jest.mock('./authContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    user: { 
      homeAccountId: 'mock-account-id',
      localAccountId: 'mock-local-id',
      environment: 'localhost',
      tenantId: 'mock-tenant',
      username: 'test@example.com',
      name: 'Test User'
    },
    login: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn(),
    acquireToken: jest.fn().mockResolvedValue('mock-jwt-token'),
    error: null
  }),
  generateMockToken: jest.fn().mockReturnValue('mock-jwt-token'),
  // We export a real implementation of AuthProvider that forwards children
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Create a fresh QueryClient for each test
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      staleTime: 0,
    },
  },
});

// Wrapper for providing QueryClient to hook tests
export const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Comprehensive wrapper with Router and Auth for component tests
export const allProvidersWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}; 