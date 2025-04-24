// backend/src/routes/activities.router.ts
// Router for fitness activity API endpoints

import express, { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import * as activityService from '../services/activityService';
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

// Create a new activity
router.post('/', [
  body('type').notEmpty().withMessage('Activity type is required').isString(),
  body('duration').notEmpty().withMessage('Duration is required').isInt({ min: 1 }),
  body('calories').notEmpty().withMessage('Calories is required').isInt({ min: 0 }),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  body('notes').optional().isString(),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    const activityData = { 
      userId, 
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : new Date()
    };
    
    const newActivity = await activityService.createActivity(activityData);
    res.status(201).json(newActivity);
  } catch (error) {
    next(error);
  }
});

// Get all activities for current user with filters and pagination
router.get('/', [
  query('type').optional().isString(),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
    .withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).toInt()
    .withMessage('Offset must be a non-negative integer'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    
    // Use validated and transformed values
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    
    // Build filter options from query parameters
    const filters: activityService.ActivityFilterOptions = {};
    
    if (req.query.type) {
      filters.type = req.query.type as string;
    }
    
    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }
    
    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }
    
    const result = await activityService.getActivitiesByUserId(
      userId, 
      filters, 
      limit, 
      offset
    );
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Get a specific activity by ID
router.get('/:id', [
  param('id').isString().notEmpty().withMessage('Activity ID is required'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    const activityId = req.params.id;
    
    const activity = await activityService.getActivityById(activityId, userId);
    if (!activity) {
      throw ApiError.notFound('Activity not found');
    }
    
    res.status(200).json(activity);
  } catch (error) {
    next(error);
  }
});

// Update an activity
router.put('/:id', [
  param('id').isString().notEmpty().withMessage('Activity ID is required'),
  body('type').optional().isString(),
  body('duration').optional().isInt({ min: 1 }),
  body('calories').optional().isInt({ min: 0 }),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  body('notes').optional().isString(),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    const activityId = req.params.id;
    
    // Process dates if provided
    const updates = { ...req.body };
    if (updates.date) {
      updates.date = new Date(updates.date);
    }
    
    const updatedActivity = await activityService.updateActivity(activityId, userId, updates);
    if (!updatedActivity) {
      throw ApiError.notFound('Activity not found');
    }
    
    res.status(200).json(updatedActivity);
  } catch (error) {
    next(error);
  }
});

// Delete an activity
router.delete('/:id', [
  param('id').isString().notEmpty().withMessage('Activity ID is required'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    const activityId = req.params.id;
    
    const success = await activityService.deleteActivity(activityId, userId);
    if (!success) {
      throw ApiError.notFound('Activity not found');
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router; 