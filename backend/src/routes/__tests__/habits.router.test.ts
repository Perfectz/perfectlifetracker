// backend/src/routes/__tests__/habits.router.test.ts
// Tests for the habits API endpoints

import request from 'supertest';
import express from 'express';
import type { Request, Response, NextFunction, Application } from 'express-serve-static-core';
import habitsRouter from '../habits.router';
import * as habitService from '../../services/habitService';
import { Habit, HabitFrequency } from '../../models/Habit';

// Mock the habitService
jest.mock('../../services/habitService');

// Mock the extractUserId middleware
jest.mock('../../middleware/extractUserId', () => ({
  extractUserId: (req: Request & { userId?: string }, res: Response, next: NextFunction) => {
    req.userId = 'test-user-id';
    next();
  }
}));

// Mock the habitService functions
const mockHabitService = habitService as jest.Mocked<typeof habitService>;

describe('Habits Router', () => {
  let app: Application;
  
  beforeEach(() => {
    // Create a fresh Express app for each test
    app = express();
    
    // Add JSON middleware
    app.use(express.json());
    
    // Add the habits router
    app.use('/api/habits', habitsRouter);
    
    // Add error handler
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error'
      });
    });
    
    // Reset all mocks
    jest.resetAllMocks();
  });
  
  describe('GET /api/habits', () => {
    it('should return a list of habits', async () => {
      const mockHabits = {
        items: [
          { id: '1', name: 'Exercise', frequency: HabitFrequency.DAILY, userId: 'test-user-id' }
        ],
        total: 1,
        limit: 10,
        offset: 0
      };
      
      (habitService.getHabitsByUserId as jest.Mock).mockResolvedValue(mockHabits);
      
      const response = await request(app).get('/api/habits');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockHabits);
      expect(habitService.getHabitsByUserId).toHaveBeenCalledWith('test-user-id', 10, 0);
    });
  });
  
  describe('GET /api/habits/:id', () => {
    it('should return a specific habit', async () => {
      const mockHabit = { id: '1', name: 'Exercise', frequency: HabitFrequency.DAILY, userId: 'test-user-id' };
      
      (habitService.getHabitById as jest.Mock).mockResolvedValue(mockHabit);
      
      const response = await request(app).get('/api/habits/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockHabit);
      expect(habitService.getHabitById).toHaveBeenCalledWith('1', 'test-user-id');
    });
    
    it('should return 404 if habit not found', async () => {
      (habitService.getHabitById as jest.Mock).mockResolvedValue(null);
      
      const response = await request(app).get('/api/habits/999');
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('POST /api/habits', () => {
    it('should create a new habit', async () => {
      const newHabit = { 
        name: 'Exercise', 
        frequency: HabitFrequency.DAILY, 
        description: 'Daily workout routine'
      };
      const createdHabit = { id: '1', ...newHabit, userId: 'test-user-id' };
      
      (habitService.createHabit as jest.Mock).mockResolvedValue(createdHabit);
      
      const response = await request(app)
        .post('/api/habits')
        .send(newHabit);
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdHabit);
      expect(habitService.createHabit).toHaveBeenCalledWith({
        ...newHabit,
        userId: 'test-user-id'
      });
    });
  });
  
  describe('PUT /api/habits/:id', () => {
    it('should update an existing habit', async () => {
      const habitUpdate = { name: 'Updated Exercise' };
      const existingHabit = { 
        id: '1', 
        name: 'Exercise', 
        frequency: HabitFrequency.DAILY, 
        userId: 'test-user-id' 
      };
      const updatedHabit = { ...existingHabit, ...habitUpdate };
      
      (habitService.getHabitById as jest.Mock).mockResolvedValue(existingHabit);
      (habitService.updateHabit as jest.Mock).mockResolvedValue(updatedHabit);
      
      const response = await request(app)
        .put('/api/habits/1')
        .send(habitUpdate);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedHabit);
      expect(habitService.updateHabit).toHaveBeenCalledWith('1', 'test-user-id', habitUpdate);
    });
    
    it('should return 404 if habit to update not found', async () => {
      (habitService.getHabitById as jest.Mock).mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/habits/999')
        .send({ name: 'Updated Exercise' });
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('DELETE /api/habits/:id', () => {
    it('should delete a habit', async () => {
      const existingHabit = { 
        id: '1', 
        name: 'Exercise', 
        frequency: HabitFrequency.DAILY, 
        userId: 'test-user-id' 
      };
      
      (habitService.getHabitById as jest.Mock).mockResolvedValue(existingHabit);
      (habitService.deleteHabit as jest.Mock).mockResolvedValue(true);
      
      const response = await request(app).delete('/api/habits/1');
      
      expect(response.status).toBe(204);
      expect(habitService.deleteHabit).toHaveBeenCalledWith('1', 'test-user-id');
    });
    
    it('should return 404 if habit to delete not found', async () => {
      (habitService.getHabitById as jest.Mock).mockResolvedValue(null);
      
      const response = await request(app).delete('/api/habits/999');
      
      expect(response.status).toBe(404);
    });
  });
}); 