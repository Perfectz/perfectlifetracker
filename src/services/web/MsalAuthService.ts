/**
 * src/services/web/MsalAuthService.ts
 * Web-specific implementation of authentication using MSAL
 */
import { 
  PublicClientApplication, 
  AuthenticationResult, 
  AccountInfo,
  Configuration,
  InteractionRequiredAuthError,
  PopupRequest,
  LogLevel
} from "@azure/msal-browser";
import { authConfig, AuthUser, AuthActions } from '../authConfig';

// Create MSAL configuration
const getMsalConfig = (): Configuration => {
  return {
    auth: {
      clientId: authConfig.microsoft.clientId,
      authority: authConfig.microsoft.authority,
      redirectUri: authConfig.microsoft.redirectUri,
      postLogoutRedirectUri: window.location.origin,
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: authConfig.cache.cacheLocation as "sessionStorage" | "localStorage",
      storeAuthStateInCookie: authConfig.cache.storeAuthStateInCookie,
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
};

// Microsoft login request
const microsoftLoginRequest: PopupRequest = {
  scopes: authConfig.microsoft.scopes,
  prompt: "select_account",
};

// Google login request via Entra ID federation
const googleLoginRequest: PopupRequest = {
  scopes: authConfig.microsoft.scopes,
  prompt: "select_account",
  extraQueryParameters: {
    domain_hint: 'google.com'
  }
};

// Graph API request
const graphRequest = {
  scopes: authConfig.graphRequest.scopes,
};

// Create MSAL instance
const msalInstance = new PublicClientApplication(getMsalConfig());

// Convert MSAL AccountInfo to our AuthUser type
const accountToUser = (account: AccountInfo, accessToken?: string): AuthUser => {
  return {
    id: account.homeAccountId,
    displayName: account.name || account.username,
    email: account.username,
    provider: account.idTokenClaims?.idp === 'google.com' ? 'google' : 'microsoft',
    accessToken,
  };
};

// Web Authentication Service class
class MsalAuthService implements AuthActions {
  // Get the active account
  private getAccount(): AccountInfo | null {
    const activeAccount = msalInstance.getActiveAccount();
    if (activeAccount) {
      return activeAccount;
    }
    
    // If no active account is set, but accounts exist, set the first one as active
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
      return accounts[0];
    }
    
    return null;
  }

  // Sign in with Microsoft
  async signInWithMicrosoft(): Promise<AuthUser | null> {
    try {
      const authResult = await msalInstance.loginPopup(microsoftLoginRequest);
      if (authResult) {
        msalInstance.setActiveAccount(authResult.account);
        return accountToUser(authResult.account, authResult.accessToken);
      }
      return null;
    } catch (error) {
      console.error("Error during Microsoft login", error);
      throw error;
    }
  }

  // Sign in with Google (via Entra ID)
  async signInWithGoogle(): Promise<AuthUser | null> {
    try {
      // Configure the popup window size and position
      const popupWindowAttributes = {
        height: 600,
        width: 800,
        top: window.innerHeight / 2 - 300,
        left: window.innerWidth / 2 - 400,
        popupTimeout: 60000 // Add 60-second timeout
      };
      
      // Check if popups are blocked
      const popupBlocked = window.innerHeight - window.outerHeight < 0;
      if (popupBlocked) {
        throw new Error("Popup was blocked. Please allow popups for this site and try again.");
      }

      // Add popup window configuration
      const authResult = await msalInstance.loginPopup({
        ...googleLoginRequest,
        popupWindowAttributes
      });
      
      if (authResult) {
        msalInstance.setActiveAccount(authResult.account);
        return accountToUser(authResult.account, authResult.accessToken);
      }
      return null;
    } catch (error) {
      // Check for specific error types
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during Google login';
      
      // If it's a popup blocked error, inform the user
      if (errorMessage.includes('popup_window_error') || errorMessage.includes('blocked')) {
        console.error("Google login popup was blocked. Please allow popups for this site.");
        throw new Error("Popup was blocked. Please allow popups for this site and try again.");
      }
      
      // If it's a user cancellation, provide more helpful message
      if (errorMessage.includes('user_cancelled')) {
        console.error("Google login was cancelled before completion");
        throw new Error("Login was cancelled. Please try again and complete the login process in the popup window.");
      }
      
      // If it's a timeout error
      if (errorMessage.includes('timeout')) {
        console.error("Google login timed out");
        throw new Error("Login timed out. Please check your internet connection and try again.");
      }
      
      console.error("Error during Google login", error);
      throw error;
    }
  }
  
  // Sign out
  async signOut(): Promise<void> {
    try {
      await msalInstance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (error) {
      console.error("Error during logout", error);
      throw error;
    }
  }

  // Get access token for API calls
  async getAccessToken(): Promise<string | null> {
    const account = this.getAccount();
    if (!account) {
      return null;
    }

    try {
      const tokenResponse = await msalInstance.acquireTokenSilent({
        ...graphRequest,
        account,
      });
      return tokenResponse.accessToken;
    } catch (error) {
      // If the silent token acquisition fails, try interactive method
      if (error instanceof InteractionRequiredAuthError) {
        try {
          const tokenResponse = await msalInstance.acquireTokenPopup(graphRequest);
          return tokenResponse.accessToken;
        } catch (interactiveError) {
          console.error("Error during interactive token acquisition", interactiveError);
          throw interactiveError;
        }
      }
      console.error("Error during silent token acquisition", error);
      throw error;
    }
  }

  // Get user profile from Microsoft Graph API
  async getUserProfile(): Promise<AuthUser | null> {
    const account = this.getAccount();
    if (!account) {
      return null;
    }

    try {
      const token = await this.getAccessToken();
      if (!token) return null;

      const response = await fetch(authConfig.endpoints.graph, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching user profile: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: account.homeAccountId,
        displayName: data.displayName || account.name,
        email: data.mail || data.userPrincipalName || account.username,
        photoUrl: data.photo ? `data:image/jpeg;base64,${data.photo}` : undefined,
        provider: account.idTokenClaims?.idp === 'google.com' ? 'google' : 'microsoft',
        accessToken: token,
      };
    } catch (error) {
      console.error("Error getting user profile", error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccount();
  }
}

// Export singleton instance
export const msalAuthService = new MsalAuthService();
// Export MSAL instance for use with MsalProvider
export { msalInstance }; 