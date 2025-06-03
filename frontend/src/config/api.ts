/**
 * frontend/src/config/api.ts
 * Configuration for API endpoints and services
 */

// Use relative path in dev for proxy, otherwise use configured URL
export const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Azure Blob Storage upload endpoint
export const AZURE_UPLOAD_URL =
  import.meta.env.VITE_AZURE_UPLOAD_URL || 'http://localhost:3001/api';

// Maximum file size for uploads (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Maximum number of retries for API requests
export const MAX_API_RETRIES = 3;

// Retry delay configuration (in milliseconds)
export const RETRY_INITIAL_DELAY = 1000;
export const RETRY_MAX_DELAY = 30000;
export const RETRY_BACKOFF_FACTOR = 2;

// Timeout for API requests (in milliseconds)
export const API_TIMEOUT = 30000;
