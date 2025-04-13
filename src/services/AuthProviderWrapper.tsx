/**
 * src/services/AuthProviderWrapper.tsx
 * Platform-agnostic Auth Provider wrapper that selects the appropriate implementation
 */
import React, { ReactNode } from 'react';

// Dynamically import the appropriate auth provider based on platform
const AuthWrapperImport = React.lazy(() => {
  // Simple platform detection
  const isMobile = typeof navigator !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return isMobile 
    ? import('./mobile/RNMsalAuthProvider').then(module => ({ default: module.RNMsalAuthWrapper }))
    : import('./web/MsalAuthProvider').then(module => ({ default: module.MsalAuthWrapper }));
});

interface AuthProviderWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// Common auth provider wrapper for both web and mobile
const AuthProviderWrapper: React.FC<AuthProviderWrapperProps> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <React.Suspense fallback={fallback}>
      <AuthWrapperImport>
        {children}
      </AuthWrapperImport>
    </React.Suspense>
  );
};

export default AuthProviderWrapper; 