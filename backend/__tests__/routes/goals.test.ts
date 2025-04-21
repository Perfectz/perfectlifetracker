import request from 'supertest';
import express from 'express';
import { expressjwt as jwt } from 'express-jwt';
import * as goalService from '../../src/services/goalService';
import { FitnessGoal } from '../../src/models/FitnessGoal';

// Mock the goal service
jest.mock('../../src/services/goalService');

// Mock the express-jwt middleware
jest.mock('express-jwt', () => ({
  expressjwt: jest.fn(() => (req: any, res: any, next: any) => {
    // Simulate authenticated user
    req.auth = { sub: 'user123', name: 'Test User' };
    next();
  })
}));

describe('Goals API Routes', () => {
  let app: express.Application;
  
  // Mock goal data
  const mockGoal: FitnessGoal = {
    id: 'goal123',
    userId: 'user123',
    title: 'Run 5K',
    targetDate: new Date('2023-12-31'),
    createdAt: new Date(),
    achieved: false,
    progress: 0
  };

  const mockGoals: FitnessGoal[] = [
    mockGoal,
    {
      id: 'goal456',
      userId: 'user123',
      title: 'Lose 10 pounds',
      targetDate: new Date('2023-11-30'),
      createdAt: new Date(),
      achieved: false,
      progress: 25
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create express app
    app = express();
    app.use(express.json());
    
    // Setup routes (copied from index.ts)
    app.post('/api/goals', jwt({ secret: 'dummy', algorithms: ['HS256'] }), async (req: any, res: express.Response, next: express.NextFunction) => {
      try {
        const goalData = {
          userId: req.auth.sub || req.auth.oid,
          ...req.body,
          targetDate: req.body.targetDate ? new Date(req.body.targetDate) : new Date()
        };
        const newGoal = await goalService.createGoal(goalData);
        res.status(201).json(newGoal);
      } catch (error) {
        next(error);
      }
    });

    app.get('/api/goals', jwt({ secret: 'dummy', algorithms: ['HS256'] }), async (req: any, res: express.Response, next: express.NextFunction) => {
      try {
        const userId = req.auth.sub || req.auth.oid;
        const goals = await goalService.getGoalsByUserId(userId);
        res.status(200).json(goals);
      } catch (error) {
        next(error);
      }
    });

    app.get('/api/goals/:id', jwt({ secret: 'dummy', algorithms: ['HS256'] }), async (req: any, res: express.Response, next: express.NextFunction) => {
      try {
        const userId = req.auth.sub || req.auth.oid;
        const goalId = req.params.id;
        
        const goal = await goalService.getGoalById(goalId, userId);
        if (!goal) {
          return res.status(404).json({ error: 'NotFound', message: 'Goal not found' });
        }
        
        res.status(200).json(goal);
      } catch (error) {
        next(error);
      }
    });

    app.put('/api/goals/:id', jwt({ secret: 'dummy', algorithms: ['HS256'] }), async (req: any, res: express.Response, next: express.NextFunction) => {
      try {
        const userId = req.auth.sub || req.auth.oid;
        const goalId = req.params.id;
        
        // Process dates if provided
        const updates = { ...req.body };
        if (updates.targetDate) {
          updates.targetDate = new Date(updates.targetDate);
        }
        
        const updatedGoal = await goalService.updateGoal(goalId, userId, updates);
        if (!updatedGoal) {
          return res.status(404).json({ error: 'NotFound', message: 'Goal not found' });
        }
        
        res.status(200).json(updatedGoal);
      } catch (error) {
        next(error);
      }
    });

    app.delete('/api/goals/:id', jwt({ secret: 'dummy', algorithms: ['HS256'] }), async (req: any, res: express.Response, next: express.NextFunction) => {
      try {
        const userId = req.auth.sub || req.auth.oid;
        const goalId = req.params.id;
        
        const success = await goalService.deleteGoal(goalId, userId);
        if (!success) {
          return res.status(404).json({ error: 'NotFound', message: 'Goal not found' });
        }
        
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    });

    // Error handler
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(err.status || 500).json({
        error: err.name || 'InternalServerError',
        message: err.message || 'An unexpected error occurred'
      });
    });
  });

  describe('POST /api/goals', () => {
    it('should create a new goal and return 201', async () => {
      // Mock the createGoal function
      (goalService.createGoal as jest.Mock).mockResolvedValue(mockGoal);

      const response = await request(app)
        .post('/api/goals')
        .send({ 
          title: 'Run 5K', 
          targetDate: '2023-12-31'
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: mockGoal.id,
        userId: mockGoal.userId,
        title: mockGoal.title,
        achieved: mockGoal.achieved,
        progress: mockGoal.progress
      });
      // Check that dates are serialized to strings
      expect(response.body.targetDate).toEqual(expect.any(String));
      expect(response.body.createdAt).toEqual(expect.any(String));

      // Verify the service was called with correct parameters
      expect(goalService.createGoal).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          title: 'Run 5K',
          targetDate: expect.any(Date)
        })
      );
    });

    it('should return 500 when goal creation fails', async () => {
      // Mock the createGoal function to throw an error
      (goalService.createGoal as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/goals')
        .send({ title: 'Run 5K', targetDate: '2023-12-31' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message', 'Database error');
    });
  });

  describe('GET /api/goals', () => {
    it('should return all goals for the user', async () => {
      // Mock the getGoalsByUserId function
      (goalService.getGoalsByUserId as jest.Mock).mockResolvedValue(mockGoals);

      const response = await request(app).get('/api/goals');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toMatchObject({
        id: mockGoals[0].id,
        title: mockGoals[0].title
      });
      expect(response.body[1]).toMatchObject({
        id: mockGoals[1].id,
        title: mockGoals[1].title
      });

      // Verify service was called with correct user ID
      expect(goalService.getGoalsByUserId).toHaveBeenCalledWith('user123');
    });

    it('should return empty array when user has no goals', async () => {
      // Mock an empty array of goals
      (goalService.getGoalsByUserId as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/api/goals');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/goals/:id', () => {
    it('should return a specific goal when it exists', async () => {
      // Mock the getGoalById function
      (goalService.getGoalById as jest.Mock).mockResolvedValue(mockGoal);

      const response = await request(app).get('/api/goals/goal123');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: mockGoal.id,
        userId: mockGoal.userId,
        title: mockGoal.title
      });

      // Verify service was called with correct parameters
      expect(goalService.getGoalById).toHaveBeenCalledWith('goal123', 'user123');
    });

    it('should return 404 when goal does not exist', async () => {
      // Mock null response for non-existent goal
      (goalService.getGoalById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/goals/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'NotFound');
    });
  });

  describe('PUT /api/goals/:id', () => {
    it('should update a goal and return 200', async () => {
      // Mock updated goal
      const updatedMockGoal = {
        ...mockGoal,
        title: 'Run 10K',
        progress: 50,
        updatedAt: new Date()
      };

      // Mock the updateGoal function
      (goalService.updateGoal as jest.Mock).mockResolvedValue(updatedMockGoal);

      const response = await request(app)
        .put('/api/goals/goal123')
        .send({ 
          title: 'Run 10K',
          progress: 50 
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: mockGoal.id,
        userId: mockGoal.userId,
        title: 'Run 10K',
        progress: 50
      });

      // Verify service was called with correct parameters
      expect(goalService.updateGoal).toHaveBeenCalledWith(
        'goal123',
        'user123', 
        expect.objectContaining({
          title: 'Run 10K',
          progress: 50
        })
      );
    });

    it('should return 404 when goal does not exist', async () => {
      // Mock null response for non-existent goal
      (goalService.updateGoal as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/goals/nonexistent')
        .send({ title: 'Updated Goal' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'NotFound');
    });
  });

  describe('DELETE /api/goals/:id', () => {
    it('should delete a goal and return 204', async () => {
      // Mock successful deletion
      (goalService.deleteGoal as jest.Mock).mockResolvedValue(true);

      const response = await request(app).delete('/api/goals/goal123');

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      // Verify service was called with correct parameters
      expect(goalService.deleteGoal).toHaveBeenCalledWith('goal123', 'user123');
    });

    it('should return 404 when goal does not exist', async () => {
      // Mock unsuccessful deletion
      (goalService.deleteGoal as jest.Mock).mockResolvedValue(false);

      const response = await request(app).delete('/api/goals/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'NotFound');
    });
  });
}); 