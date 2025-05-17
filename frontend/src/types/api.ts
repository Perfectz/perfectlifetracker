// frontend/src/types/api.ts
// Types for API responses and error handling

/**
 * Standard API error structure
 */
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  data?: any;
}

/**
 * Generic API response wrapper
 * Provides consistent structure for all API responses
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status?: number;
  isError: boolean;
}

/**
 * Standard error response from the API
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
} 