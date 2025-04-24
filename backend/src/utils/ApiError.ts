// backend/src/utils/ApiError.ts
// Custom API error class with status code for HTTP responses

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status = 500, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    
    // Capturing stack trace (V8 specific)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(message, 404);
  }

  static badRequest(message = 'Invalid request', data?: unknown): ApiError {
    return new ApiError(message, 400, data);
  }

  static forbidden(message = 'Access forbidden'): ApiError {
    return new ApiError(message, 403);
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(message, 401);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(message, 500);
  }
} 