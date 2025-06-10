/**
 * backend/src/routes/api.ts
 * Comprehensive API routes with Phase 3 service integration
 */
import { Router } from 'express';
import Joi from 'joi';
import UserController from '../controllers/UserController';
import TaskController from '../controllers/TaskController';
import ValidationMiddleware from '../middleware/validation';
import AuthMiddleware from '../middleware/auth';
import { cacheService } from '../services/CacheService';
import databaseService from '../services/DatabaseService';
import { logger } from '../utils/logger';
import fitnessRoutes from './fitnessRoutes';
import authRoutes from './authRoutes';

const router = Router();

// Health check endpoint with detailed status
router.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Get cache statistics
    const cacheStats = cacheService.getStats();
    
    // Get database health (mock for now)
    const dbHealth = { status: 'healthy', responseTime: 0 };
    
    const responseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime,
      services: {
        database: dbHealth,
        cache: {
          status: 'healthy',
          ...cacheStats
        },
        api: {
          status: 'healthy',
          responseTime
        }
      },
      environment: process.env.NODE_ENV || 'development',
      keyVaultEnabled: process.env.USE_KEY_VAULT === 'true',
      version: '1.0.0'
    };

    logger.info('Health check requested', {
      responseTime,
      requestId: req.id
    });

    res.json(healthStatus);
  } catch (error) {
    logger.error('Health check failed', {
      error: error instanceof Error ? error.message : String(error),
      requestId: req.id
    });

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service temporarily unavailable'
    });
  }
});

// Cache management endpoints (admin only)
router.get('/cache/stats', 
  AuthMiddleware.requireAuth,
  AuthMiddleware.requireRole(['admin']),
  (req, res) => {
    const stats = cacheService.getStats();
    res.json({
      success: true,
      data: stats
    });
  }
);

router.delete('/cache/clear',
  AuthMiddleware.requireAuth,
  AuthMiddleware.requireRole(['admin']),
  (req, res) => {
    cacheService.clear();
    logger.info('Cache cleared by admin', {
      adminId: req.user?.id,
      requestId: req.id
    });
    
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  }
);

// ===================
// USER ROUTES
// ===================

// Create user (public endpoint for registration)
router.post('/users',
  ValidationMiddleware.validateCreateUser,
  UserController.createUser
);

// Get current user profile (authenticated)
router.get('/users/me',
  AuthMiddleware.requireAuth,
  UserController.getProfile
);

// Update current user profile
router.put('/users/me',
  AuthMiddleware.requireAuth,
  ValidationMiddleware.validateUpdateUser,
  UserController.updateProfile
);

// Get user by ID (admin/moderator only)
router.get('/users/:id',
  AuthMiddleware.requireAuth,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ValidationMiddleware.validateObjectId('id'),
  UserController.getUserById
);

// Update user by ID (admin only)
router.put('/users/:id',
  AuthMiddleware.requireAuth,
  AuthMiddleware.requireRole(['admin']),
  ValidationMiddleware.validateObjectId('id'),
  ValidationMiddleware.validateUpdateUser,
  UserController.updateUser
);

// Delete/deactivate user (admin only)
router.delete('/users/:id',
  AuthMiddleware.requireAuth,
  AuthMiddleware.requireRole(['admin']),
  ValidationMiddleware.validateObjectId('id'),
  UserController.deleteUser
);

// List users with search and pagination (admin/moderator only)
router.get('/users',
  AuthMiddleware.requireAuth,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ValidationMiddleware.validateListItems,
  UserController.listUsers
);

// Get user statistics
router.get('/users/:id/stats',
  AuthMiddleware.requireAuth,
  ValidationMiddleware.validateObjectId('id'),
  UserController.getUserStats
);

// Get active users count (admin only)
router.get('/users/stats/active-count',
  AuthMiddleware.requireAuth,
  AuthMiddleware.requireRole(['admin']),
  UserController.getActiveUsersCount
);

// ===================
// TASK ROUTES
// ===================

// Create task
router.post('/tasks',
  AuthMiddleware.requireAuth,
  ValidationMiddleware.validateCreateTask,
  TaskController.createTask
);

