/**
 * frontend/src/services/apiService.ts
 * Service for handling API calls to the backend
 */
// Replacing axios with a simple fetch-based implementation
import { getToken } from './auth';
import { API_BASE_URL, AZURE_UPLOAD_URL } from '../config/api';
import { logger, logApiError } from '../utils/logger';

// Type definitions for API responses
interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
}

interface FileResponse {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  downloadUrl?: string;
}

interface UploadProgressCallback {
  (progress: number): void;
}

// Circuit breaker implementation
interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
}

const circuitBreaker: CircuitBreakerState = {
  failures: 0,
  lastFailure: 0,
  isOpen: false,
};

const CIRCUIT_THRESHOLD = 5; // Number of failures before opening circuit
const CIRCUIT_RESET_TIMEOUT = 30000; // 30 seconds timeout before resetting

// Check if circuit is open and should block requests
function isCircuitOpen(): boolean {
  if (!circuitBreaker.isOpen) return false;

  // Check if enough time has passed to try again
  const now = Date.now();
  if (now - circuitBreaker.lastFailure > CIRCUIT_RESET_TIMEOUT) {
    // Reset circuit breaker for a retry
    circuitBreaker.isOpen = false;
    circuitBreaker.failures = 0;
    return false;
  }

  return true;
}

// Record a failure in the circuit breaker
function recordFailure(): void {
  const now = Date.now();
  circuitBreaker.failures++;
  circuitBreaker.lastFailure = now;

  if (circuitBreaker.failures >= CIRCUIT_THRESHOLD) {
    circuitBreaker.isOpen = true;
    logger.warn('Circuit breaker opened', {
      failures: CIRCUIT_THRESHOLD,
      resetTimeout: CIRCUIT_RESET_TIMEOUT / 1000,
    });
  }
}

// Reset circuit breaker after successful request
function recordSuccess(): void {
  if (circuitBreaker.failures > 0) {
    circuitBreaker.failures = 0;
    circuitBreaker.isOpen = false;
  }
}

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  factor: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  factor: 2, // exponential backoff factor
};

// Function to calculate backoff delay
function getBackoffDelay(retryCount: number, config: RetryConfig): number {
  const delay = Math.min(
    config.maxDelay,
    config.initialDelay * Math.pow(config.factor, retryCount)
  );

  // Add some jitter to prevent all clients retrying simultaneously
  return delay * (0.8 + Math.random() * 0.4);
}

// Sleep function for backoff
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to determine if an error is retryable
const isRetryableError = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) return false;
  const err = error as Record<string, unknown>;

  return (
    typeof err.details === 'object' &&
    err.details !== null &&
    (String((err.details as Record<string, unknown>).error).includes('BlobAlreadyExists') ||
      String((err.details as Record<string, unknown>).error).includes('ConditionNotMet'))
  );
};

// Base fetch function with retry logic
async function fetchWithRetry<T = unknown>(
  url: string,
  options: RequestInit = {},
  retryConfig: RetryConfig = defaultRetryConfig
): Promise<T> {
  let retries = 0;
  let lastError: any;

  // Check if circuit breaker is open
  if (isCircuitOpen()) {
    throw new ApiError(
      'Service is temporarily unavailable due to repeated failures. Please try again later.',
      503
    );
  }

  while (retries <= retryConfig.maxRetries) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
          errorData?.message || `HTTP Error: ${response.status}`,
          response.status,
          errorData
        );
      }

      // Record success in circuit breaker
      recordSuccess();
      return await response.json();
    } catch (error: any) {
      lastError = error;

      // Record failure for circuit breaker
      recordFailure();

      // Only retry if the error is retryable
      if (retries >= retryConfig.maxRetries || !isRetryableError(error) || isCircuitOpen()) {
        break;
      }

      // Calculate backoff delay and wait
      const delay = getBackoffDelay(retries, retryConfig);
      logger.debug('API call retry', { delay, retries, endpoint: url });
      await sleep(delay);
      retries++;
    }
  }

  // If we've exhausted retries, throw the last error
  throw lastError instanceof ApiError
    ? lastError
    : new ApiError(lastError?.message || 'Network error', 0);
}

// Main API request function with retry
export async function apiRequest<T = unknown>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: unknown
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(endpoint, options);

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }

      const error = new Error(errorMessage) as ApiError;
      error.status = response.status;
      throw error;
    }

    // Handle empty responses (like DELETE)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return {} as T;
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error('API request failed', {
        method,
        endpoint,
        error: error.message,
      });

      // For development, provide more helpful error messages
      if (process.env.NODE_ENV === 'development') {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Backend server is not running. Please start the backend service.');
        }
        if (error.message.includes('authorization token')) {
          throw new Error('Authentication required. This feature requires login.');
        }
      }
    }
    throw error;
  }
}

