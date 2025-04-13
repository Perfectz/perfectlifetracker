/**
 * backend/src/routes/taskRoutes.ts
 * API routes for task management
 */
import express from 'express';
import { expressjwt, Request as JWTRequest } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import UserModel from '../models/UserModel';
import { TaskModel } from '../models/TaskModel';

const router = express.Router();
const taskModel = new TaskModel();

// JWT validation middleware
const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AZURE_AUTHORITY}/discovery/v2.0/keys`
  }),
  audience: process.env.AZURE_CLIENT_ID,
  issuer: process.env.AZURE_AUTHORITY,
  algorithms: ['RS256']
});

// Middleware to extract user ID from token
const extractUserId = async (req: JWTRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const email = req.auth?.email || req.auth?.preferred_username;
    
    if (!email) {
      return res.status(400).json({ error: 'Missing email in token' });
    }
    
    const user = await UserModel.getUserByEmail(email as string);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    req.body.userId = user.id;
    next();
  } catch (error) {
    console.error('Error extracting user ID:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all tasks for a user
router.get('/', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId } = req.body;
    const { status } = req.query;
    
    let tasks;
    if (status) {
      tasks = await taskModel.getTasksByStatus(userId, status as string);
    } else {
      tasks = await taskModel.getAllTasks(userId);
    }
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get tasks due within a time range
router.get('/due', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId } = req.body;
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }
    
    const tasks = await taskModel.getTasksDueInRange(
      userId,
      new Date(start as string),
      new Date(end as string)
    );
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching due tasks:', error);
    res.status(500).json({ error: 'Failed to fetch due tasks' });
  }
});

// Get a specific task
router.get('/:id', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId } = req.body;
    const taskId = req.params.id;
    
    const task = await taskModel.getTaskById(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Ensure user can only access their own tasks
    if (task.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to task' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create a new task
router.post('/', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { 
      userId, 
      title, 
      description, 
      dueDate, 
      priority, 
      status, 
      projectId,
      tags
    } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }
    
    const newTask = await taskModel.createTask({
      userId,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      status: status || 'notStarted',
      projectId,
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update a task
router.put('/:id', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId } = req.body;
    const taskId = req.params.id;
    
    // Get existing task
    const existingTask = await taskModel.getTaskById(taskId);
    
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Ensure user can only update their own tasks
    if (existingTask.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this task' });
    }
    
    // Remove userId from updates to prevent owner change
    const { userId: _, ...updates } = req.body;
    
    // Add updatedAt timestamp
    const taskUpdates = {
      ...updates,
      updatedAt: new Date()
    };
    
    // Handle date conversion if dueDate is present
    if (updates.dueDate) {
      taskUpdates.dueDate = new Date(updates.dueDate);
    }
    
    const updatedTask = await taskModel.updateTask(taskId, taskUpdates);
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Mark a task as complete
router.post('/:id/complete', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId } = req.body;
    const taskId = req.params.id;
    
    // Get existing task
    const existingTask = await taskModel.getTaskById(taskId);
    
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Ensure user can only update their own tasks
    if (existingTask.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this task' });
    }
    
    const completedTask = await taskModel.updateTask(taskId, {
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date()
    });
    
    res.json(completedTask);
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// Delete a task
router.delete('/:id', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId } = req.body;
    const taskId = req.params.id;
    
    // Get existing task
    const existingTask = await taskModel.getTaskById(taskId);
    
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Ensure user can only delete their own tasks
    if (existingTask.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this task' });
    }
    
    await taskModel.deleteTask(taskId);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router; 