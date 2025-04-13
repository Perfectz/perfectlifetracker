/**
 * src/services/authConfig.ts
 * Shared authentication configuration for both web and mobile platforms
 */

// Configuration parameters
export const authConfig = {
  // Microsoft Entra ID (Azure AD) configuration
  microsoft: {
    clientId: "d9764c39-1eb9-4963-83a0-e8ba859c8965", // Replace with actual client ID
    authority: "https://login.microsoftonline.com/78e9993f-a208-4c38-9d9d-6b15f0d2407d",
    redirectUri: "http://localhost:3000", // Will be overridden per platform
    scopes: ["User.Read", "openid", "profile", "offline_access"],
  },
  
  // Google OAuth configuration (when not using federation through Azure AD)
  google: {
    clientId: "YOUR_GOOGLE_CLIENT_ID", // Replace with actual Google client ID
    redirectUri: "http://localhost:3000", // Will be overridden per platform
    scopes: ["openid", "profile", "email"],
  },
  
  // Cache configuration
  cache: {
    cacheLocation: "sessionStorage", // for web
    storeAuthStateInCookie: false,
  },
  
  // API endpoints
  endpoints: {
    graph: "https://graph.microsoft.com/v1.0/me",
  },
  
  // Login request scopes
  loginRequest: {
    scopes: ["User.Read", "openid", "profile", "offline_access"],
  },
  
  // Graph API request scopes
  graphRequest: {
    scopes: ["User.Read", "User.ReadBasic.All"],
  },
};

// Define common auth types that will be used across platforms
export interface AuthUser {
  id: string;
  displayName?: string;
  email?: string;
  photoUrl?: string;
  provider: 'microsoft' | 'google';
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthError {
  errorCode: string;
  errorMessage: string;
  stack?: string;
}

// Common auth actions/methods interface
export interface AuthActions {
  signInWithMicrosoft: () => Promise<AuthUser | null>;
  signInWithGoogle: () => Promise<AuthUser | null>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  getUserProfile: () => Promise<any>;
  isAuthenticated: () => boolean;
} 