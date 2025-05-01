// backend/src/routes/__tests__/openai.router.test.ts
// Tests for the OpenAI router

import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import openaiRouter from '../openai.router';
import * as activityService from '../../services/activityService';
import * as analyticsService from '../../services/analyticsService';

// Define the extended request interface
interface AuthRequest extends Request {
  userId?: string;
}

// Mock the services
jest.mock('../../services/activityService');
jest.mock('../../services/analyticsService');
jest.mock('../../middleware/auth', () => ({
  authorize: (req: Request, res: Response, next: NextFunction) => next()
}));
jest.mock('../../middleware/extractUserId', () => ({
  extractUserId: (req: AuthRequest, res: Response, next: NextFunction) => {
    req.userId = 'test-user-id';
    next();
  }
}));

describe('OpenAI Router', () => {
  let app: express.Application;
  
  beforeEach(() => {
    // Create a new Express app for testing
    app = express();
    app.use(express.json());
    app.use('/openai', openaiRouter);
    
    // Reset all mocks
    jest.resetAllMocks();
    
    // Setup default mock data
    (activityService.getActivitiesByUserId as jest.Mock).mockResolvedValue({
      items: [
        {
          id: 'activity-1',
          userId: 'test-user-id',
          type: 'Running',
          duration: 30,
          calories: 300,
          date: new Date('2025-01-10')
        },
        {
          id: 'activity-2',
          userId: 'test-user-id',
          type: 'Cycling',
          duration: 45,
          calories: 400,
          date: new Date('2025-01-15')
        }
      ],
      total: 2
    });
    
    (analyticsService.calculateFitnessAnalytics as jest.Mock).mockResolvedValue({
      totalDuration: 75,
      totalCalories: 700,
      averageDurationPerDay: 37.5,
      averageCaloriesPerDay: 350,
      activityCountByType: {
        'Running': 1,
        'Cycling': 1
      },
      caloriesByType: {
        'Running': 300,
        'Cycling': 400
      },
      durationByType: {
        'Running': 30,
        'Cycling': 45
      },
      activeDays: 2,
      activitiesCount: 2
    });
  });
  
  describe('POST /openai/fitness-summary', () => {
    it('should return a fitness summary based on activities and analytics', async () => {
      const response = await request(app)
        .post('/openai/fitness-summary')
        .send({
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        });
      
      // Check response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
      expect(typeof response.body.summary).toBe('string');
      
      // Verify the summary contains relevant information
      expect(response.body.summary).toContain('2 activities');
      expect(response.body.summary).toContain('Running');
      expect(response.body.summary).toContain('Cycling');
      
      // Check that service methods were called correctly
      expect(activityService.getActivitiesByUserId).toHaveBeenCalledWith(
        'test-user-id',
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date)
        }),
        1000,
        0
      );
      
      expect(analyticsService.calculateFitnessAnalytics).toHaveBeenCalledWith(
        'test-user-id',
        expect.any(Date),
        expect.any(Date)
      );
    });
    
    it('should handle empty activities gracefully', async () => {
      // Mock empty activity result
      (activityService.getActivitiesByUserId as jest.Mock).mockResolvedValue({
        items: [],
        total: 0
      });
      
      (analyticsService.calculateFitnessAnalytics as jest.Mock).mockResolvedValue({
        totalDuration: 0,
        totalCalories: 0,
        averageDurationPerDay: 0,
        averageCaloriesPerDay: 0,
        activityCountByType: {},
        caloriesByType: {},
        durationByType: {},
        activeDays: 0,
        activitiesCount: 0
      });
      
      const response = await request(app)
        .post('/openai/fitness-summary')
        .send({
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        });
      
      // Check response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
      expect(typeof response.body.summary).toBe('string');
      
      // Verify the summary contains appropriate message for no activities
      expect(response.body.summary).toContain("haven't logged any activities");
    });
    
    it('should handle missing date parameters by using defaults', async () => {
      const response = await request(app)
        .post('/openai/fitness-summary')
        .send({});
      
      // Check response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
      
      // Check that service methods were called with default dates
      expect(activityService.getActivitiesByUserId).toHaveBeenCalledWith(
        'test-user-id',
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date)
        }),
        1000,
        0
      );
    });
  });
}); 