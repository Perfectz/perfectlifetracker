/**
 * backend/src/models/TaskModel.ts
 * Model for task operations
 */
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { getContainer } from '../utils/cosmosClient';

dotenv.config();

export interface Task {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  tags?: string[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
    uploadedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  assignedTo?: string[];
  checklist?: string[];
}

export interface CreateTaskInput {
  projectId: string;
  userId: string;
  title: string;
  description?: string;
  priority?: Task['priority'];
  dueDate?: string;
  tags?: string[];
  status?: Task['status'];
  assignedTo?: string[];
  checklist?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  dueDate?: string;
  tags?: string[];
  assignedTo?: string[];
  checklist?: string[];
}

export class TaskModel {
  private container: any;

  constructor() {
    try {
      this.container = getContainer('tasks');
    } catch (error) {
      console.error('Error initializing tasks container, will initialize later:', error.message);
      // Will initialize container later when needed
    }
  }

  // Initialize container if it wasn't available during construction
  private async ensureContainer() {
    if (!this.container) {
      try {
        this.container = getContainer('tasks');
      } catch (error) {
        throw new Error(`Failed to initialize tasks container: ${error.message}`);
      }
    }
    return this.container;
  }

  async createTask(taskInput: CreateTaskInput): Promise<Task> {
    await this.ensureContainer();
    try {
      const newTask: Task = {
        id: `task_${uuidv4()}`,
        userId: taskInput.userId,
        projectId: taskInput.projectId,
        title: taskInput.title,
        description: taskInput.description || '',
        status: taskInput.status || 'todo',
        priority: taskInput.priority || 'medium',
        dueDate: taskInput.dueDate || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
        assignedTo: taskInput.assignedTo || [],
        tags: taskInput.tags || [],
        checklist: taskInput.checklist || [],
        attachments: []
      };
      
      const { resource: createdTask } = await this.container.items.create(newTask);
      return createdTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async getTaskById(projectId: string, taskId: string): Promise<Task | undefined> {
    await this.ensureContainer();
    try {
      const { resource: task } = await this.container.item(taskId, projectId).read();
      return task;
    } catch (error) {
      if (error.code === 404) {
        return undefined;
      }
      console.error(`Error getting task ${taskId}:`, error);
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

  async updateTask(projectId: string, taskId: string, updates: UpdateTaskInput): Promise<Task> {
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
    attachment: Omit<Task['attachments'][0], 'id' | 'uploadedAt'>
  ): Promise<Task> {
    await this.ensureContainer();
    try {
      const task = await this.getTaskById(projectId, taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      
      const attachmentWithId = {
        ...attachment,
        id: uuidv4(),
        uploadedAt: new Date().toISOString()
      };
      
      const updatedTask: Task = {
        ...task,
        attachments: [...(task.attachments || []), attachmentWithId],
        updatedAt: new Date().toISOString()
      };
      
      const { resource } = await this.container.item(taskId, projectId).replace(updatedTask);
      return resource;
    } catch (error) {
      console.error('Error adding attachment:', error);
      throw error;
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