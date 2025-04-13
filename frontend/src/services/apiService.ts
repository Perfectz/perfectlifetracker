/**
 * frontend/src/services/apiService.ts
 * Service for handling API calls to the backend
 */
// Replacing axios with a simple fetch-based implementation
import { getToken } from './auth';
import { API_BASE_URL, AZURE_UPLOAD_URL } from "../config/api";

// Circuit breaker implementation
interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
}

const circuitBreaker: CircuitBreakerState = {
  failures: 0,
  lastFailure: 0,
  isOpen: false
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
    console.warn(`Circuit breaker opened after ${CIRCUIT_THRESHOLD} failures. Will retry after ${CIRCUIT_RESET_TIMEOUT/1000}s`);
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
  factor: 2 // exponential backoff factor
};

// Error response wrapper
export interface ApiError extends Error {
  status?: number;
  details?: any;
}

// Progress tracking for file uploads
export interface UploadProgressCallback {
  (progress: number): void;
}

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
function isRetryableError(error: any): boolean {
  // Network errors are generally retryable
  if (!error.status) return true;
  
  // 5xx server errors are retryable
  if (error.status >= 500 && error.status < 600) return true;
  
  // 429 Too Many Requests is retryable
  if (error.status === 429) return true;
  
  // Azure Blob Storage specific errors that are retryable
  // 409 Conflict can occur during concurrent operations
  // 412 Precondition Failed might be temporary in some cases
  const azureBlobRetryableErrors = [409, 412];
  if (azureBlobRetryableErrors.includes(error.status)) {
    // Check if error is from Azure Blob storage specifically
    if (error.details?.error?.includes('BlobAlreadyExists') || 
        error.details?.error?.includes('ConditionNotMet')) {
      return true;
    }
  }
  
  // Specific API errors that might be retryable
  const retryableStatusCodes = [408, 503, 504];
  return retryableStatusCodes.includes(error.status);
}

// Base fetch function with retry logic
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  retryConfig = defaultRetryConfig,
  progressCallback?: UploadProgressCallback
): Promise<Response> {
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
      // If this is a retry and we're using a progress callback, reset progress to previous value
      if (retries > 0 && progressCallback) {
        // Calculate approximate progress based on retry count
        // Each retry starts from 0, so we adjust progress to show continuity
        const approximateProgress = Math.min(90, (retries / (retryConfig.maxRetries + 1)) * 100);
        progressCallback(approximateProgress);
      }

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
      return response;
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
      console.log(`API call failed, retrying in ${delay}ms...`, error);
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
export async function apiRequest<T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any, 
  includeAuth: boolean = true,
  retryConfig?: RetryConfig
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (includeAuth) {
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
      console.warn('Failed to get authentication token:', error);
      // Continue without auth if token retrieval fails
    }
  }
  
  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetchWithRetry(url, options, retryConfig);
    return await response.json();
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      error?.message || 'Unknown error occurred', 
      error?.status || 0
    );
  }
}

// File interface for upload responses
export interface FileResponse {
  file: {
    id: string;
    fileName: string;
    url: string;
    contentType: string;
    size: number;
    blobName: string;
  };
}

// Multiple files interface for upload responses
export interface MultipleFilesResponse {
  files: Array<{
    id: string;
    fileName: string;
    url: string;
    contentType: string;
    size: number;
    blobName: string;
  }>;
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
    factor: 2
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
      let retries = 0;
      const maxRetries = uploadRetryConfig.maxRetries;
      
