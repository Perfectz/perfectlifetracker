// backend/src/routes/goals.router.ts
// Router for fitness goal API endpoints

import express, { Request, Response, NextFunction } from 'express';
import * as goalService from '../services/goalService';

// Custom request type including auth property set by JWT middleware
interface AuthRequest extends Request {
  auth: {
    sub?: string;
    oid?: string;
    [key: string]: unknown;
  };
}

const router = express.Router();

// Create a new goal
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.auth.sub ?? authReq.auth.oid!;
    const goalData = { 
      userId, 
      ...req.body,
      targetDate: req.body.targetDate ? new Date(req.body.targetDate) : new Date()
    };
    
    const newGoal = await goalService.createGoal(goalData);
    res.status(201).json(newGoal);
  } catch (error) {
    next(error);
  }
});

// Get all goals for current user
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.auth.sub ?? authReq.auth.oid!;
    
    const goals = await goalService.getGoalsByUserId(userId);
    res.status(200).json(goals);
  } catch (error) {
    next(error);
  }
});

// Get a specific goal by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.auth.sub ?? authReq.auth.oid!;
    const goalId = req.params.id;
    
    const goal = await goalService.getGoalById(goalId, userId);
    if (!goal) {
      res.status(404).json({ error: 'NotFound', message: 'Goal not found' });
      return;
    }
    
    res.status(200).json(goal);
  } catch (error) {
    next(error);
  }
});

// Update a goal
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.auth.sub ?? authReq.auth.oid!;
    const goalId = req.params.id;
    
    // Process dates if provided
    const updates = { ...req.body };
    if (updates.targetDate) {
      updates.targetDate = new Date(updates.targetDate);
    }
    
    const updatedGoal = await goalService.updateGoal(goalId, userId, updates);
    if (!updatedGoal) {
      res.status(404).json({ error: 'NotFound', message: 'Goal not found' });
      return;
    }
    
    res.status(200).json(updatedGoal);
  } catch (error) {
    next(error);
  }
});

// Delete a goal
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.auth.sub ?? authReq.auth.oid!;
    const goalId = req.params.id;
    
    const success = await goalService.deleteGoal(goalId, userId);
    if (!success) {
      res.status(404).json({ error: 'NotFound', message: 'Goal not found' });
      return;
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router; 