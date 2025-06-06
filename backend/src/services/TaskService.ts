/**
 * backend/src/services/TaskService.ts
 * Task service with business logic for task management
 */
import BaseService, { BaseEntity, PaginationOptions, PaginatedResult } from './BaseService';
import { logger } from '../utils/logger';

// Task entity interface
export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: string;
  assignedTo?: string;
  projectId?: string;
  dueDate?: Date;
  completedAt?: Date;
  tags: string[];
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  dependencies: string[]; // task IDs
  attachments: string[]; // file URLs
}

// Task creation input interface
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  userId: string;
  assignedTo?: string;
  projectId?: string;
  dueDate?: Date;
  tags?: string[];
  estimatedTime?: number;
  dependencies?: string[];
}

// Task update input interface
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  dueDate?: Date;
  tags?: string[];
  estimatedTime?: number;
  actualTime?: number;
  dependencies?: string[];
}

// Task search filters
export interface TaskSearchFilters {
  userId?: string;
  assignedTo?: string;
  projectId?: string;
  status?: 'todo' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueBefore?: Date;
  dueAfter?: Date;
  search?: string;
  tags?: string[];
}

export class TaskService extends BaseService<Task> {
  constructor() {
    super('tasks');
  }

  /**
   * Create a new task
   */
  async createTask(input: CreateTaskInput): Promise<Task> {
    try {
      const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: input.title.trim(),
        description: input.description?.trim(),
        status: 'todo',
        priority: input.priority || 'medium',
        userId: input.userId,
        assignedTo: input.assignedTo,
        projectId: input.projectId,
        dueDate: input.dueDate,
        tags: input.tags || [],
        estimatedTime: input.estimatedTime,
        dependencies: input.dependencies || [],
        attachments: []
      };

      const task = await this.create(taskData);
      
      logger.info('Task created successfully', {
        taskId: task.id,
        title: task.title,
        userId: task.userId,
        priority: task.priority
      });

      return task;
    } catch (error) {
      logger.error('Failed to create task', {
        title: input.title,
        userId: input.userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Update task
   */
  async updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
    try {
      const updateData: any = { ...input };

      // If status is being set to completed, set completedAt timestamp
      if (input.status === 'completed') {
        updateData.completedAt = new Date();
      }

      // If status is being changed from completed to something else, clear completedAt
      if (input.status && input.status !== 'completed') {
        updateData.completedAt = undefined;
      }

      const updatedTask = await this.update(taskId, updateData);
      
      logger.info('Task updated successfully', {
        taskId,
        updatedFields: Object.keys(input)
      });

      return updatedTask;
    } catch (error) {
      logger.error('Failed to update task', {
        taskId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get tasks for a specific user with filters and pagination
   */
  async getUserTasks(userId: string, filters: Omit<TaskSearchFilters, 'userId'> = {}, pagination: PaginationOptions = { page: 1, limit: 10 }): Promise<PaginatedResult<Task>> {
    try {
      const searchFilters = { ...filters, userId };
      return await this.searchTasks(searchFilters, pagination);
    } catch (error) {
      logger.error('Failed to get user tasks', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Search tasks with filters and pagination
   */
  async searchTasks(filters: TaskSearchFilters = {}, pagination: PaginationOptions = { page: 1, limit: 10 }): Promise<PaginatedResult<Task>> {
    try {
      const where: Record<string, any> = {};

      // Apply basic filters
      if (filters.userId) where.userId = filters.userId;
      if (filters.assignedTo) where.assignedTo = filters.assignedTo;
      if (filters.projectId) where.projectId = filters.projectId;
      if (filters.status) where.status = filters.status;
      if (filters.priority) where.priority = filters.priority;

      // For complex filters (dates, search, tags), use custom query
      if (filters.dueBefore || filters.dueAfter || filters.search || filters.tags?.length) {
        return await this.searchTasksWithComplexFilters(filters, pagination);
      }

      // Use base findMany for simple filtering
      const result = await this.findMany({ ...pagination, where });
      
      logger.info('Task search completed', {
        filters,
        pagination,
        resultCount: result.data.length,
        total: result.pagination.total
      });

      return result;
    } catch (error) {
      logger.error('Failed to search tasks', {
        filters,
        pagination,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Search tasks with complex filters (dates, search terms, tags)
   */
  private async searchTasksWithComplexFilters(filters: TaskSearchFilters, pagination: PaginationOptions): Promise<PaginatedResult<Task>> {
    const whereConditions: string[] = [];
    const parameters: any[] = [];

    // Add basic filters
    if (filters.userId) {
      whereConditions.push('c.userId = @userId');
      parameters.push({ name: '@userId', value: filters.userId });
    }
    if (filters.assignedTo) {
      whereConditions.push('c.assignedTo = @assignedTo');
      parameters.push({ name: '@assignedTo', value: filters.assignedTo });
    }
    if (filters.projectId) {
      whereConditions.push('c.projectId = @projectId');
      parameters.push({ name: '@projectId', value: filters.projectId });
    }
    if (filters.status) {
      whereConditions.push('c.status = @status');
      parameters.push({ name: '@status', value: filters.status });
    }
    if (filters.priority) {
      whereConditions.push('c.priority = @priority');
      parameters.push({ name: '@priority', value: filters.priority });
    }

    // Add date filters
    if (filters.dueBefore) {
      whereConditions.push('c.dueDate < @dueBefore');
      parameters.push({ name: '@dueBefore', value: filters.dueBefore.toISOString() });
    }
    if (filters.dueAfter) {
      whereConditions.push('c.dueDate > @dueAfter');
      parameters.push({ name: '@dueAfter', value: filters.dueAfter.toISOString() });
    }

    // Add search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase().trim();
      whereConditions.push('(CONTAINS(LOWER(c.title), @searchTerm) OR CONTAINS(LOWER(c.description), @searchTerm))');
      parameters.push({ name: '@searchTerm', value: searchTerm });
    }

    // Add tags filter
    if (filters.tags?.length) {
      const tagConditions = filters.tags.map((tag, index) => {
        parameters.push({ name: `@tag${index}`, value: tag });
        return `ARRAY_CONTAINS(c.tags, @tag${index})`;
      });
      whereConditions.push(`(${tagConditions.join(' OR ')})`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const orderBy = `ORDER BY c.${pagination.sort || 'createdAt'} ${(pagination.order || 'desc').toUpperCase()}`;
    const offset = (pagination.page - 1) * pagination.limit;

    // Data query
    const dataQuery = `
      SELECT * FROM c 
      ${whereClause} 
      ${orderBy} 
      OFFSET ${offset} LIMIT ${pagination.limit}
    `;

    const data = await this.query({ query: dataQuery, parameters });

    // Count query
    const countQuery = `
      SELECT VALUE COUNT(1) FROM c 
      ${whereClause}
    `;

    const countResults = await this.container!.items.query<number>({
      query: countQuery,
      parameters
    }).fetchAll();

    const total = countResults.resources[0] || 0;
    const totalPages = Math.ceil(total / pagination.limit);

    return {
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      }
    };
  }

  /**
   * Get overdue tasks for a user
   */
  async getOverdueTasks(userId: string): Promise<Task[]> {
    try {
      const now = new Date();
      const tasks = await this.query({
        query: `
          SELECT * FROM c 
          WHERE c.userId = @userId 
          AND c.status != 'completed' 
          AND c.status != 'cancelled'
          AND c.dueDate < @now
          ORDER BY c.dueDate ASC
        `,
        parameters: [
          { name: '@userId', value: userId },
          { name: '@now', value: now.toISOString() }
        ]
      });

      logger.info('Overdue tasks retrieved', {
        userId,
        count: tasks.length
      });

      return tasks;
    } catch (error) {
      logger.error('Failed to get overdue tasks', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get tasks due today for a user
   */
  async getTasksDueToday(userId: string): Promise<Task[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const tasks = await this.query({
        query: `
          SELECT * FROM c 
          WHERE c.userId = @userId 
          AND c.status != 'completed' 
          AND c.status != 'cancelled'
          AND c.dueDate >= @startOfDay 
          AND c.dueDate < @endOfDay
          ORDER BY c.priority DESC, c.dueDate ASC
        `,
        parameters: [
          { name: '@userId', value: userId },
          { name: '@startOfDay', value: startOfDay.toISOString() },
          { name: '@endOfDay', value: endOfDay.toISOString() }
        ]
      });

      logger.info('Tasks due today retrieved', {
        userId,
        count: tasks.length
      });

      return tasks;
    } catch (error) {
      logger.error('Failed to get tasks due today', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: string, actualTime?: number): Promise<Task> {
    try {
      const updateData: UpdateTaskInput = {
        status: 'completed',
        actualTime
      };

      const completedTask = await this.updateTask(taskId, updateData);
      
      logger.info('Task completed', {
        taskId,
        actualTime
      });

      return completedTask;
    } catch (error) {
      logger.error('Failed to complete task', {
        taskId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Add attachment to task
   */
  async addAttachment(taskId: string, attachmentUrl: string): Promise<Task> {
    try {
      const task = await this.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const updatedAttachments = [...task.attachments, attachmentUrl];
      
      const updatedTask = await this.update(taskId, {
        attachments: updatedAttachments
      });

      logger.info('Attachment added to task', {
        taskId,
        attachmentUrl
      });

      return updatedTask;
    } catch (error) {
      logger.error('Failed to add attachment to task', {
        taskId,
        attachmentUrl,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get task statistics for a user
   */
  async getUserTaskStats(userId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    dueToday: number;
  }> {
    try {
      const [total, completed, inProgress, overdue, dueToday] = await Promise.all([
        this.count({ userId }),
        this.count({ userId, status: 'completed' }),
        this.count({ userId, status: 'in-progress' }),
        this.getOverdueTasks(userId).then(tasks => tasks.length),
        this.getTasksDueToday(userId).then(tasks => tasks.length)
      ]);

      const stats = {
        total,
        completed,
        inProgress,
        overdue,
        dueToday
      };

      logger.info('User task stats retrieved', {
        userId,
        stats
      });

      return stats;
    } catch (error) {
      logger.error('Failed to get user task stats', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
}

// Export singleton instance with lazy initialization
let taskServiceInstance: TaskService | null = null;

export function getTaskService(): TaskService {
  if (!taskServiceInstance) {
    taskServiceInstance = new TaskService();
  }
  return taskServiceInstance;
}

// Export lazy getter - will only instantiate when first accessed
export const taskService = new Proxy({} as TaskService, {
  get(target, prop) {
    const instance = getTaskService();
    const value = instance[prop as keyof TaskService];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

export default taskService; 