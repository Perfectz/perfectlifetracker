// backend/src/routes/goals.router.ts
// Router for fitness goals API endpoints

import express, { Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { getGoalsByUserId, getGoalById, createGoal, updateGoal, deleteGoal } from '../services/goalService';
import { FitnessGoal, GoalStatus, GoalType } from '../models/FitnessGoal';
import { authorize } from '../middleware/auth';
import { extractUserId } from '../middleware/extractUserId';

// Router for fitness goals API endpoints
const router = express.Router();

// Define AuthRequest interface to include userId from middleware
interface AuthRequest extends express.Request {
  userId?: string; // Added by extractUserId middleware
  auth?: {
    sub?: string;
    oid?: string;
    [key: string]: unknown;
  };
}

// Apply auth middleware to all routes
router.use(authorize);
router.use(extractUserId);

// Create a new fitness goal
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional(),
    body('type').optional().isIn(Object.values(GoalType)).withMessage('Invalid goal type'),
    body('targetDate').optional().isISO8601().withMessage('Target date must be a valid date'),
    body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
    body('status').optional().isIn(Object.values(GoalStatus)).withMessage('Invalid goal status')
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'User ID not found in request' });
      }

      const newGoal = {
        userId,
        title: req.body.title,
        description: req.body.description || '',
        type: req.body.type,
        targetDate: req.body.targetDate ? new Date(req.body.targetDate) : new Date(),
        progress: req.body.progress || 0,
        achieved: req.body.achieved || false,
        notes: req.body.notes || ''
      };

      const goal = await createGoal(newGoal);
      res.status(201).json(goal);
    } catch (error) {
      next(error);
    }
  }
);

// Get all goals for current user with pagination and filtering
router.get('/', [
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
  query('type').optional().isIn(Object.values(GoalType)),
  query('status').optional().isIn(Object.values(GoalStatus))
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in request' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    // Build filters object for optional query parameters
    const filters: Record<string, string> = {};
    if (req.query.type) filters.type = req.query.type as string;
    if (req.query.status) filters.status = req.query.status as string;

    const goals = await getGoalsByUserId(userId, limit, offset, filters);
    res.json(goals);
  } catch (error) {
    next(error);
  }
});

// Get a specific goal by ID
router.get('/:id', [
  param('id').notEmpty().withMessage('Goal ID is required')
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in request' });
    }

    const goalId = req.params.id;
    const goal = await getGoalById(goalId, userId);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Verify the goal belongs to the current user
    if (goal.userId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to access this goal' });
    }

    res.json(goal);
  } catch (error) {
    next(error);
  }
});

// Update a goal
router.put('/:id', [
  param('id').notEmpty().withMessage('Goal ID is required'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional(),
  body('type').optional().isIn(Object.values(GoalType)).withMessage('Invalid goal type'),
  body('targetDate').optional().isISO8601().withMessage('Target date must be a valid date'),
  body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  body('status').optional().isIn(Object.values(GoalStatus)).withMessage('Invalid goal status')
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in request' });
    }

    const goalId = req.params.id;
    
    // Process dates if provided
    const updates = { ...req.body };
    if (updates.targetDate) {
      updates.targetDate = new Date(updates.targetDate);
    }
    
    const updatedGoal = await updateGoal(goalId, userId, updates);
    if (!updatedGoal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json(updatedGoal);
  } catch (error) {
    next(error);
  }
});

// Delete a goal
router.delete('/:id', [
  param('id').notEmpty().withMessage('Goal ID is required')
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in request' });
    }

    const goalId = req.params.id;
    const success = await deleteGoal(goalId, userId);

    if (!success) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router; 