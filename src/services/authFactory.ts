/**
 * src/services/authFactory.ts
 * Factory for creating platform-specific auth service instances
 */
import { AuthActions } from './authConfig';

// Platform detection
const isMobile = (): boolean => {
  // This is a simple check - in a real app, you would use more robust detection
  // or environment variables
  return typeof navigator !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// This function will dynamically import the appropriate auth service based on platform
export const getAuthService = async (): Promise<AuthActions> => {
  if (isMobile()) {
    // For mobile, use MSAL React Native implementation
    try {
      const { rnMsalAuthService } = await import('./mobile/RNMsalAuthService');
      return rnMsalAuthService;
    } catch (error) {
      console.error('Failed to load mobile auth service:', error);
      // Fallback to web implementation
      const { msalAuthService } = await import('./web/MsalAuthService');
      return msalAuthService;
    }
  } else {
    // For web, use MSAL Browser implementation
    const { msalAuthService } = await import('./web/MsalAuthService');
    return msalAuthService;
  }
};

// For convenience in non-async contexts, provide direct paths to implementations
// Note: This doesn't use dynamic imports, so both implementations will be bundled
import { msalAuthService } from './web/MsalAuthService';
export { msalAuthService }; // Web implementation

// Conditionally re-export the mobile implementation if it's available
// This avoids build errors when mobile dependencies aren't installed
let rnMsalAuthService: AuthActions | undefined;
try {
  // We use require instead of import to conditionally load this module
  // This prevents build errors if the module is not available
  const mobileAuth = require('./mobile/RNMsalAuthService');
  rnMsalAuthService = mobileAuth.rnMsalAuthService;
  
  // Export the mobile implementation if it's available
  if (rnMsalAuthService) {
    exports.rnMsalAuthService = rnMsalAuthService;
  }
} catch (error) {
  // Module not available, which is fine
  console.log('Mobile auth service not available, using web implementation');
} 