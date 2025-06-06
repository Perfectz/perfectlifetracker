/**
 * backend/src/controllers/TaskController.ts
 * Task controller integrating TaskService with RESTful API endpoints
 */
import { Request, Response, NextFunction } from 'express';
import { taskService, Task, CreateTaskInput, UpdateTaskInput, TaskSearchFilters } from '../services/TaskService';
import ValidationMiddleware from '../middleware/validation';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { cacheService } from '../services/CacheService';
import { userService } from '../services/UserService';

// Enhanced request interface
interface TaskRequest extends AuthenticatedRequest {
  validated?: {
    body?: any;
    query?: any;
    params?: any;
  };
}

export class TaskController {
  /**
   * Create a new task
   */
  static async createTask(req: TaskRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskData: CreateTaskInput = req.validated?.body || req.body;
      const currentUser = req.user;

      // Set userId from authenticated user if not provided
      if (!taskData.userId) {
        taskData.userId = currentUser.id;
      }

      // Only admins can create tasks for other users
      if (taskData.userId !== currentUser.id && currentUser.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You can only create tasks for yourself'
          }
        });
        return;
      }

      const task = await taskService.createTask(taskData);
      
      // Invalidate user's task caches
      cacheService.deleteByPattern(`tasks:.*userId.*${taskData.userId}.*`);
      cacheService.deleteByPattern(`user-stats:${taskData.userId}`);

      logger.info('Task created via API', {
        taskId: task.id,
        title: task.title,
        userId: task.userId,
        createdBy: currentUser.id,
        requestId: req.id
      });

      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get task by ID
   */
  static async getTaskById(req: TaskRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validated?.params || req.params;
      const currentUser = req.user;
      
      // Check cache first
      const cacheKey = `task:${id}`;
      const cachedTask = cacheService.get<Task>(cacheKey);
      
      if (cachedTask) {
        // Check permissions for cached task
        if (cachedTask.userId !== currentUser.id && currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
          res.status(403).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: 'You can only view your own tasks'
            }
          });
          return;
        }

        logger.info('Task retrieved from cache', {
          taskId: id,
          requestId: req.id
        });

        res.json({
          success: true,
          data: cachedTask,
          cached: true
        });
        return;
      }

      const task = await taskService.findById(id);
      
      if (!task) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found'
          }
        });
        return;
      }

      // Check permissions
      if (task.userId !== currentUser.id && currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You can only view your own tasks'
          }
        });
        return;
      }

      // Cache the task for 5 minutes
      cacheService.set(cacheKey, task, 5 * 60 * 1000);

      logger.info('Task retrieved via API', {
        taskId: id,
        requestId: req.id
      });

      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update task
   */
  static async updateTask(req: TaskRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validated?.params || req.params;
      const updateData: UpdateTaskInput = req.validated?.body || req.body;
      const currentUser = req.user;

      // Get the existing task to check permissions
      const existingTask = await taskService.findById(id);
      if (!existingTask) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found'
          }
        });
        return;
      }

      // Check permissions
      if (existingTask.userId !== currentUser.id && currentUser.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You can only update your own tasks'
          }
        });
        return;
      }

      const updatedTask = await taskService.updateTask(id, updateData);
      
      // Invalidate caches
      cacheService.delete(`task:${id}`);
      cacheService.deleteByPattern(`tasks:.*userId.*${existingTask.userId}.*`);
      cacheService.deleteByPattern(`user-stats:${existingTask.userId}`);

      // If task was completed, update user stats
      if (updateData.status === 'completed' && existingTask.status !== 'completed') {
        await userService.incrementTasksCompleted(existingTask.userId);
        cacheService.deleteByPattern(`user:${existingTask.userId}`);
      }

      logger.info('Task updated via API', {
        taskId: id,
        updatedBy: currentUser.id,
        updatedFields: Object.keys(updateData),
        requestId: req.id
      });

      res.json({
        success: true,
        data: updatedTask,
        message: 'Task updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete task
   */
  static async deleteTask(req: TaskRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validated?.params || req.params;
      const currentUser = req.user;

      // Get the existing task to check permissions
      const existingTask = await taskService.findById(id);
      if (!existingTask) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found'
          }
        });
        return;
      }

      // Check permissions
      if (existingTask.userId !== currentUser.id && currentUser.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You can only delete your own tasks'
          }
        });
        return;
      }

      await taskService.delete(id);
      
      // Invalidate caches
      cacheService.delete(`task:${id}`);
      cacheService.deleteByPattern(`tasks:.*userId.*${existingTask.userId}.*`);
      cacheService.deleteByPattern(`user-stats:${existingTask.userId}`);

      logger.info('Task deleted via API', {
        taskId: id,
        deletedBy: currentUser.id,
        requestId: req.id
      });

      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List user's tasks with search and pagination
   */
  static async getUserTasks(req: TaskRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams = req.validated?.query || req.query;
      const {
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc',
        status,
        priority,
        search,
        dueBefore,
        dueAfter,
        tags
      } = queryParams;

      const currentUser = req.user;
      let { userId } = req.params;

      // If no userId specified, use current user
      if (!userId) {
        userId = currentUser.id;
      }

      // Check permissions
      if (userId !== currentUser.id && currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You can only view your own tasks'
          }
        });
        return;
      }

      // Generate cache key
      const cacheKey = cacheService.generateKey('tasks', {
        userId,
        page,
        limit,
        sort,
        order,
        status,
        priority,
        search,
        dueBefore,
        dueAfter,
        tags
      });

      // Check cache first
      const cachedResult = cacheService.get(cacheKey);
      if (cachedResult) {
        logger.info('User tasks retrieved from cache', {
          userId,
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

      const filters: TaskSearchFilters = {
        status,
        priority,
        search,
        dueBefore: dueBefore ? new Date(dueBefore) : undefined,
        dueAfter: dueAfter ? new Date(dueAfter) : undefined,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined
      };

      const pagination = { 
        page: Number(page), 
        limit: Number(limit), 
        sort, 
        order 
      };
      
      const result = await taskService.getUserTasks(userId, filters, pagination);
      
      // Cache for 2 minutes
      cacheService.set(cacheKey, result, 2 * 60 * 1000);

      logger.info('User tasks retrieved via API', {
        userId,
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
   * Get overdue tasks for current user
   */
  static async getOverdueTasks(req: TaskRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user;
      const userId = currentUser.id;

      const cacheKey = `overdue-tasks:${userId}`;
      const cachedTasks = cacheService.get<Task[]>(cacheKey);

      if (cachedTasks) {
        logger.info('Overdue tasks retrieved from cache', {
          userId,
          requestId: req.id
        });

        res.json({
          success: true,
          data: cachedTasks,
          cached: true
        });
        return;
      }

      const overdueTasks = await taskService.getOverdueTasks(userId);
      
      // Cache for 1 minute (overdue status changes frequently)
      cacheService.set(cacheKey, overdueTasks, 60 * 1000);

      logger.info('Overdue tasks retrieved via API', {
        userId,
        count: overdueTasks.length,
        requestId: req.id
      });

      res.json({
        success: true,
        data: overdueTasks
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tasks due today for current user
   */
  static async getTasksDueToday(req: TaskRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user;
      const userId = currentUser.id;

      const cacheKey = `tasks-due-today:${userId}`;
      const cachedTasks = cacheService.get<Task[]>(cacheKey);

      if (cachedTasks) {
        logger.info('Tasks due today retrieved from cache', {
          userId,
          requestId: req.id
        });

        res.json({
          success: true,
          data: cachedTasks,
          cached: true
        });
        return;
      }

      const tasksDueToday = await taskService.getTasksDueToday(userId);
      
      // Cache for 5 minutes
      cacheService.set(cacheKey, tasksDueToday, 5 * 60 * 1000);

      logger.info('Tasks due today retrieved via API', {
        userId,
        count: tasksDueToday.length,
        requestId: req.id
      });

      res.json({
        success: true,
        data: tasksDueToday
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete a task
   */
  static async completeTask(req: TaskRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validated?.params || req.params;
      const { actualTime } = req.validated?.body || req.body;
      const currentUser = req.user;

      // Check if task exists and user has permission
      const existingTask = await taskService.findById(id);
      if (!existingTask) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found'
          }
        });
        return;
      }

      if (existingTask.userId !== currentUser.id && currentUser.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You can only complete your own tasks'
          }
        });
        return;
      }

      const completedTask = await taskService.completeTask(id, actualTime);
      
      // Update user stats and invalidate caches
      await userService.incrementTasksCompleted(existingTask.userId);
      cacheService.delete(`task:${id}`);
      cacheService.deleteByPattern(`tasks:.*userId.*${existingTask.userId}.*`);
      cacheService.deleteByPattern(`user-stats:${existingTask.userId}`);
      cacheService.deleteByPattern(`user:${existingTask.userId}`);

      logger.info('Task completed via API', {
        taskId: id,
        completedBy: currentUser.id,
        actualTime,
        requestId: req.id
      });

      res.json({
        success: true,
        data: completedTask,
        message: 'Task completed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add attachment to task
   */
  static async addAttachment(req: TaskRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validated?.params || req.params;
      const { attachmentUrl } = req.validated?.body || req.body;
      const currentUser = req.user;

      // Check if task exists and user has permission
      const existingTask = await taskService.findById(id);
      if (!existingTask) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found'
          }
        });
        return;
      }

      if (existingTask.userId !== currentUser.id && currentUser.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You can only add attachments to your own tasks'
          }
        });
        return;
      }

      const updatedTask = await taskService.addAttachment(id, attachmentUrl);
      
      // Invalidate caches
      cacheService.delete(`task:${id}`);
      cacheService.deleteByPattern(`tasks:.*userId.*${existingTask.userId}.*`);

      logger.info('Attachment added to task via API', {
        taskId: id,
        attachmentUrl,
        addedBy: currentUser.id,
        requestId: req.id
      });

      res.json({
        success: true,
        data: updatedTask,
        message: 'Attachment added successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get task statistics for current user
   */
  static async getTaskStats(req: TaskRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user;
      let { userId } = req.params;

      // If no userId specified, use current user
      if (!userId) {
        userId = currentUser.id;
      }

      // Check permissions
      if (userId !== currentUser.id && currentUser.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You can only view your own task statistics'
          }
        });
        return;
      }

      const cacheKey = `task-stats:${userId}`;
      const stats = await cacheService.getOrSet(
        cacheKey,
        () => taskService.getUserTaskStats(userId),
        60 * 1000 // 1 minute cache
      );

      logger.info('Task stats retrieved', {
        userId,
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
}

export default TaskController; 