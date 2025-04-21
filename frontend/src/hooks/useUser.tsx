import { useMsal } from '@azure/msal-react';
import { useAuth } from '../authContext';

/**
 * Custom hook that provides authentication-related utilities,
 * combining MSAL and the mock auth system for development
 */
export const useUser = () => {
  const { accounts } = useMsal();
  const { isAuthenticated, user, login, logout } = useAuth();

  /**
   * Check if the user is authenticated in either MSAL or the mock auth system
   */
  const isUserAuthenticated = (): boolean => {
    return (accounts && accounts.length > 0) || isAuthenticated;
  };

  /**
   * Get the user ID from either MSAL or the mock auth system
   */
  const getUserId = (): string => {
    if (accounts && accounts.length > 0) {
      return accounts[0].localAccountId;
    } else if (user) {
      return user.localAccountId;
    }
    return '';
  };

  /**
   * Get user display name from either MSAL or the mock auth system
   */
  const getUserName = (): string => {
    if (accounts && accounts.length > 0) {
      return accounts[0].name || accounts[0].username || 'User';
    } else if (user) {
      return user.name || user.username || 'User';
    }
    return 'Guest';
  };

  return {
    isAuthenticated: isUserAuthenticated(),
    userId: getUserId(),
    userName: getUserName(),
    login,
    logout
  };
};

export default useUser; 