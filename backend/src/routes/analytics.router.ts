// backend/src/routes/analytics.router.ts
// Router for fitness analytics API endpoints

import express, { Request, Response, NextFunction } from 'express';
import { query, validationResult } from 'express-validator';
import { calculateFitnessAnalytics, calculateWeeklyTrends } from '../services/analyticsService';
import { ApiError } from '../utils/ApiError';
import { authorize } from '../middleware/auth';
import { extractUserId } from '../middleware/extractUserId';

// Router for fitness analytics API endpoints
const router = express.Router();

// Define AuthRequest interface to include userId from middleware
interface AuthRequest extends Request {
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

// GET /analytics/fitness endpoint
router.get(
  '/fitness',
  [
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date')
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

      // Parse date parameters or use defaults (last 30 days)
      const endDate = req.query.endDate 
        ? new Date(req.query.endDate as string) 
        : new Date();
      
      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string) 
        : new Date(endDate);
      
      // Default to 30 days before end date if no start date specified
      if (!req.query.startDate) {
        startDate.setDate(endDate.getDate() - 30);
      }

      // Calculate analytics for the period
      const analytics = await calculateFitnessAnalytics(userId, startDate, endDate);
      
      res.status(200).json(analytics);
    } catch (error) {
      next(error);
    }
  }
);

// GET /analytics/weekly-trends endpoint
router.get(
  '/weekly-trends',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'User ID not found in request' });
      }

      // Calculate weekly trends (current week vs previous week)
      const trends = await calculateWeeklyTrends(userId);
      
      res.status(200).json(trends);
    } catch (error) {
      next(error);
    }
  }
);

export default router; 