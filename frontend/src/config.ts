/**
 * frontend/src/config.ts
 * Configuration file for environment variables and other settings
 */

// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Application Settings
export const APP_NAME = 'Perfect LifeTracker Pro';
export const DEFAULT_THEME = 'light';

// Feature Flags
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
export const ENABLE_AI_FEATURES = import.meta.env.VITE_ENABLE_AI_FEATURES === 'true';

// Log level based on environment
export const LOG_LEVEL = import.meta.env.DEV ? 'debug' : 'warn';
