// backend/src/routes/goals.router.ts
// Router for fitness goal API endpoints

import express, { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import * as goalService from '../services/goalService';
import { ApiError } from '../utils/ApiError';

// Custom request type including auth property set by JWT middleware
interface AuthRequest extends Request {
  auth: {
    sub?: string;
    oid?: string;
    [key: string]: unknown;
  };
  userId: string; // Added for our extractUserId middleware
}

const router = express.Router();

// Validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'ValidationError', 
      message: 'Invalid request data',
      details: errors.array() 
    });
  }
  next();
};

// Extract userId from JWT token with development fallback
const extractUserId = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  
  // Development fallback - if auth is missing or incomplete, use a default dev user
  if (!authReq.auth || (!authReq.auth.sub && !authReq.auth.oid)) {
    console.warn('⚠️ Authentication missing. Using dev-user-123 for development.');
    authReq.userId = 'dev-user-123';
  } else {
    // Normal auth flow
    if (authReq.auth.sub) {
      authReq.userId = authReq.auth.sub;
    } else {
      authReq.userId = authReq.auth.oid as string;
    }
  }
  
  next();
};

// Apply userId extraction to all routes
router.use(extractUserId);

// Create a new goal
router.post('/', [
  body('title').notEmpty().withMessage('Title is required').isString(),
  body('targetDate').optional().isISO8601().withMessage('Target date must be a valid date'),
  body('notes').optional().isString(),
  body('achieved').optional().isBoolean(),
  body('progress').optional().isFloat({ min: 0, max: 100 })
    .withMessage('Progress must be a number between 0 and 100'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
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

// Get all goals for current user with pagination
router.get('/', [
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
    .withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).toInt()
    .withMessage('Offset must be a non-negative integer'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    
    // Use validated and transformed values directly
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    
    const result = await goalService.getGoalsByUserId(userId, limit, offset);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Get a specific goal by ID
router.get('/:id', [
  param('id').isString().notEmpty().withMessage('Goal ID is required'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    const goalId = req.params.id;
    
    const goal = await goalService.getGoalById(goalId, userId);
    if (!goal) {
      throw ApiError.notFound('Goal not found');
    }
    
    res.status(200).json(goal);
  } catch (error) {
    next(error);
  }
});

// Update a goal
router.put('/:id', [
  param('id').isString().notEmpty().withMessage('Goal ID is required'),
  body('title').optional().isString(),
  body('targetDate').optional().isISO8601().withMessage('Target date must be a valid date'),
  body('notes').optional().isString(),
  body('achieved').optional().isBoolean(),
  body('progress').optional().isFloat({ min: 0, max: 100 })
    .withMessage('Progress must be a number between 0 and 100'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    const goalId = req.params.id;
    
    // Process dates if provided
    const updates = { ...req.body };
    if (updates.targetDate) {
      updates.targetDate = new Date(updates.targetDate);
    }
    
    const updatedGoal = await goalService.updateGoal(goalId, userId, updates);
    if (!updatedGoal) {
      throw ApiError.notFound('Goal not found');
    }
    
    res.status(200).json(updatedGoal);
  } catch (error) {
    next(error);
  }
});

// Delete a goal
router.delete('/:id', [
  param('id').isString().notEmpty().withMessage('Goal ID is required'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    const goalId = req.params.id;
    
    const success = await goalService.deleteGoal(goalId, userId);
    if (!success) {
      throw ApiError.notFound('Goal not found');
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router; 