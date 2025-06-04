/**
 * frontend/src/utils/logger.ts
 * Client-side logging utility with environment-specific behavior
 */

export interface LogMetadata {
  [key: string]: unknown;
}

export interface ClientLogger {
  error(message: string, metadata?: LogMetadata): void;
  warn(message: string, metadata?: LogMetadata): void;
  info(message: string, metadata?: LogMetadata): void;
  debug(message: string, metadata?: LogMetadata): void;
}

class ProductionClientLogger implements ClientLogger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
    this.isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
  }

  private formatMessage(level: string, message: string, metadata?: LogMetadata): string {
    const timestamp = new Date().toISOString();

    if (this.isDevelopment) {
      // Human-readable format for development
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${metadata ? ` | ${JSON.stringify(metadata)}` : ''}`;
    } else {
      // Structured format for production monitoring
      const logEntry = {
        timestamp,
        level: level.toUpperCase(),
        message,
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...(metadata && { metadata }),
      };
      return JSON.stringify(logEntry);
    }
  }

  private shouldLog(level: string): boolean {
    if (this.isProduction) {
      // In production, only log errors and warnings
      return ['error', 'warn'].includes(level.toLowerCase());
    }

    // In development, log everything
    return true;
  }

  private sanitizeMetadata(metadata?: LogMetadata): LogMetadata | undefined {
    if (!metadata) return undefined;

    // Remove sensitive information from client-side logs
    const sanitized = { ...metadata };
    const sensitiveKeys = [
      'password',
      'token',
      'key',
      'secret',
      'authorization',
      'cookie',
      'session',
    ];

    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sendToMonitoring(level: string, message: string, metadata?: LogMetadata): void {
    // In production, we could send logs to a monitoring service
    if (this.isProduction && ['error', 'warn'].includes(level.toLowerCase())) {
      // Example: Send to monitoring service like Sentry, LogRocket, etc.
      // This would be implemented based on the monitoring solution chosen
      // For now, we'll just use console in production for critical issues
      if (level === 'error') {
        console.error(this.formatMessage(level, message, metadata));
      }
    }
  }

  error(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('error')) {
      const sanitizedMetadata = this.sanitizeMetadata(metadata);
      const formattedMessage = this.formatMessage('error', message, sanitizedMetadata);

      console.error(formattedMessage);
      this.sendToMonitoring('error', message, sanitizedMetadata);
    }
  }

  warn(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('warn')) {
      const sanitizedMetadata = this.sanitizeMetadata(metadata);
      const formattedMessage = this.formatMessage('warn', message, sanitizedMetadata);

      console.warn(formattedMessage);
      this.sendToMonitoring('warn', message, sanitizedMetadata);
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
export const logger: ClientLogger = new ProductionClientLogger();

// Helper functions for common frontend logging patterns
export const logPageView = (pageName: string, userId?: string) => {
  logger.info(`Page View: ${pageName}`, {
    page: pageName,
    userId: userId || 'anonymous',
    timestamp: new Date().toISOString(),
    url: window.location.href,
  });
};

export const logUserAction = (action: string, component: string, metadata?: LogMetadata) => {
  logger.info(`User Action: ${action} in ${component}`, {
    action,
    component,
    ...metadata,
    timestamp: new Date().toISOString(),
  });
};

export const logApiError = (endpoint: string, error: Error, statusCode?: number) => {
  logger.error(`API Error: ${endpoint}`, {
    endpoint,
    error: error.message,
    statusCode,
    timestamp: new Date().toISOString(),
  });
};

export const logAuthEvent = (event: string, success: boolean, error?: string) => {
  const level = success ? 'info' : 'error';
  logger[level](`Auth Event: ${event}`, {
    event,
    success,
    error: error || undefined,
    timestamp: new Date().toISOString(),
  });
};

export const logComponentError = (
  component: string,
  error: Error,
  props?: Record<string, unknown>
) => {
  logger.error(`Component Error in ${component}`, {
    component,
    error: error.message,
    stack: error.stack,
    props: props ? JSON.stringify(props) : undefined,
    timestamp: new Date().toISOString(),
  });
};

// Export default logger
export default logger;