// Upload a single file with retry logic and progress tracking
export async function uploadFile(
  file: File,
  category?: string,
  relatedEntityId?: string,
  progressCallback?: UploadProgressCallback
): Promise<FileResponse> {
  // Custom retry config for uploads with longer timeouts
  const uploadRetryConfig: RetryConfig = {
    maxRetries: 3,
    initialDelay: 2000,
    maxDelay: 60000,
    factor: 2,
  };

  const formData = new FormData();
  formData.append('file', file);

  if (category) {
    formData.append('category', category);
  }

  if (relatedEntityId) {
    formData.append('relatedEntityId', relatedEntityId);
  }

  // Use XMLHttpRequest for progress tracking
  if (progressCallback) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event: ProgressEvent) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          progressCallback(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText) as FileResponse;
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));

      xhr.open('POST', `${API_BASE_URL}/uploads/file`);

      const token = getToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  } else {
    // Without progress tracking, use the fetch API with retry logic
    const url = `${AZURE_UPLOAD_URL}/uploads/file`;

    const headers: HeadersInit = {};

    try {
      // Try to get token from Auth0 first
      const token = await getToken().catch(() => null);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Fallback to localStorage if Auth0 token not available
        const localToken = localStorage.getItem('token');
        if (localToken) {
          headers['Authorization'] = `Bearer ${localToken}`;
        }
      }
    } catch (error) {
      logger.warn('Failed to get authentication token', { error: (error as Error).message });
      // Continue without auth if token retrieval fails
    }

    const options: RequestInit = {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    };

    try {
      const response = await fetchWithRetry(url, options, uploadRetryConfig);
      return await response.json();
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error?.message || 'Unknown error occurred during upload',
        error?.status || 0
      );
    }
  }
}

// Upload multiple files with retry logic and progress tracking
export async function uploadMultipleFiles(
  files: File[],
  category?: string,
  relatedEntityId?: string,
  progressCallback?: UploadProgressCallback
): Promise<FileResponse[]> {
  // Custom retry config for uploads with longer timeouts
  const uploadRetryConfig: RetryConfig = {
    maxRetries: 3,
    initialDelay: 2000,
    maxDelay: 60000,
    factor: 2,
  };

  const formData = new FormData();

  files.forEach((file, _) => {
    formData.append('files', file);
  });

  if (category) {
    formData.append('category', category);
  }

  if (relatedEntityId) {
    formData.append('relatedEntityId', relatedEntityId);
  }

  // Use XMLHttpRequest for progress tracking
  if (progressCallback) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event: ProgressEvent) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          progressCallback(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText) as FileResponse[];
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));

      xhr.open('POST', `${API_BASE_URL}/uploads/files`);

      const token = getToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  } else {
    // Without progress tracking, use the fetch API with retry logic
    const url = `${AZURE_UPLOAD_URL}/uploads/files`;

    const headers: HeadersInit = {};

    try {
      // Try to get token from Auth0 first
      const token = await getToken().catch(() => null);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Fallback to localStorage if Auth0 token not available
        const localToken = localStorage.getItem('token');
        if (localToken) {
          headers['Authorization'] = `Bearer ${localToken}`;
        }
      }
    } catch (error) {
      logger.warn('Failed to get authentication token', { error: (error as Error).message });
      // Continue without auth if token retrieval fails
    }

    const options: RequestInit = {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    };

    try {
      const response = await fetchWithRetry(url, options, uploadRetryConfig);
      return await response.json();
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error?.message || 'Unknown error occurred during upload',
        error?.status || 0
      );
    }
  }
}

// Delete a file
export async function deleteFile(fileId: string): Promise<void> {
  await apiRequest(`/uploads/file/${fileId}`, 'DELETE');
}

// Get list of files (optionally filtered by prefix)
export async function getFiles(prefix?: string): Promise<FileResponse[]> {
  try {
    let url = '/uploads/files';
    if (prefix) {
      url += `?prefix=${encodeURIComponent(prefix)}`;
    }

    const response = await apiRequest<FileResponse[]>(url);
    return response;
  } catch (error: unknown) {
    logger.error('Error getting files', { error: (error as Error).message, prefix });
    throw error;
  }
}

// Error response wrapper as a class, available at runtime
export class ApiError extends Error {
  status?: number;
  details?: any;

  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    // Maintains proper stack trace (only needed in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

export const makeApiRequest = async <T = unknown>(
  endpoint: string,
  method: string = 'GET',
  data?: FormData | Record<string, unknown>,
  isFormData: boolean = false
): Promise<T> => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  };

  if (data && method !== 'GET') {
    options.body = isFormData ? data : JSON.stringify(data);
  }

  try {
    const response = await fetch(endpoint, options);

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }

      const error = new Error(errorMessage) as ApiError;
      error.status = response.status;
      throw error;
    }

    // Handle empty responses (like DELETE)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return {} as T;
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error('API request failed', {
        method,
        endpoint,
        error: error.message,
      });

      // For development, provide more helpful error messages
      if (process.env.NODE_ENV === 'development') {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Backend server is not running. Please start the backend service.');
        }
        if (error.message.includes('authorization token')) {
          throw new Error('Authentication required. This feature requires login.');
        }
      }
    }
    throw error;
  }
};

export default makeApiRequest;