// Get current user's tasks
router.get('/tasks',
  AuthMiddleware.requireAuth,
  ValidationMiddleware.validateListItems,
  TaskController.getUserTasks
);

// Get tasks for specific user (admin/moderator only)
router.get('/tasks/user/:userId',
  AuthMiddleware.requireAuth,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ValidationMiddleware.validateObjectId('userId'),
  ValidationMiddleware.validateListItems,
  TaskController.getUserTasks
);

// Get overdue tasks for current user
router.get('/tasks/overdue',
  AuthMiddleware.requireAuth,
  TaskController.getOverdueTasks
);

// Get tasks due today for current user
router.get('/tasks/due-today',
  AuthMiddleware.requireAuth,
  TaskController.getTasksDueToday
);

// Get task statistics for current user
router.get('/tasks/stats',
  AuthMiddleware.requireAuth,
  TaskController.getTaskStats
);

// Get task statistics for specific user (admin only)
router.get('/tasks/stats/:userId',
  AuthMiddleware.requireAuth,
  AuthMiddleware.requireRole(['admin']),
  ValidationMiddleware.validateObjectId('userId'),
  TaskController.getTaskStats
);

// Get task by ID
router.get('/tasks/:id',
  AuthMiddleware.requireAuth,
  ValidationMiddleware.validateObjectId('id'),
  TaskController.getTaskById
);

// Update task
router.put('/tasks/:id',
  AuthMiddleware.requireAuth,
  ValidationMiddleware.validateObjectId('id'),
  ValidationMiddleware.validateUpdateTask,
  TaskController.updateTask
);

// Delete task
router.delete('/tasks/:id',
  AuthMiddleware.requireAuth,
  ValidationMiddleware.validateObjectId('id'),
  TaskController.deleteTask
);

// Complete task
router.post('/tasks/:id/complete',
  AuthMiddleware.requireAuth,
  ValidationMiddleware.validateObjectId('id'),
  ValidationMiddleware.validate({
    body: Joi.object({
      actualTime: Joi.number().min(1).optional()
    })
  }),
  TaskController.completeTask
);

// Add attachment to task
router.post('/tasks/:id/attachments',
  AuthMiddleware.requireAuth,
  ValidationMiddleware.validateObjectId('id'),
  ValidationMiddleware.validate({
    body: Joi.object({
      attachmentUrl: Joi.string().uri().required()
    })
  }),
  TaskController.addAttachment
);

// ===================
// FITNESS ROUTES
// ===================

// Mount authentication routes  
router.use('/auth', authRoutes);

// Mount fitness routes
router.use('/fitness', fitnessRoutes);

// ===================
// AI INTEGRATION ROUTES (Phase 4)
// ===================

// AI task suggestions
router.post('/ai/suggest-tasks',
  AuthMiddleware.requireAuth,
  ValidationMiddleware.validate({
    body: Joi.object({
      context: Joi.string().min(10).required(),
      category: Joi.string().valid('work', 'personal', 'fitness', 'learning').optional(),
      timeFrame: Joi.string().valid('today', 'week', 'month').optional()
    })
  }),
  async (req, res, next) => {
    // Placeholder for AI integration
    res.json({
      success: true,
      data: {
        suggestions: [
          {
            title: 'Complete project documentation',
            priority: 'medium',
            estimatedTime: 120,
            category: 'work'
          }
        ]
      },
      message: 'AI task suggestions (placeholder for Phase 4 implementation)'
    });
  }
);

// AI productivity insights
router.get('/ai/productivity-insights',
  AuthMiddleware.requireAuth,
  async (req, res, next) => {
    // Placeholder for AI integration
    res.json({
      success: true,
      data: {
        insights: [
          {
            type: 'efficiency',
            message: 'You complete most tasks in the morning',
            confidence: 0.85
          }
        ]
      },
      message: 'AI productivity insights (placeholder for Phase 4 implementation)'
    });
  }
);

// ===================
// ERROR HANDLING
// ===================

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `API endpoint ${req.method} ${req.originalUrl} not found`
    }
  });
});

export default router; 