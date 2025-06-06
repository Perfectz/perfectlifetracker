/**
 * backend/src/middleware/requestEnhancer.ts
 * Request enhancement middleware for Perfect LifeTracker Pro
 */
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

// Enhanced request interface
export interface EnhancedRequest extends Request {
  id: string;
  startTime: number;
  context: {
    ip: string;
    userAgent: string;
    origin?: string;
    correlationId?: string;
  };
}

export class RequestEnhancer {
  /**
   * Add unique request ID and context to every request
   */
  static addRequestId(req: EnhancedRequest, res: Response, next: NextFunction): void {
    // Generate unique request ID
    req.id = req.headers['x-request-id'] as string || uuidv4();
    
    // Add request start time for performance monitoring
    req.startTime = Date.now();
    
    // Extract request context
    const origin = req.get('Origin') || req.get('Referer');
    const correlationId = req.headers['x-correlation-id'] as string;
    
    req.context = {
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      ...(origin && { origin }),
      ...(correlationId && { correlationId })
    };

    // Add request ID to response headers
    res.setHeader('X-Request-ID', req.id);
    
    // Add correlation ID if present
    if (req.context.correlationId) {
      res.setHeader('X-Correlation-ID', req.context.correlationId);
    }

    next();
  }

  /**
   * Log request details
   */
  static logRequest(req: EnhancedRequest, res: Response, next: NextFunction): void {
    // Skip logging for health checks and static assets
    if (req.path === '/health' || req.path.startsWith('/static/')) {
      return next();
    }

    logger.info('Incoming request', {
      requestId: req.id,
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      ip: req.context.ip,
      userAgent: req.context.userAgent,
      origin: req.context.origin,
      correlationId: req.context.correlationId,
      contentType: req.get('Content-Type'),
      contentLength: req.get('Content-Length'),
      timestamp: new Date().toISOString()
    });

    next();
  }

  /**
   * Log response details and performance metrics
   */
  static logResponse(req: EnhancedRequest, res: Response, next: NextFunction): void {
    // Skip logging for health checks and static assets
    if (req.path === '/health' || req.path.startsWith('/static/')) {
      return next();
    }

    // Intercept response to log when it finishes
    const originalSend = res.send;
    const originalJson = res.json;
    
    res.send = function(data: any) {
      logResponseDetails();
      return originalSend.call(this, data);
    };
    
    res.json = function(data: any) {
      logResponseDetails();
      return originalJson.call(this, data);
    };

    function logResponseDetails() {
      const duration = Date.now() - req.startTime;
      const statusCode = res.statusCode;
      
      // Determine log level based on status code
      const logLevel = statusCode >= 500 ? 'error' : 
                      statusCode >= 400 ? 'warn' : 'info';

      logger[logLevel]('Request completed', {
        requestId: req.id,
        method: req.method,
        url: req.url,
        path: req.path,
        statusCode,
        duration: `${duration}ms`,
        contentLength: res.get('Content-Length'),
        ip: req.context.ip,
        userAgent: req.context.userAgent,
        correlationId: req.context.correlationId,
        timestamp: new Date().toISOString()
      });

      // Log slow requests
      if (duration > 5000) { // 5 seconds
        logger.warn('Slow request detected', {
          requestId: req.id,
          method: req.method,
          url: req.url,
          duration: `${duration}ms`,
          threshold: '5000ms'
        });
      }
    }

    next();
  }

  /**
   * Add security headers
   */
  static addSecurityHeaders(req: Request, res: Response, next: NextFunction): void {
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' https:; " +
      "connect-src 'self' https:; " +
      "frame-ancestors 'none';"
    );

    // Other security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(), payment=()'
    );

    // Remove server signature
    res.removeHeader('X-Powered-By');

    next();
  }

  /**
   * Add request timeout
   */
  static addTimeout(timeoutMs: number = 30000) {
    return (req: EnhancedRequest, res: Response, next: NextFunction): void => {
      // Set request timeout
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          logger.warn('Request timeout', {
            requestId: req.id,
            method: req.method,
            url: req.url,
            timeout: `${timeoutMs}ms`
          });

          res.status(408).json({
            success: false,
            error: {
              code: 'REQUEST_TIMEOUT',
              message: 'Request timeout',
              requestId: req.id,
              timestamp: new Date().toISOString()
            }
          });
        }
      }, timeoutMs);

      // Clear timeout when response is sent
      res.on('finish', () => {
        clearTimeout(timeout);
      });

      res.on('close', () => {
        clearTimeout(timeout);
      });

      next();
    };
  }

  /**
   * Parse and validate common request data
   */
  static parseRequestData(req: EnhancedRequest, res: Response, next: NextFunction): void {
    // Parse user ID from various sources if authenticated
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        // This will be handled by auth middleware later
        // Just mark that auth is present
        (req as any).hasAuthToken = true;
      } catch (error) {
        // Auth parsing will be handled by auth middleware
      }
    }

    // Parse pagination parameters
    if (req.query.page || req.query.limit) {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 100); // Max 100 items
      const offset = (page - 1) * limit;

      (req as any).pagination = {
        page,
        limit,
        offset
      };
    }

    // Parse sorting parameters
    if (req.query.sort) {
      const sortParam = req.query.sort as string;
      const direction = req.query.order === 'desc' ? -1 : 1;
      
      (req as any).sorting = {
        field: sortParam,
        direction
      };
    }

    next();
  }

  /**
   * Combined request enhancement middleware stack
   */
  static enhance = [
    this.addRequestId,
    this.addSecurityHeaders,
    this.logRequest,
    this.parseRequestData,
    this.logResponse,
    this.addTimeout(30000) // 30 second timeout
  ];

  /**
   * Lightweight enhancement for high-traffic endpoints
   */
  static enhanceLite = [
    this.addRequestId,
    this.addSecurityHeaders,
    this.parseRequestData
  ];
}

export default RequestEnhancer; 