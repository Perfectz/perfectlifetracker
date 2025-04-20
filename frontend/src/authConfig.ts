import { 
  Configuration, 
  LogLevel, 
  PopupRequest, 
  RedirectRequest,
  PublicClientApplication 
} from "@azure/msal-browser";

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: "YOUR_CLIENT_ID", // Replace with your Azure AD B2C client ID
    authority: "https://YOUR_TENANT.b2clogin.com/YOUR_TENANT.onmicrosoft.com/B2C_1_signupsignin", // Replace with your Azure AD B2C authority
    knownAuthorities: ["YOUR_TENANT.b2clogin.com"], // Replace with your Azure AD B2C known authorities
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

// Protected resources
export const protectedResources = {
  apiProfile: {
    endpoint: "http://localhost:4000/api/profile",
    scopes: ["https://YOUR_TENANT.onmicrosoft.com/api/user.read"]
  },
  apiTasks: {
    endpoint: "http://localhost:4000/api/tasks",
    scopes: ["https://YOUR_TENANT.onmicrosoft.com/api/tasks.read", "https://YOUR_TENANT.onmicrosoft.com/api/tasks.write"]
  }
};

// API configuration
export const apiConfig = {
  baseUrl: process.env.REACT_APP_API_BASE_URL,
  scopes: [process.env.REACT_APP_AZURE_AD_B2C_API_SCOPE],
};

// Create and export the MSAL instance for use in other files
export const msalInstance = new PublicClientApplication(msalConfig); 