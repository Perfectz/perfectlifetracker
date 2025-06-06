/**
 * backend/src/middleware/requestId.ts
 * Request ID middleware for tracking requests
 */
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Middleware to add unique request ID to each request
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Generate unique request ID
  req.id = uuidv4();
  
  // Add request ID to response headers for debugging
  res.setHeader('X-Request-ID', req.id);
  
  next();
}

export default requestIdMiddleware; 