/**
 * frontend/src/services/authService.ts
 * Service for handling authentication operations with Microsoft Entra ID
 */
import {
  PublicClientApplication,
  AuthenticationResult,
  AccountInfo,
  InteractionRequiredAuthError,
  PopupRequest,
} from '@azure/msal-browser';
import {
  msalConfig,
  loginRequest,
  graphRequest,
  microsoftLoginRequest,
  googleLoginRequest,
  graphConfig,
} from './authConfig';

// Create an MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL
msalInstance.initialize().catch(error => {
  console.error('Error initializing MSAL:', error);
});

// Authentication service class
class AuthService {
  // Get the active account
  getAccount(): AccountInfo | null {
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

  // General sign-in function
  async signIn(): Promise<AuthenticationResult | null> {
    try {
      const authResult = await msalInstance.loginPopup(loginRequest);
      if (authResult) {
        msalInstance.setActiveAccount(authResult.account);
      }
      return authResult;
    } catch (error) {
      console.error('Error during sign-in', error);
      return null;
    }
  }

  // Login with Microsoft (default)
  async loginWithMicrosoft(): Promise<AuthenticationResult | null> {
    try {
      const authResult = await msalInstance.loginPopup(microsoftLoginRequest);
      if (authResult) {
        msalInstance.setActiveAccount(authResult.account);
      }
      return authResult;
    } catch (error) {
      console.error('Error during Microsoft login', error);
      return null;
    }
  }

  // Login with Google (via Entra ID)
  async loginWithGoogle(): Promise<AuthenticationResult | null> {
    try {
      const authResult = await msalInstance.loginPopup(googleLoginRequest);
      if (authResult) {
        msalInstance.setActiveAccount(authResult.account);
      }
      return authResult;
    } catch (error) {
      console.error('Error during Google login', error);
      return null;
    }
  }

  // Get access token for API calls
  async getToken(): Promise<string | null> {
    try {
      const account = this.getAccount();
      if (!account) {
        return null;
      }

      const response = await msalInstance.acquireTokenSilent({
        ...graphRequest,
        account: account,
      });

      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        try {
          const response = await msalInstance.acquireTokenPopup(graphRequest);
          return response.accessToken;
        } catch (popupError) {
          console.error('Error acquiring token via popup', popupError);
          return null;
        }
      }
      console.error('Error acquiring token silently', error);
      return null;
    }
  }

  // Get user data from Microsoft Graph API
  async getUserInfo(): Promise<any> {
    const token = await this.getToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(graphConfig.graphMeEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching user info: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user info', error);
      return null;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    await msalInstance.logoutPopup();
  }
}

// Export a singleton instance
export const authService = new AuthService();

// Export individual functions for easier access
export const signIn = () => authService.signIn();
export const signInWithMicrosoft = () => authService.loginWithMicrosoft();
export const signInWithGoogle = () => authService.loginWithGoogle();
export const signOut = () => authService.signOut();
export const getToken = () => authService.getToken();
export const getUserInfo = () => authService.getUserInfo();

// Export msalInstance for use with MsalProvider
export { msalInstance };
