/**
 * backend/src/middleware/auth.ts
 * Centralized authentication middleware for Perfect LifeTracker Pro
 */
import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/UserModel';
import { logger } from '../utils/logger';

// Enhanced request interface with authentication
export interface AuthenticatedRequest extends Request {
  id?: string;
  user?: any;
  auth?: any;
}

// Authentication configuration interface
interface AuthConfig {
  jwksUri: string;
  audience: string;
  issuer: string;
  algorithms: string[];
}

export class AuthMiddleware {
  private static config: AuthConfig;
  private static jwtMiddleware: any;

  /**
   * Configure authentication middleware with Azure AD B2C settings
   */
  static configure(config: AuthConfig): void {
    this.config = config;
    
    this.jwtMiddleware = expressjwt({
      secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: config.jwksUri
      }),
      audience: config.audience,
      issuer: config.issuer,
      algorithms: config.algorithms as any[]
    });
  }

  /**
   * Initialize middleware with environment variables
   */
  static initialize(): void {
    if (!process.env.AZURE_AUTHORITY || !process.env.AZURE_CLIENT_ID) {
      throw new Error('Missing Azure AD configuration in environment variables');
    }

    this.configure({
      jwksUri: `${process.env.AZURE_AUTHORITY}/discovery/v2.0/keys`,
      audience: process.env.AZURE_CLIENT_ID,
      issuer: `${process.env.AZURE_AUTHORITY}/v2.0`,
      algorithms: ['RS256']
    });
  }

  /**
   * JWT validation middleware
   */
  static getJWTMiddleware() {
    if (!this.jwtMiddleware) {
      this.initialize();
    }
    return this.jwtMiddleware;
  }

  /**
   * Extract user information from JWT token and attach to request
   */
  static async extractUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      const email = req.auth?.email || req.auth?.preferred_username;
      
      if (!email) {
        logger.warn('Missing email in authentication token', {
          requestId: req.id,
          authPayload: req.auth
        });
        
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_EMAIL',
            message: 'Email not found in authentication token',
            requestId: req.id,
            timestamp: new Date().toISOString()
          }
        });
      }

      // Fetch user from database
      const user = await UserModel.getUserByEmail(email);
      
      if (!user) {
        logger.warn('User not found in database', {
          requestId: req.id,
          email: email
        });
        
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found in database',
            requestId: req.id,
            timestamp: new Date().toISOString()
          }
        });
      }

      // Update last login
      await UserModel.updateLastLogin(user.id);

      // Attach user to request object (standardized)
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePicture: user.profilePicture,
        lastLogin: new Date()
      };

      logger.info('User authenticated successfully', {
        requestId: req.id,
        userId: user.id,
        email: user.email,
        role: user.role
      });

      next();
    } catch (error) {
      logger.error('User extraction failed', {
        requestId: req.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      next(error); // Pass to global error handler
    }
  }

  /**
   * Role-based authorization middleware
   */
  static requireRole(allowedRoles: string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        logger.warn('Authorization attempted without user authentication', {
          requestId: req.id,
          requiredRoles: allowedRoles
        });
        
        res.status(401).json({
          success: false,
          error: {
            code: 'NO_USER',
            message: 'User authentication required',
            requestId: req.id,
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn('Insufficient permissions for user', {
          requestId: req.id,
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: allowedRoles
        });
        
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `Required roles: ${allowedRoles.join(', ')}`,
            requestId: req.id,
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      logger.info('Authorization successful', {
        requestId: req.id,
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles
      });

      next();
    };
  }

  /**
   * Optional authentication - don't fail if no token provided
   */
  static optionalAuth = [
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      // Make JWT middleware optional by handling missing token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(); // Continue without authentication
      }
      
      // Apply JWT middleware if token is present
      return this.getJWTMiddleware()(req, res, (err: any) => {
        if (err) {
          logger.warn('Optional JWT validation failed', {
            requestId: req.id,
            error: err.message
          });
          return next(); // Continue without authentication even if token is invalid
        }
        next();
      });
    },
    this.extractUser
  ];

  /**
   * Combined authentication middleware (JWT + User extraction)
   */
  static authenticate = [
    this.getJWTMiddleware(),
    this.extractUser
  ];

  /**
   * Alias for authenticate - for backward compatibility
   */
  static requireAuth = this.authenticate;

  /**
   * Admin-only access middleware
   */
  static adminOnly = [
    ...this.authenticate,
    this.requireRole(['admin'])
  ];

  /**
   * User or admin access middleware
   */
  static userOrAdmin = [
    ...this.authenticate,
    this.requireRole(['user', 'admin'])
  ];
}

// Initialize middleware on module load if environment is available
if (process.env.AZURE_AUTHORITY && process.env.AZURE_CLIENT_ID) {
  try {
    AuthMiddleware.initialize();
  } catch (error) {
    logger.error('Failed to initialize auth middleware', { error });
  }
}

export default AuthMiddleware; 