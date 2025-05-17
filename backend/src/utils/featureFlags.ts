// backend/src/utils/featureFlags.ts
// Utility for feature flags management

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper to parse boolean from environment variables
const parseBoolean = (value?: string): boolean => {
  if (!value) return false;
  return ['true', '1', 'yes'].includes(value.toLowerCase());
};

/**
 * Feature flags for the application
 */
export const FeatureFlags = {
  // Feature flag for OpenAI integration
  // Set to true to enable, false to disable
  // Can be overridden with environment variable FEATURE_OPENAI=true|false
  ENABLE_OPENAI: process.env.FEATURE_OPENAI === 'true' || false,
  
  // Feature flag for analytics endpoints
  // Set to true to enable, false to disable
  // Can be overridden with environment variable FEATURE_ANALYTICS=true|false
  ENABLE_ANALYTICS: process.env.FEATURE_ANALYTICS === 'true' || true,
  
  // Feature flag for Text Analytics integration
  // Set to true to enable, false to disable
  // Can be overridden with environment variable FEATURE_TEXT_ANALYTICS=true|false
  get ENABLE_TEXT_ANALYTICS(): boolean {
    return parseBoolean(process.env.FEATURE_TEXT_ANALYTICS) || process.env.NODE_ENV === 'production';
  },
  
  // Feature flag for Search service integration
  // Set to true to enable, false to disable
  // Can be overridden with environment variable FEATURE_SEARCH=true|false
  get ENABLE_SEARCH(): boolean {
    return parseBoolean(process.env.FEATURE_SEARCH) || process.env.NODE_ENV === 'development';
  },
  
  // Feature flag for Advanced Journal Insights
  // Set to true to enable, false to disable
  // Can be overridden with environment variable FEATURE_ADVANCED_INSIGHTS=true|false
  get ENABLE_ADVANCED_INSIGHTS(): boolean {
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return parseBoolean(process.env.FEATURE_ADVANCED_INSIGHTS) || false;
  },
  
  // Feature flag for Blob Storage for attachments
  // Set to true to enable, false to disable
  // Can be overridden with environment variable FEATURE_ATTACHMENTS=true|false
  get ENABLE_ATTACHMENTS(): boolean {
    return parseBoolean(process.env.FEATURE_ATTACHMENTS) || false;
  }
};

/**
 * Check if a feature is enabled
 * @param feature The feature name to check
 * @returns True if the feature is enabled, false otherwise
 */
export function isFeatureEnabled(feature: keyof typeof FeatureFlags): boolean {
  return FeatureFlags[feature];
} 