/**
 * backend/src/middleware/errorHandler.ts
 * Global error handling middleware for Perfect LifeTracker Pro
 */
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Standard error response format
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    requestId: string;
    timestamp: string;
    type?: string;
  };
}

// Custom error class for application errors
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error types for common scenarios
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(`${service} service error: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', details);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class ErrorHandler {
  /**
   * Global error handling middleware
   */
  static handleError(
    error: Error | AppError,
    req: Request & { id?: string },
    res: Response,
    next: NextFunction
  ): void {
    const requestId = req.id || 'unknown';
    
    // Determine if this is an operational error
    const isOperational = error instanceof AppError && error.isOperational;
    
    // Extract error details
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const errorCode = error instanceof AppError ? error.code : 'INTERNAL_ERROR';
    const errorDetails = error instanceof AppError ? error.details : undefined;
    
    // Log error with appropriate level
    const logLevel = statusCode >= 500 ? 'error' : 'warn';
    const logMessage = isOperational 
      ? 'Operational error occurred'
      : 'Unexpected error occurred';
    
    logger[logLevel](logMessage, {
      requestId,
      errorCode,
      message: error.message,
      statusCode,
      stack: error.stack,
      details: errorDetails,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
      isOperational
    });

    // Don't expose internal errors in production
    const shouldExposeError = process.env.NODE_ENV !== 'production' || isOperational;
    
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message: shouldExposeError ? error.message : 'Internal server error',
        details: shouldExposeError ? errorDetails : undefined,
        requestId,
        timestamp: new Date().toISOString(),
        type: error.constructor.name
      }
    };

    // Remove undefined fields
    if (!errorResponse.error.details) {
      delete errorResponse.error.details;
    }

    res.status(statusCode).json(errorResponse);
  }

  /**
   * Handle 404 errors for unmatched routes
   */
  static handleNotFound(
    req: Request & { id?: string },
    res: Response,
    next: NextFunction
  ): void {
    const requestId = req.id || 'unknown';
    
    logger.warn('Route not found', {
      requestId,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `Route ${req.method} ${req.url} not found`,
        requestId,
        timestamp: new Date().toISOString()
      }
    };

    res.status(404).json(errorResponse);
  }

  /**
   * Handle async errors by wrapping route handlers
   */
  static asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Handle unhandled promise rejections
   */
  static handleUnhandledRejection(): void {
    process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
      logger.error('Unhandled promise rejection', {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        promise: promise.toString()
      });
      
      // Graceful shutdown
      process.exit(1);
    });
  }

  /**
   * Handle uncaught exceptions
   */
  static handleUncaughtException(): void {
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught exception', {
        message: error.message,
        stack: error.stack
      });
      
      // Graceful shutdown
      process.exit(1);
    });
  }

  /**
   * Initialize global error handling
   */
  static initialize(): void {
    this.handleUnhandledRejection();
    this.handleUncaughtException();
  }
}

// Error factory functions for common scenarios
export const createValidationError = (message: string, details?: any) => 
  new ValidationError(message, details);

export const createNotFoundError = (resource?: string) => 
  new NotFoundError(resource);

export const createAuthenticationError = (message?: string) => 
  new AuthenticationError(message);

export const createAuthorizationError = (message?: string) => 
  new AuthorizationError(message);

export const createConflictError = (message: string, details?: any) => 
  new ConflictError(message, details);

export const createDatabaseError = (message: string, details?: any) => 
  new DatabaseError(message, details);

export const createExternalServiceError = (service: string, message: string, details?: any) => 
  new ExternalServiceError(service, message, details);

export const createRateLimitError = (message?: string) => 
  new RateLimitError(message);

// Initialize error handling
ErrorHandler.initialize();

export default ErrorHandler; 