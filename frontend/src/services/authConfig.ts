/**
 * frontend/src/services/authConfig.ts
 * Configuration for Microsoft Entra ID authentication
 */
import { Configuration, LogLevel, PopupRequest } from '@azure/msal-browser';

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_REACT_APP_AZURE_CLIENT_ID,
    authority: import.meta.env.VITE_REACT_APP_AZURE_AUTHORITY,
    redirectUri: import.meta.env.VITE_REACT_APP_AZURE_REDIRECT_URI,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
      logLevel: LogLevel.Info,
    },
  },
};

// Base login request configuration
export const loginRequest: PopupRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
  prompt: 'select_account',
};

// Request for Microsoft login
export const microsoftLoginRequest: PopupRequest = {
  ...loginRequest,
  prompt: 'select_account',
  timeout: 60000,
  popupWindowAttributes: {
    popupSize: { width: 800, height: 600 },
    popupPosition: { top: 100, left: 100 },
    asyncPopups: true,
    popupWindowFeatures:
      'scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no',
  },
};

// Request for Google login via Entra ID
export const googleLoginRequest: PopupRequest = {
  ...loginRequest,
  prompt: 'select_account',
  extraQueryParameters: {
    domain_hint: 'google.com',
  },
  timeout: 60000,
  popupWindowAttributes: {
    popupSize: { width: 800, height: 600 },
    popupPosition: { top: 100, left: 100 },
    asyncPopups: true,
    popupWindowFeatures:
      'scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no',
  },
};

// Request for Facebook login via Entra ID
export const facebookLoginRequest: PopupRequest = {
  ...loginRequest,
  loginHint: 'Facebook', // This doesn't actually trigger Facebook, just used for UX clarity
  prompt: 'select_account',
  // Add domain hint for Facebook federation if available
  extraQueryParameters: {
    domain_hint: 'facebook.com',
  },
  // Add a reasonable timeout to avoid issues
  timeout: 60000,
  // Browser-compatible popup features
  popupWindowAttributes: {
    popupSize: { width: 800, height: 600 },
    popupPosition: { top: 100, left: 100 },
    asyncPopups: true,
    // Add additional window features for cross-browser compatibility
    popupWindowFeatures:
      'scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no',
  },
};

// Graph API request configuration
export const graphRequest = {
  scopes: ['User.Read', 'User.ReadBasic.All'],
};

// Graph API configuration
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};
