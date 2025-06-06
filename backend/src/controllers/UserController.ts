/**
 * backend/src/controllers/UserController.ts
 * User controller integrating validation middleware with UserService
 */
import { Request, Response, NextFunction } from 'express';
import { userService, User, CreateUserInput } from '../services/UserService';
import ValidationMiddleware from '../middleware/validation';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { cacheService } from '../services/CacheService';

// Enhanced request interface
interface UserRequest extends AuthenticatedRequest {
  validated?: {
    body?: any;
    query?: any;
    params?: any;
  };
}

export class UserController {
  /**
   * Create a new user
   */
  static async createUser(req: UserRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: CreateUserInput = req.validated?.body || req.body;

      const user = await userService.createUser(userData);
      
      // Remove sensitive data before sending response
      const userResponse = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        preferences: user.preferences,
        stats: user.stats,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      logger.info('User created via API', {
        userId: user.id,
        email: user.email,
        requestId: req.id
      });

      res.status(201).json({
        success: true,
        data: userResponse,
        message: 'User created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(req: UserRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validated?.params || req.params;
      
      // Check cache first
      const cacheKey = `user:${id}`;
      const cachedUser = cacheService.get<User>(cacheKey);
      
      if (cachedUser) {
        logger.info('User retrieved from cache', {
          userId: id,
          requestId: req.id
        });

        res.json({
          success: true,
          data: cachedUser,
          cached: true
        });
        return;
      }

      const user = await userService.findById(id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
        return;
      }

      // Cache the user data for 5 minutes
      cacheService.set(cacheKey, user, 5 * 60 * 1000);

      logger.info('User retrieved via API', {
        userId: id,
        requestId: req.id
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   */
  static async updateUser(req: UserRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validated?.params || req.params;
      const updateData = req.validated?.body || req.body;

      // Check if user exists and user has permission to update
      const currentUser = req.user;
      if (currentUser.role !== 'admin' && currentUser.id !== id) {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You can only update your own profile'
          }
        });
        return;
      }

      const updatedUser = await userService.updateUser(id, updateData);
      
      // Invalidate cache
      cacheService.delete(`user:${id}`);
      cacheService.deleteByPattern(`users:.*`); // Clear user list caches

      logger.info('User updated via API', {
        userId: id,
        updatedBy: currentUser.id,
        updatedFields: Object.keys(updateData),
        requestId: req.id
      });

      res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(req: UserRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validated?.params || req.params;
      const currentUser = req.user;

      // Only admins can delete users
      if (currentUser.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Only administrators can delete users'
          }
        });
        return;
      }

      // Soft delete by deactivating the user
      const deactivatedUser = await userService.deactivateUser(id);
      
      // Invalidate caches
      cacheService.delete(`user:${id}`);
      cacheService.deleteByPattern(`users:.*`);

      logger.info('User deactivated via API', {
        userId: id,
        deactivatedBy: currentUser.id,
        requestId: req.id
      });

      res.json({
        success: true,
        data: deactivatedUser,
        message: 'User deactivated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List users with search and pagination
   */
  static async listUsers(req: UserRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams = req.validated?.query || req.query;
      const {
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc',
        search,
        role,
        active
      } = queryParams;

      const currentUser = req.user;
      
      // Only admins and moderators can list all users
      if (currentUser.role === 'user') {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Insufficient permissions to list users'
          }
        });
        return;
      }

      // Generate cache key
      const cacheKey = cacheService.generateKey('users', {
        page,
        limit,
        sort,
        order,
        search,
        role,
        active
      });

      // Check cache first
      const cachedResult = cacheService.get(cacheKey);
      if (cachedResult) {
        logger.info('User list retrieved from cache', {
          requestId: req.id,
          params: queryParams
        });

        res.json({
          success: true,
          data: (cachedResult as any).data,
          pagination: (cachedResult as any).pagination,
          cached: true
        });
        return;
      }

      const filters = { search, role, isActive: active };
      const pagination = { page: Number(page), limit: Number(limit), sort, order };
      
      const result = await userService.searchUsers(filters, pagination);
      
      // Cache for 2 minutes
      cacheService.set(cacheKey, result, 2 * 60 * 1000);

      logger.info('User list retrieved via API', {
        requestId: req.id,
        params: queryParams,
        resultCount: result.data.length,
        total: result.pagination.total
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: UserRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user;
      const userId = currentUser.id;

      // Use cached approach
      const cacheKey = `user:${userId}`;
      const user = await cacheService.getOrSet(
        cacheKey,
        () => userService.findById(userId),
        5 * 60 * 1000 // 5 minutes
      );

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User profile not found'
          }
        });
        return;
      }

      logger.info('User profile retrieved', {
        userId,
        requestId: req.id
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update current user profile
   */
  static async updateProfile(req: UserRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user;
      const updateData = req.validated?.body || req.body;

      // Remove role update for non-admins
      if (currentUser.role !== 'admin' && updateData.role) {
        delete updateData.role;
      }

      const updatedUser = await userService.updateUser(currentUser.id, updateData);
      
      // Invalidate cache
      cacheService.delete(`user:${currentUser.id}`);

      logger.info('User profile updated', {
        userId: currentUser.id,
        updatedFields: Object.keys(updateData),
        requestId: req.id
      });

      res.json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(req: UserRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validated?.params || req.params;
      const currentUser = req.user;

      // Users can only view their own stats unless they're admin
      if (currentUser.role !== 'admin' && currentUser.id !== id) {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You can only view your own statistics'
          }
        });
        return;
      }

      const cacheKey = `user-stats:${id}`;
      const stats = await cacheService.getOrSet(
        cacheKey,
        () => userService.getUserStats(id),
        60 * 1000 // 1 minute cache
      );

      if (!stats) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
        return;
      }

      logger.info('User stats retrieved', {
        userId: id,
        requestedBy: currentUser.id,
        requestId: req.id
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active users count (admin only)
   */
  static async getActiveUsersCount(req: UserRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user;

      if (currentUser.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Only administrators can view active users count'
          }
        });
        return;
      }

      const cacheKey = 'active-users-count';
      const count = await cacheService.getOrSet(
        cacheKey,
        () => userService.getActiveUsersCount(),
        5 * 60 * 1000 // 5 minutes cache
      );

      logger.info('Active users count retrieved', {
        count,
        requestedBy: currentUser.id,
        requestId: req.id
      });

      res.json({
        success: true,
        data: { activeUsersCount: count }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController; 