      const attemptUpload = async () => {
        const xhr = new XMLHttpRequest();
        
        xhr.open('POST', `${AZURE_UPLOAD_URL}/upload`, true);
        
        // Add auth header if available
        try {
          // Try to get token from Auth0 first
          const token = await getToken().catch(() => null);
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          } else {
            // Fallback to localStorage if Auth0 token not available
            const localToken = localStorage.getItem('token');
            if (localToken) {
              xhr.setRequestHeader('Authorization', `Bearer ${localToken}`);
            }
          }
        } catch (error) {
          console.warn('Failed to get authentication token:', error);
          // Continue without auth if token retrieval fails
        }
        
        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            progressCallback(percentComplete);
          }
        };
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new ApiError('Failed to parse server response', xhr.status));
            }
          } else {
            // Handle error response
            let errorMessage = `Upload failed with status ${xhr.status}`;
            let errorData = null;
            
            try {
              errorData = JSON.parse(xhr.responseText);
              errorMessage = errorData.message || errorMessage;
            } catch (e) {
              // Ignore JSON parse error for error response
            }
            
            const error = new ApiError(errorMessage, xhr.status, errorData);
            
            // Check if we should retry
            if (retries < maxRetries && isRetryableError(error)) {
              retries++;
              const delay = getBackoffDelay(retries, uploadRetryConfig);
              console.log(`Upload failed, retrying in ${delay}ms...`, error);
              
              // Signal retry is happening via progress callback
              if (progressCallback) {
                progressCallback(0); // Reset progress for new attempt
              }
              
              setTimeout(attemptUpload, delay);
            } else {
              reject(error);
            }
          }
        };
        
        xhr.onerror = function() {
          const error = new ApiError('Network error during upload', 0);
          
          // Check if we should retry
          if (retries < maxRetries) {
            retries++;
            const delay = getBackoffDelay(retries, uploadRetryConfig);
            console.log(`Upload failed due to network error, retrying in ${delay}ms...`);
            
            // Signal retry is happening via progress callback
            if (progressCallback) {
              progressCallback(0); // Reset progress for new attempt
            }
            
            setTimeout(attemptUpload, delay);
          } else {
            reject(error);
          }
        };
        
        // Start the upload
        xhr.send(formData);
      };
      
      // Start first attempt
      attemptUpload();
    });
  } else {
    // Without progress tracking, use the fetch API with retry logic
    const url = `${AZURE_UPLOAD_URL}/upload`;
    
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
      console.warn('Failed to get authentication token:', error);
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
): Promise<MultipleFilesResponse> {
  // Custom retry config for uploads with longer timeouts
  const uploadRetryConfig: RetryConfig = {
    maxRetries: 3,
    initialDelay: 2000,
    maxDelay: 60000,
    factor: 2
  };

  const formData = new FormData();
  
  files.forEach((file, index) => {
    formData.append(`files`, file);
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
      let retries = 0;
      const maxRetries = uploadRetryConfig.maxRetries;
      
      const attemptUpload = async () => {
        const xhr = new XMLHttpRequest();
        
        xhr.open('POST', `${AZURE_UPLOAD_URL}/upload/multiple`, true);
        
        // Add auth header if available
        try {
          // Try to get token from Auth0 first
          const token = await getToken().catch(() => null);
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          } else {
            // Fallback to localStorage if Auth0 token not available
            const localToken = localStorage.getItem('token');
            if (localToken) {
              xhr.setRequestHeader('Authorization', `Bearer ${localToken}`);
            }
          }
        } catch (error) {
          console.warn('Failed to get authentication token:', error);
          // Continue without auth if token retrieval fails
        }
        
        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            progressCallback(percentComplete);
          }
        };
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new ApiError('Failed to parse server response', xhr.status));
            }
          } else {
            // Handle error response
            let errorMessage = `Upload failed with status ${xhr.status}`;
            let errorData = null;
            
            try {
              errorData = JSON.parse(xhr.responseText);
              errorMessage = errorData.message || errorMessage;
            } catch (e) {
              // Ignore JSON parse error for error response
            }
            
            const error = new ApiError(errorMessage, xhr.status, errorData);
            
            // Check if we should retry
            if (retries < maxRetries && isRetryableError(error)) {
              retries++;
              const delay = getBackoffDelay(retries, uploadRetryConfig);
              console.log(`Upload failed, retrying in ${delay}ms...`, error);
              
              // Signal retry is happening via progress callback
              if (progressCallback) {
                progressCallback(0); // Reset progress for new attempt
              }
              
              setTimeout(attemptUpload, delay);
            } else {
              reject(error);
            }
          }
        };
        
        xhr.onerror = function() {
          const error = new ApiError('Network error during upload', 0);
          
          // Check if we should retry
          if (retries < maxRetries) {
            retries++;
            const delay = getBackoffDelay(retries, uploadRetryConfig);
            console.log(`Upload failed due to network error, retrying in ${delay}ms...`);
            
            // Signal retry is happening via progress callback
            if (progressCallback) {
              progressCallback(0); // Reset progress for new attempt
            }
            
            setTimeout(attemptUpload, delay);
          } else {
            reject(error);
          }
        };
        
        // Start the upload
        xhr.send(formData);
      };
      
      // Start first attempt
      attemptUpload();
    });
  } else {
    // Without progress tracking, use the fetch API with retry logic
    const url = `${AZURE_UPLOAD_URL}/upload/multiple`;
    
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
      console.warn('Failed to get authentication token:', error);
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
  await apiRequest(`/files/${fileId}`, 'DELETE', null, true);
}

// Get list of files (optionally filtered by prefix)
export async function getFiles(prefix?: string): Promise<any> {
  try {
    let url = '/upload/files';
    if (prefix) {
      url += `?prefix=${encodeURIComponent(prefix)}`;
    }
    
    const response = await apiRequest(url);
    return response.data;
  } catch (error: any) {
    console.error('Error getting files:', error);
    throw error;
  }
}

export default apiRequest; 