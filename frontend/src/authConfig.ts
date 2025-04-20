import { 
  Configuration, 
  LogLevel, 
  PopupRequest, 
  RedirectRequest,
  PublicClientApplication 
} from "@azure/msal-browser";

// MSAL configuration - Using demo values for development
export const msalConfig: Configuration = {
  auth: {
    clientId: "11111111-1111-1111-1111-111111111111", // Demo client ID
    // For development, we'll use a common endpoint that doesn't require actual B2C configuration
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
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
      piiLoggingEnabled: false,
    },
  },
};

// Login request
export const loginRequest = {
  scopes: ["openid", "profile", "offline_access"]
};

// Sign-in parameters for popup and redirect
export const silentRequest = {
  scopes: ["openid", "profile"]
};

export const signInPopupParams: PopupRequest = {
  ...loginRequest,
  prompt: "select_account"
};

export const signInRedirectParams: RedirectRequest = {
  ...loginRequest,
  prompt: "select_account"
};

// Protected resources with demo scope values
export const protectedResources = {
  apiProfile: {
    endpoint: "http://localhost:4000/api/profile",
    scopes: ["api://demo/user.read"]
  },
  apiTasks: {
    endpoint: "http://localhost:4000/api/tasks",
    scopes: ["api://demo/tasks.read", "api://demo/tasks.write"]
  }
};

// API configuration
export const apiConfig = {
  baseUrl: "http://localhost:4000",
  scopes: ["api://demo/user.read"],
};

// Create and export the MSAL instance for use in other files
export const msalInstance = new PublicClientApplication(msalConfig); 