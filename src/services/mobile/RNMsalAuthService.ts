/**
 * src/services/mobile/RNMsalAuthService.ts
 * Mobile-specific implementation of authentication using MSAL for React Native
 */
import { authConfig, AuthUser, AuthActions } from '../authConfig';

// This is a type definition to represent react-native-msal's PublicClientApplication
// In a real implementation, you would import from 'react-native-msal'
interface MSALConfiguration {
  auth: {
    clientId: string;
    authority: string;
    redirectUri: string;
  };
}

interface MSALInteractiveParams {
  scopes: string[];
  prompt?: string;
  loginHint?: string;
}

interface MSALAccount {
  identifier: string;
  username: string;
  name?: string;
  claims?: Record<string, any>;
}

interface MSALResult {
  accessToken: string;
  idToken?: string;
  account: MSALAccount;
  expiresOn?: number;
  scopes: string[];
}

// Mock class for PublicClientApplication
// In a real implementation, this would be imported from 'react-native-msal'
class PublicClientApplication {
  private config: MSALConfiguration;
  private initialized = false;
  private accounts: MSALAccount[] = [];

  constructor(config: MSALConfiguration) {
    this.config = config;
  }

  async init(): Promise<void> {
    this.initialized = true;
    console.log('MSAL initialized with config', this.config);
  }

  async acquireToken(params: MSALInteractiveParams): Promise<MSALResult | null> {
    if (!this.initialized) {
      throw new Error('MSAL not initialized. Call init() first.');
    }

    console.log('Acquiring token interactively', params);
    
    // In a real implementation, this would open a browser for authentication
    // For this mock, we'll create a fake account and token
    const account: MSALAccount = {
      identifier: 'mobile-user-id',
      username: 'mobile-user@example.com',
      name: 'Mobile User',
      claims: {
        preferred_username: 'mobile-user@example.com',
        name: 'Mobile User',
        idp: params.loginHint === 'Google' ? 'google.com' : 'microsoft.com'
      }
    };
    
    this.accounts.push(account);
    
    return {
      accessToken: 'mock-access-token',
      idToken: 'mock-id-token',
      account: account,
      scopes: params.scopes,
      expiresOn: Date.now() + 3600 * 1000 // 1 hour from now
    };
  }

  async acquireTokenSilent(params: MSALInteractiveParams & { account: MSALAccount }): Promise<MSALResult | null> {
    if (!this.initialized) {
      throw new Error('MSAL not initialized. Call init() first.');
    }

    console.log('Acquiring token silently', params);
    
    // In a real implementation, this would use refresh token to get a new token
    // For this mock, we'll return a fake token
    return {
      accessToken: 'mock-access-token-silent',
      idToken: 'mock-id-token-silent',
      account: params.account,
      scopes: params.scopes,
      expiresOn: Date.now() + 3600 * 1000 // 1 hour from now
    };
  }

  async signOut(account: MSALAccount): Promise<void> {
    if (!this.initialized) {
      throw new Error('MSAL not initialized. Call init() first.');
    }

    console.log('Signing out account', account);
    
    // In a real implementation, this would clear token cache and possibly open browser for sign out
    this.accounts = this.accounts.filter(a => a.identifier !== account.identifier);
  }

  getAccounts(): MSALAccount[] {
    return this.accounts;
  }
}

// Convert MSALAccount to our AuthUser type
const accountToUser = (account: MSALAccount, accessToken?: string): AuthUser => {
  return {
    id: account.identifier,
    displayName: account.name || account.username,
    email: account.username,
    provider: account.claims?.idp === 'google.com' ? 'google' : 'microsoft',
    accessToken: accessToken,
  };
};

// Create MSAL configuration for React Native
const getRNMsalConfig = (): MSALConfiguration => {
  return {
    auth: {
      clientId: authConfig.microsoft.clientId,
      authority: authConfig.microsoft.authority,
      // For mobile, this might be a custom scheme like 'msauth.com.yourcompany.yourapp://auth'
      redirectUri: authConfig.microsoft.redirectUri,
    },
  };
};

// Microsoft login request
const microsoftLoginRequest: MSALInteractiveParams = {
  scopes: authConfig.microsoft.scopes,
  prompt: "select_account",
};

// Google login request via Entra ID federation
const googleLoginRequest: MSALInteractiveParams = {
  scopes: authConfig.microsoft.scopes,
  loginHint: "Google",
  prompt: "select_account",
};

// Create MSAL instance for React Native
// Note: In a real implementation, you would use the actual react-native-msal PublicClientApplication
const msalInstance = new PublicClientApplication(getRNMsalConfig());

// Initialize MSAL - this would be called when the app starts
msalInstance.init().catch(error => {
  console.error('Failed to initialize MSAL', error);
});

// Mobile Authentication Service class for React Native
class RNMsalAuthService implements AuthActions {
  // Get the active account
  private getAccount(): MSALAccount | null {
    const accounts = msalInstance.getAccounts();
    if (accounts.length > 0) {
      return accounts[0];
    }
    return null;
  }

  // Sign in with Microsoft
  async signInWithMicrosoft(): Promise<AuthUser | null> {
    try {
      const authResult = await msalInstance.acquireToken(microsoftLoginRequest);
      if (authResult) {
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
      const authResult = await msalInstance.acquireToken(googleLoginRequest);
      if (authResult) {
        return accountToUser(authResult.account, authResult.accessToken);
      }
      return null;
    } catch (error) {
      console.error("Error during Google login", error);
      throw error;
    }
  }
  
  // Sign out
  async signOut(): Promise<void> {
    const account = this.getAccount();
    if (account) {
      try {
        await msalInstance.signOut(account);
      } catch (error) {
        console.error("Error during logout", error);
        throw error;
      }
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
        scopes: authConfig.microsoft.scopes,
        account,
      });
      return tokenResponse?.accessToken || null;
    } catch (error) {
      // If the silent token acquisition fails, try interactive method
      try {
        const tokenResponse = await msalInstance.acquireToken(microsoftLoginRequest);
        return tokenResponse?.accessToken || null;
      } catch (interactiveError) {
        console.error("Error during interactive token acquisition", interactiveError);
        throw interactiveError;
      }
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

      // In a real implementation, you would make an API call to Microsoft Graph
      // For this mock, we'll return a user based on the account
      return accountToUser(account, token);
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
export const rnMsalAuthService = new RNMsalAuthService(); 