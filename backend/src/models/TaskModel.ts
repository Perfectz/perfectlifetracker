/**
 * backend/src/models/TaskModel.ts
 * Model for task operations
 */
import { v4 as uuidv4 } from 'uuid';
import { CosmosClient } from '@azure/cosmos';
import dotenv from 'dotenv';

dotenv.config();

export interface Task {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  tags?: string[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
    uploadedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CreateTaskInput {
  projectId: string;
  userId: string;
  title: string;
  description?: string;
  priority?: Task['priority'];
  dueDate?: Date;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  dueDate?: Date;
  tags?: string[];
}

export class TaskModel {
  private client: CosmosClient;
  private database: string;
  private container: string;

  constructor() {
    const endpoint = process.env.COSMOSDB_ENDPOINT || '';
    const key = process.env.COSMOSDB_KEY || '';
    
    this.client = new CosmosClient({ endpoint, key });
    this.database = process.env.COSMOSDB_DATABASE || 'perfectltp';
    this.container = 'tasks';
    
    this.initializeContainer();
  }

  private async initializeContainer() {
    try {
      const { database } = await this.client.databases.createIfNotExists({
        id: this.database
      });
      
      const { container } = await database.containers.createIfNotExists({
        id: this.container,
        partitionKey: {
          paths: ['/projectId']
        },
        indexingPolicy: {
          includedPaths: [
            { path: "/*" }
          ],
          compositeIndexes: [
            [
              { path: "/projectId", order: "ascending" },
              { path: "/status", order: "ascending" }
            ],
            [
              { path: "/userId", order: "ascending" },
              { path: "/dueDate", order: "ascending" }
            ],
            [
              { path: "/status", order: "ascending" },
              { path: "/priority", order: "ascending" }
            ]
          ]
        }
      });
      
      console.log(`Task container initialized: ${container.id}`);
    } catch (error) {
      console.error('Failed to initialize task container:', error);
    }
  }

  async createTask(taskInput: CreateTaskInput): Promise<Task> {
    try {
      const container = this.client.database(this.database).container(this.container);
      
      const now = new Date();
      const task: Task = {
        id: uuidv4(),
        projectId: taskInput.projectId,
        userId: taskInput.userId,
        title: taskInput.title,
        description: taskInput.description || '',
        status: 'todo',
        priority: taskInput.priority || 'medium',
        dueDate: taskInput.dueDate,
        tags: taskInput.tags || [],
        attachments: [],
        createdAt: now,
        updatedAt: now
      };
      
      const { resource } = await container.items.create(task);
      return resource as Task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async getTaskById(projectId: string, taskId: string): Promise<Task | undefined> {
    try {
      const container = this.client.database(this.database).container(this.container);
      
      const { resource } = await container.item(taskId, projectId).read();
      return resource as Task;
    } catch (error) {
      if ((error as any).code === 404) {
        return undefined;
      }
      console.error('Error getting task by id:', error);
      throw error;
    }
  }

  async getProjectTasks(projectId: string): Promise<Task[]> {
    try {
      const container = this.client.database(this.database).container(this.container);
      
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.projectId = @projectId ORDER BY c.updatedAt DESC',
        parameters: [
          {
            name: '@projectId',
            value: projectId
          }
        ]
      };
      
      const { resources } = await container.items.query(querySpec).fetchAll();
      return resources as Task[];
    } catch (error) {
      console.error('Error getting project tasks:', error);
      throw error;
    }
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    try {
      const container = this.client.database(this.database).container(this.container);
      
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.dueDate ASC, c.priority DESC',
        parameters: [
          {
            name: '@userId',
            value: userId
          }
        ]
      };
      
      const { resources } = await container.items.query(querySpec).fetchAll();
      return resources as Task[];
    } catch (error) {
      console.error('Error getting user tasks:', error);
      throw error;
    }
  }

  async getTasksByStatus(projectId: string, status: Task['status']): Promise<Task[]> {
    try {
      const container = this.client.database(this.database).container(this.container);
      
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
      
      const { resources } = await container.items.query(querySpec).fetchAll();
      return resources as Task[];
    } catch (error) {
      console.error('Error getting tasks by status:', error);
      throw error;
    }
  }

  async getTasksDueSoon(userId: string, days: number = 7): Promise<Task[]> {
    try {
      const container = this.client.database(this.database).container(this.container);
      
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
      
      const { resources } = await container.items.query(querySpec).fetchAll();
      return resources as Task[];
    } catch (error) {
      console.error('Error getting tasks due soon:', error);
      throw error;
    }
  }

  async updateTask(projectId: string, taskId: string, updates: UpdateTaskInput): Promise<Task> {
    try {
      const container = this.client.database(this.database).container(this.container);
      
      const task = await this.getTaskById(projectId, taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      
      const wasCompleted = task.status === 'completed';
      const isNowCompleted = updates.status === 'completed';
      
      const updatedTask: Task = {
        ...task,
        ...updates,
        updatedAt: new Date()
      };
      
      // Set completedAt when task is completed
      if (!wasCompleted && isNowCompleted) {
        updatedTask.completedAt = new Date();
      }
      
      // Clear completedAt if task is moved back from completed status
      if (wasCompleted && updates.status && updates.status !== 'completed') {
        updatedTask.completedAt = undefined;
      }
      
      const { resource } = await container.item(taskId, projectId).replace(updatedTask);
      return resource as Task;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async completeTask(projectId: string, taskId: string): Promise<Task> {
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
    try {
      const container = this.client.database(this.database).container(this.container);
      
      const task = await this.getTaskById(projectId, taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      
      const attachmentWithId = {
        ...attachment,
        id: uuidv4(),
        uploadedAt: new Date()
      };
      
      const updatedTask: Task = {
        ...task,
        attachments: [...(task.attachments || []), attachmentWithId],
        updatedAt: new Date()
      };
      
      const { resource } = await container.item(taskId, projectId).replace(updatedTask);
      return resource as Task;
    } catch (error) {
      console.error('Error adding attachment:', error);
      throw error;
    }
  }

  async removeAttachment(projectId: string, taskId: string, attachmentId: string): Promise<Task> {
    try {
      const container = this.client.database(this.database).container(this.container);
      
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
        updatedAt: new Date()
      };
      
      const { resource } = await container.item(taskId, projectId).replace(updatedTask);
      return resource as Task;
    } catch (error) {
      console.error('Error removing attachment:', error);
      throw error;
    }
  }

  async deleteTask(projectId: string, taskId: string): Promise<void> {
    try {
      const container = this.client.database(this.database).container(this.container);
      await container.item(taskId, projectId).delete();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
} 