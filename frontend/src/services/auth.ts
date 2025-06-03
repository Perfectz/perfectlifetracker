import { Auth0Client } from '@auth0/auth0-spa-js';

const auth0 = new Auth0Client({
  domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
  client_id: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  redirect_uri: window.location.origin,
  cacheLocation: 'localstorage',
  useRefreshTokens: true,
});

export const login = async () => {
  try {
    await auth0.loginWithPopup({
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    });
    const user = await auth0.getUser();
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  return auth0.logout({
    logoutParams: {
      returnTo: window.location.origin,
    },
  });
};

export const getToken = () => {
  return auth0.getTokenSilently();
};

export const isAuthenticated = async () => {
  try {
    return await auth0.isAuthenticated();
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

export const getUser = async () => {
  try {
    return await auth0.getUser();
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

export default auth0;
