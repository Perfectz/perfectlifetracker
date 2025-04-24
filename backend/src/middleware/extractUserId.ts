// backend/src/middleware/extractUserId.ts
// Middleware for extracting user ID from JWT token

import { Request, Response, NextFunction } from 'express';

// Define interface for request with auth property from JWT middleware
interface AuthRequest extends Request {
  auth?: {
    sub?: string;
    oid?: string;
    [key: string]: unknown;
  };
  userId?: string;
}

/**
 * Middleware to extract userId from JWT token
 * Expects req.auth to be set by express-jwt middleware
 */
export const extractUserId = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthRequest;
  
  // If auth property is missing, use development fallback
  if (!authReq.auth) {
    console.warn('⚠️ Authentication missing. Using dev-user-123 for development.');
    authReq.userId = 'dev-user-123';
    return next();
  }
  
  // Extract userId from sub claim (standard) or oid (Azure AD)
  if (authReq.auth.sub) {
    authReq.userId = authReq.auth.sub;
  } else if (authReq.auth.oid) {
    authReq.userId = authReq.auth.oid as string;
  } else {
    console.warn('⚠️ No user identifier found in token. Using dev-user-123 fallback.');
    authReq.userId = 'dev-user-123';
  }
  
  next();
}; 