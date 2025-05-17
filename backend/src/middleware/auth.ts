// backend/src/middleware/auth.ts
// Middleware for JWT authentication

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// Interface to define auth property added by JWT middleware
interface AuthRequest extends Request {
  auth?: {
    sub?: string;
    oid?: string;
    [key: string]: unknown;
  };
  userId?: string;
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // Get the authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  
  const token = authHeader.split(' ')[1]; // Bearer <token>
  
  if (!token) {
    return res.status(401).json({ error: 'Token is required' });
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    
    // Add user info to request
    req.user = {
      id: decoded.sub as string,
      email: decoded.email as string,
      name: decoded.name as string
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Function to extract userId from JWT token claims
 * Used by routers that need to access the userId
 */
export const extractUserId = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  
  // Get userId from the JWT token claims (sub or oid)
  const userId = authReq.auth?.sub || authReq.auth?.oid || '';
  
  if (!userId) {
    return res.status(401).json({ 
      error: 'AuthError', 
      message: 'User ID not found in token' 
    });
  }
  
  authReq.userId = userId;
  next();
};

/**
 * Function to create a middleware that checks for specific roles
 * @param requiredRoles Array of roles required to access a resource
 * @returns Middleware function for role-based authorization
 */
export const authorize = (requiredRoles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // If no roles are required, just proceed
    if (requiredRoles.length === 0) {
      return next();
    }
    
    // Check if user exists on request (set by authMiddleware)
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authentication required' 
      });
    }
    
    // For now, we'll just authorize all authenticated users
    // In a real implementation, you would check req.user.roles against requiredRoles
    
    next();
  };
}; 