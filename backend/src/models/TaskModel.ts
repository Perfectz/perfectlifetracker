/**
 * backend/src/models/TaskModel.ts
 * Model for task operations
 */
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { initializeContainers } from '../utils/cosmosClient';

dotenv.config();

// Task Status type
export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'blocked';

// Task Priority type
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Task interface
export interface Task {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  description?: string | undefined;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null | undefined;
  tags?: string[] | undefined;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null | undefined;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
    uploadedAt: string;
  }> | undefined;
}

// Task input interface for creation
export interface TaskInput {
  projectId: string;
  userId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

// Task update interface
export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  tags?: string[];
}

export class TaskModel {
  private container: any;

  constructor() {
    try {
      this.container = null; // Will be initialized lazily
    } catch (error) {
      console.error('Error initializing tasks container, will initialize later:', error instanceof Error ? error.message : String(error));
    }
  }

  // Initialize container if it wasn't available during construction
  private async ensureContainer() {
    if (!this.container) {
      try {
        const containers = await initializeContainers();
        this.container = containers.tasks;
      } catch (error) {
        throw new Error(`Failed to initialize tasks container: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    return this.container;
  }

  /**
   * Create a new task
   */
  async createTask(
    userId: string,
    projectId: string,
    taskInput: {
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: string | null;
      tags?: string[];
    }
  ): Promise<Task> {
    await this.ensureContainer();
    try {
      const task: Task = {
        id: uuidv4(),
        userId,
        projectId,
        title: taskInput.title,
        description: taskInput.description,
        status: taskInput.status || 'todo',
        priority: taskInput.priority || 'medium',
        dueDate: taskInput.dueDate || undefined,
        tags: taskInput.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: undefined,
        attachments: []
      };
      
      const result = await this.container.items.create(task);
      return result.resource;
    } catch (error) {
      if ((error as any).code === 404) {
        throw new Error('Container not found');
      }
      throw new Error(`Error creating task: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getTaskById(projectId: string, taskId: string): Promise<Task | null> {
    await this.ensureContainer();
    try {
      const { resource: task } = await this.container.item(taskId, projectId).read();
      return task;
    } catch (error) {
      if ((error as any).code === 404) {
        return null;
      }
      throw error;
    }
  }

  async getProjectTasks(projectId: string): Promise<Task[]> {
    await this.ensureContainer();
    try {
      const querySpec = {
        query: "SELECT * FROM c WHERE c.projectId = @projectId",
        parameters: [
          {
            name: "@projectId",
            value: projectId
          }
        ]
      };
      
      const { resources: tasks } = await this.container.items.query(querySpec).fetchAll();
      return tasks;
    } catch (error) {
      console.error(`Error getting tasks for project ${projectId}:`, error);
      throw error;
    }
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    await this.ensureContainer();
    try {
      const querySpec = {
        query: "SELECT * FROM c WHERE c.userId = @userId",
        parameters: [
          {
            name: "@userId",
            value: userId
          }
        ]
      };
      
      const { resources: tasks } = await this.container.items.query(querySpec).fetchAll();
      return tasks;
    } catch (error) {
      console.error(`Error getting tasks for user ${userId}:`, error);
      throw error;
    }
  }

  async getTasksByStatus(projectId: string, status: Task['status']): Promise<Task[]> {
    await this.ensureContainer();
    try {
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.projectId = @projectId AND c.status = @status',
        parameters: [
          {
            name: '@projectId',
            value: projectId
          },
          {
            name: '@status',
            value: status
          }
        ]
      };
      
      const { resources } = await this.container.items.query(querySpec).fetchAll();
      return resources;
    } catch (error) {
      console.error('Error getting tasks by status:', error);
      throw error;
    }
  }

  async getTasksDueSoon(userId: string, days: number = 7): Promise<Task[]> {
    await this.ensureContainer();
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);
      
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.userId = @userId AND c.status != @completedStatus AND c.dueDate <= @futureDate AND c.dueDate >= @today ORDER BY c.dueDate ASC',
        parameters: [
          {
            name: '@userId',
            value: userId
          },
          {
            name: '@completedStatus',
            value: 'completed'
          },
          {
            name: '@futureDate',
            value: futureDate.toISOString()
          },
          {
            name: '@today',
            value: today.toISOString()
          }
        ]
      };
      
      const { resources } = await this.container.items.query(querySpec).fetchAll();
      return resources;
    } catch (error) {
      console.error('Error getting tasks due soon:', error);
      throw error;
    }
  }

  async updateTask(projectId: string, taskId: string, updates: TaskUpdate): Promise<Task> {
    await this.ensureContainer();
    try {
      const { resource: existingTask } = await this.container.item(taskId, projectId).read();
      
      if (!existingTask) {
        throw new Error(`Task with ID ${taskId} not found`);
      }
      
      const updatedTask = {
        ...existingTask,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const { resource: result } = await this.container.item(taskId, projectId).replace(updatedTask);
      return result;
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  }

  async completeTask(projectId: string, taskId: string): Promise<Task> {
    await this.ensureContainer();
    try {
      return this.updateTask(projectId, taskId, {
        status: 'completed'
      });
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  async addAttachment(
    projectId: string, 
    taskId: string, 
    attachment: {
      name: string;
      url: string;
      size: number;
      type: string;
    }
  ): Promise<Task> {
    await this.ensureContainer();
    try {
      const task = await this.getTaskById(projectId, taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      
      const attachmentWithId = {
        id: uuidv4(),
        name: attachment.name,
        url: attachment.url,
        size: attachment.size,
        type: attachment.type,
        uploadedAt: new Date().toISOString()
      };
      
      const updatedTask: Task = {
        ...task,
        attachments: [...(task.attachments || []), attachmentWithId],
        updatedAt: new Date().toISOString()
      };
      
      const result = await this.container.items.upsert(updatedTask);
      return result.resource;
    } catch (error) {
      throw new Error(`Error adding attachment: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async removeAttachment(projectId: string, taskId: string, attachmentId: string): Promise<Task> {
    await this.ensureContainer();
    try {
      const task = await this.getTaskById(projectId, taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      
      if (!task.attachments || task.attachments.length === 0) {
        return task;
      }
      
      const updatedTask: Task = {
        ...task,
        attachments: task.attachments.filter(a => a.id !== attachmentId),
        updatedAt: new Date().toISOString()
      };
      
      const { resource } = await this.container.item(taskId, projectId).replace(updatedTask);
      return resource;
    } catch (error) {
      console.error('Error removing attachment:', error);
      throw error;
    }
  }

  async deleteTask(projectId: string, taskId: string): Promise<void> {
    await this.ensureContainer();
    try {
      await this.container.item(taskId, projectId).delete();
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw error;
    }
  }
} 