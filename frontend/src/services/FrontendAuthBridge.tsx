/**
 * frontend/src/services/FrontendAuthBridge.tsx
 * Bridge component that maps shared auth system to the frontend auth context
 */
import React, { ReactNode, useEffect, useState } from 'react';
import { AccountInfo } from '@azure/msal-browser';
import { AuthProvider as FrontendAuthProvider } from './AuthContext';
import { useAuth as useSharedAuth } from '../../src/services/AuthContext';
import { AuthUser } from '../../src/services/authConfig';

interface FrontendAuthBridgeProps {
  children: ReactNode;
}

// This component bridges the shared auth system to the frontend auth context
export const FrontendAuthBridge: React.FC<FrontendAuthBridgeProps> = ({ children }) => {
  const sharedAuth = useSharedAuth();
  
  // Convert AuthUser to AccountInfo for backwards compatibility
  const [frontendUser, setFrontendUser] = useState<AccountInfo | null>(null);
  
  // Map shared auth state to frontend auth state
  useEffect(() => {
    if (sharedAuth.user) {
      // Create an AccountInfo-like object from AuthUser
      const accountInfo: AccountInfo = {
        homeAccountId: sharedAuth.user.id,
        environment: 'login.microsoftonline.com',
        tenantId: '78e9993f-a208-4c38-9d9d-6b15f0d2407d',
        username: sharedAuth.user.email || '',
        localAccountId: sharedAuth.user.id,
        name: sharedAuth.user.displayName || '',
      };
      
      setFrontendUser(accountInfo);
    } else {
      setFrontendUser(null);
    }
  }, [sharedAuth.user]);
  
  // Map shared auth methods to frontend auth context
  const signIn = async () => {
    await sharedAuth.signInWithMicrosoft();
  };
  
  const signInWithGoogle = async () => {
    await sharedAuth.signInWithGoogle();
  };
  
  const signOut = async () => {
    await sharedAuth.signOut();
  };
  
  // Create a frontendContext value that uses the shared auth but maps to the frontend format
  const frontendAuthValue = {
    isAuthenticated: sharedAuth.isAuthenticated,
    user: frontendUser,
    userProfile: sharedAuth.user,
    signIn,
    signInWithGoogle,
    signInWithMicrosoft: signIn, // Add this for LoginModal
    signOut,
    isLoading: sharedAuth.isLoading,
    error: sharedAuth.error,
  };
  
  return (
    <FrontendAuthProvider value={frontendAuthValue}>
      {children}
    </FrontendAuthProvider>
  );
};

// Export the custom hook for backwards compatibility
export { useAuth } from './AuthContext'; 