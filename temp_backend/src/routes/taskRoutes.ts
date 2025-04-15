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
      res.status(400).json({ error: 'Missing email in token' });
      return;
    }
    
    const user = await UserModel.getUserByEmail(email as string);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    req.body.userId = user.id;
    next();
  } catch (error) {
    console.error('Error extracting user ID:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all tasks for a user or by status
router.get('/', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId, projectId } = req.body;
    const { status } = req.query;
    let tasks;
    if (status && projectId) {
      // Only allow valid statuses
      const validStatuses = ['todo', 'in-progress', 'completed', 'blocked'];
      if (!validStatuses.includes(status as string)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }
      tasks = await taskModel.getTasksByStatus(projectId, status as any);
    } else if (userId) {
      tasks = await taskModel.getUserTasks(userId);
    } else {
      res.status(400).json({ error: 'Missing userId or projectId' });
      return;
    }
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get tasks due soon (within X days)
router.get('/due', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId } = req.body;
    const { days } = req.query;
    const daysNum = days ? parseInt(days as string, 10) : 7;
    const tasks = await taskModel.getTasksDueSoon(userId, daysNum);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching due tasks:', error);
    res.status(500).json({ error: 'Failed to fetch due tasks' });
  }
});

// Get a specific task
router.get('/:id', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId, projectId } = req.body;
    const taskId = req.params.id;
    if (!projectId) {
      res.status(400).json({ error: 'Missing projectId' });
      return;
    }
    const task = await taskModel.getTaskById(projectId, taskId);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    if (task.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized access to task' });
      return;
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
    const { projectId, title, description, priority, dueDate, tags } = req.body;
    const userId = req.body.userId;
    if (!projectId || !title) {
      res.status(400).json({ error: 'projectId and title are required' });
      return;
    }
    const taskInput = {
      projectId,
      userId,
      title,
      description,
      priority,
      dueDate,
      tags
    };
    const newTask = await taskModel.createTask(taskInput);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update a task
router.put('/:id', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const projectId = req.body.projectId;
    const taskId = req.params.id;
    if (!projectId) {
      res.status(400).json({ error: 'projectId is required' });
      return;
    }
    const updates = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      dueDate: req.body.dueDate,
      tags: req.body.tags
    };
    // Remove undefined fields
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);
    const updatedTask = await taskModel.updateTask(projectId, taskId, updates);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Mark a task as complete
router.post('/:id/complete', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const projectId = req.body.projectId;
    const taskId = req.params.id;
    if (!projectId) {
      res.status(400).json({ error: 'projectId is required' });
      return;
    }
    // Do not include completedAt in the update payload
    const updatedTask = await taskModel.updateTask(projectId, taskId, { status: 'completed' });
    res.json(updatedTask);
  } catch (error) {
    console.error('Error marking task as complete:', error);
    res.status(500).json({ error: 'Failed to mark task as complete' });
  }
});

// Delete a task
router.delete('/:id', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId, projectId } = req.body;
    const taskId = req.params.id;
    if (!projectId) {
      res.status(400).json({ error: 'Missing projectId' });
      return;
    }
    const existingTask = await taskModel.getTaskById(projectId, taskId);
    if (!existingTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    if (existingTask.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to delete this task' });
      return;
    }
    await taskModel.deleteTask(projectId, taskId);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router; 