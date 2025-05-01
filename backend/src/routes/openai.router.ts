// backend/src/routes/openai.router.ts
// Router for OpenAI-powered insights API endpoints

import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { getActivitiesByUserId, ActivityFilterOptions } from '../services/activityService';
import { ApiError } from '../utils/ApiError';
import { authorize } from '../middleware/auth';
import { extractUserId } from '../middleware/extractUserId';
import { calculateFitnessAnalytics } from '../services/analyticsService';
import openaiClient from '../services/openaiService';

// Define AuthRequest interface to include userId from middleware
interface AuthRequest extends Request {
  userId?: string; // Added by extractUserId middleware
  auth?: {
    sub?: string;
    oid?: string;
    [key: string]: unknown;
  };
}

// Router for OpenAI-powered insights endpoints
const router = express.Router();

// Apply auth middleware to all routes
router.use(authorize);
router.use(extractUserId);

// POST /openai/fitness-summary endpoint
router.post(
  '/fitness-summary',
  [
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date')
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
      const endDate = req.body.endDate 
        ? new Date(req.body.endDate as string) 
        : new Date();
      
      const startDate = req.body.startDate 
        ? new Date(req.body.startDate as string) 
        : new Date(endDate);
      
      // Default to 30 days before end date if no start date specified
      if (!req.body.startDate) {
        startDate.setDate(endDate.getDate() - 30);
      }

      try {
        // Get activities for the period
        const filters: ActivityFilterOptions = {
          startDate,
          endDate
        };
        
        // Fetch activities and analytics in parallel
        const [activitiesResult, analytics] = await Promise.all([
          getActivitiesByUserId(userId, filters, 1000, 0),
          calculateFitnessAnalytics(userId, startDate, endDate)
        ]);
        
        const activities = activitiesResult.items;
        
        // Generate summary using OpenAI
        const summary = await openaiClient.generateFitnessSummary(activities, analytics);
        
        res.status(200).json({ summary });
      } catch (error: any) {
        console.error('Error generating fitness summary:', error.message);
        
        // Return a user-friendly error message
        res.status(500).json({ 
          error: 'InternalServerError', 
          message: 'Unable to generate fitness summary at this time.',
          details: isDevelopment ? error.message : undefined
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

// Add an environment check for better error messages
const isDevelopment = process.env.NODE_ENV !== 'production';

export default router; 