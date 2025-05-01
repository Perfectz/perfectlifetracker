// backend/src/utils/featureFlags.ts
// Utility for feature flags management

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
  ENABLE_TEXT_ANALYTICS: process.env.FEATURE_TEXT_ANALYTICS === 'true' || process.env.NODE_ENV === 'production'
};

/**
 * Check if a feature is enabled
 * @param feature The feature name to check
 * @returns True if the feature is enabled, false otherwise
 */
export function isFeatureEnabled(feature: keyof typeof FeatureFlags): boolean {
  return FeatureFlags[feature];
} 