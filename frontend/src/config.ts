/**
 * Application configuration
 * Centralizes all environment variables and configuration settings
 */

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
};

// Auth configuration
export const AUTH_CONFIG = {
  API_SCOPE: process.env.REACT_APP_AZURE_AD_B2C_API_SCOPE || 'https://YOUR_TENANT.onmicrosoft.com/api/user.read',
  LOGIN_REDIRECT_URI: window.location.origin,
  IS_MOCK_ENABLED: process.env.NODE_ENV === 'development',
};

// Feature flags
export const FEATURES = {
  ENABLE_DARK_MODE: true,
  ENABLE_ANALYTICS: Boolean(process.env.REACT_APP_ENABLE_ANALYTICS) || false,
  ENABLE_NOTIFICATIONS: Boolean(process.env.REACT_APP_ENABLE_NOTIFICATIONS) || false,
};

// Theme settings
export const THEME_CONFIG = {
  STORAGE_KEY: 'themeMode',
  DEFAULT_MODE: 'light' as const,
};

// App information
export const APP_INFO = {
  NAME: 'LifeTracker Pro',
  VERSION: '0.1.0',
  SUPPORT_EMAIL: 'support@lifetrackerapp.com',
};

// Navigation
export const NAV_CONFIG = {
  DRAWER_WIDTH: 240,
};

// Logging
export const LOGGING_CONFIG = {
  LOG_LEVEL: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
};

// Default export for convenience
export default {
  API: API_CONFIG,
  AUTH: AUTH_CONFIG,
  FEATURES,
  THEME: THEME_CONFIG,
  APP: APP_INFO,
  NAV: NAV_CONFIG,
  LOGGING: LOGGING_CONFIG,
}; 