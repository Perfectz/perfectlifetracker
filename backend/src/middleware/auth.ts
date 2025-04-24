// backend/src/middleware/auth.ts
// Middleware for JWT authentication

import { expressjwt } from 'express-jwt';
import { Request, Response, NextFunction } from 'express';

/**
 * JWT authentication middleware
 * Verifies authentication tokens and adds auth info to the request
 */
export const authorize = (req: Request, res: Response, next: NextFunction) => {
  // In development mode, bypass auth for easier testing
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    console.log('⚠️ Development mode: Auth middleware bypassed');
    // Simulate authenticated user
    (req as any).auth = { 
      sub: 'dev-user-123', 
      name: 'Development User',
      email: 'dev@example.com'
    };
    return next();
  }

  // Configure JWT middleware with appropriate settings
  // In production, should use secret from environment variables
  const jwtMiddleware = expressjwt({ 
    secret: process.env.JWT_SECRET || 'development-secret-key', 
    algorithms: ['HS256', 'RS256'] 
  });

  // Apply the JWT middleware
  return jwtMiddleware(req, res, next);
}; 