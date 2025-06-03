/**
 * backend/src/utils/logger.ts
 * Production-ready logging utility with environment-specific configuration
 */

export interface LogMetadata {
  [key: string]: unknown;
}

export interface Logger {
  error(message: string, metadata?: LogMetadata): void;
  warn(message: string, metadata?: LogMetadata): void;
  info(message: string, metadata?: LogMetadata): void;
  debug(message: string, metadata?: LogMetadata): void;
}

class ProductionLogger implements Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private formatMessage(level: string, message: string, metadata?: LogMetadata): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(metadata && { metadata }),
      ...(this.isDevelopment && { env: 'development' })
    };

    return this.isProduction 
      ? JSON.stringify(logEntry)  // Structured JSON for production
      : `[${timestamp}] ${level.toUpperCase()}: ${message}${metadata ? ` | ${JSON.stringify(metadata)}` : ''}`;
  }

  private shouldLog(level: string): boolean {
    if (this.isProduction) {
      // In production, only log info and above
      return ['error', 'warn', 'info'].includes(level.toLowerCase());
    }
    
    // In development, log everything
    return true;
  }

  private sanitizeMetadata(metadata?: LogMetadata): LogMetadata | undefined {
    if (!metadata) return undefined;

    // Remove sensitive information from logs
    const sanitized = { ...metadata };
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'authorization', 'cookie'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  error(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('error')) {
      const sanitizedMetadata = this.sanitizeMetadata(metadata);
      console.error(this.formatMessage('error', message, sanitizedMetadata));
    }
  }

  warn(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('warn')) {
      const sanitizedMetadata = this.sanitizeMetadata(metadata);
      console.warn(this.formatMessage('warn', message, sanitizedMetadata));
    }
  }

  info(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('info')) {
      const sanitizedMetadata = this.sanitizeMetadata(metadata);
      console.info(this.formatMessage('info', message, sanitizedMetadata));
    }
  }

  debug(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('debug')) {
      const sanitizedMetadata = this.sanitizeMetadata(metadata);
      console.debug(this.formatMessage('debug', message, sanitizedMetadata));
    }
  }
}

// Singleton logger instance
export const logger: Logger = new ProductionLogger();

// Helper functions for common logging patterns
export const logApiRequest = (method: string, endpoint: string, userId?: string) => {
  logger.info(`API Request: ${method} ${endpoint}`, { 
    method, 
    endpoint, 
    userId: userId || 'anonymous',
    requestId: generateRequestId()
  });
};

export const logApiError = (method: string, endpoint: string, error: Error, userId?: string) => {
  logger.error(`API Error: ${method} ${endpoint}`, {
    method,
    endpoint,
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    userId: userId || 'anonymous'
  });
};

export const logDatabaseOperation = (operation: string, collection: string, success: boolean, duration?: number) => {
  const level = success ? 'info' : 'error';
  const message = `Database ${operation} on ${collection}: ${success ? 'SUCCESS' : 'FAILED'}`;
  
  logger[level](message, {
    operation,
    collection,
    success,
    duration: duration ? `${duration}ms` : undefined
  });
};

export const logAuthEvent = (event: string, userId?: string, success: boolean = true) => {
  logger.info(`Auth Event: ${event}`, {
    event,
    userId: userId || 'anonymous',
    success,
    timestamp: new Date().toISOString()
  });
};

// Generate unique request ID for tracing
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Export default logger
export default logger; 