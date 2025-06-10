/**
 * backend/src/routes/authRoutes.ts
 * Simple authentication routes for Perfect LifeTracker Pro
 */
import express from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/UserModel';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * POST /auth/login
 * Simple email/password login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Email and password are required',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Authenticate user
    const user = await UserModel.authenticateUser(email, password);
    
    if (!user) {
      logger.warn('Failed login attempt', { email });
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'Account has been disabled',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || 'development-jwt-secret',
      { expiresIn: '24h' }
    );

    // Update last login
    await UserModel.updateLastLogin(user.id);

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profilePicture: user.profilePicture,
          lastLogin: new Date().toISOString()
        }
      },
      message: 'Login successful'
    });

  } catch (error) {
    logger.error('Login error', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during login',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * POST /auth/verify
 * Verify JWT token and return user info
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Token is required',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-jwt-secret') as any;
    
    // Get current user data
    const user = await UserModel.getUserById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token is invalid or user not found',
          timestamp: new Date().toISOString()
        }
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profilePicture: user.profilePicture,
          lastLogin: user.lastLogin
        }
      },
      message: 'Token verified successfully'
    });

  } catch (error) {
    logger.error('Token verification error', { error });
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token verification failed',
        timestamp: new Date().toISOString()
      }
    });
  }
});

export default router; 