import axios from 'axios';
import { getGoals, getGoalById, createGoal, updateGoal, deleteGoal } from '../goalService';
import { apiClient } from '../apiClient';

// Mock axios and apiClient
jest.mock('axios');
jest.mock('../apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

describe('goalService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGoals', () => {
    it('should include pagination parameters in the URL when specified', async () => {
      // Mock the API client response
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: {
          items: [{ id: 'goal-1', userId: 'user-1', title: 'Test Goal' }],
          total: 1,
          limit: 10,
          offset: 0
        },
        status: 200
      });

      // Call the getGoals function with pagination
      await getGoals(1, 10);

      // Check if apiClient.get was called with the correct URL
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledWith('/goals?page=1&limit=10');
    });

    it('should not include undefined pagination parameters in the URL', async () => {
      // Mock the API client response
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: {
          items: [{ id: 'goal-1', userId: 'user-1', title: 'Test Goal' }],
          total: 1,
          limit: 10,
          offset: 0
        },
        status: 200
      });

      // Call the getGoals function with undefined parameters
      await getGoals(undefined, undefined);

      // Check if apiClient.get was called with the correct URL
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledWith('/goals');
    });

    it('should include only defined pagination parameters', async () => {
      // Mock the API client response
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: {
          items: [{ id: 'goal-1', userId: 'user-1', title: 'Test Goal' }],
          total: 1,
          limit: 20,
          offset: 0
        },
        status: 200
      });

      // Call the getGoals function with only limit
      await getGoals(undefined, 20);

      // Check URL has only limit
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledWith('/goals?limit=20');
    });

    it('should handle the response correctly', async () => {
      // Mock data
      const mockData = {
        items: [
          {
            id: 'goal-1',
            userId: 'user-1',
            title: 'Test Goal',
            createdAt: '2025-01-01',
            targetDate: '2025-01-01'
          }
        ],
        total: 1,
        limit: 10,
        offset: 0
      };

      // Mock the API client response
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockData,
        status: 200
      });

      // Call the getGoals function
      const result = await getGoals();
      
      // Check the result
      expect(result).toEqual(mockData);
      expect(result.items.length).toBe(1);
      expect(result.items[0].title).toBe('Test Goal');
    });
  });

  // Additional tests for other functions
  describe('getGoalById', () => {
    it('should fetch a goal by id', async () => {
      const mockGoal = {
        id: 'goal-1', 
        userId: 'user-1', 
        title: 'Test Goal',
        createdAt: '2025-01-01',
        targetDate: '2025-01-01'
      };
      
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockGoal,
        status: 200
      });
      
      const result = await getGoalById('goal-1');
      
      expect(apiClient.get).toHaveBeenCalledWith('/goals/goal-1');
      expect(result).toEqual(mockGoal);
    });
  });
  
  describe('createGoal', () => {
    it('should create a new goal', async () => {
      const newGoal = {
        title: 'New Goal',
        targetDate: '2025-01-01'
      };
      
      const createdGoal = {
        id: 'new-goal-id', 
        userId: 'user-1', 
        ...newGoal,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };
      
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: createdGoal,
        status: 201
      });
      
      const result = await createGoal(newGoal);
      
      expect(apiClient.post).toHaveBeenCalledWith('/goals', newGoal);
      expect(result).toEqual(createdGoal);
    });
  });
  
  describe('updateGoal', () => {
    it('should update an existing goal', async () => {
      const goalId = 'goal-1';
      const updatedData = {
        title: 'Updated Goal',
        completed: true
      };
      
      const updatedGoal = {
        id: goalId,
        userId: 'user-1',
        title: 'Updated Goal',
        completed: true,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-02'
      };
      
      (apiClient.put as jest.Mock).mockResolvedValue({
        data: updatedGoal,
        status: 200
      });
      
      const result = await updateGoal(goalId, updatedData);
      
      expect(apiClient.put).toHaveBeenCalledWith(`/goals/${goalId}`, updatedData);
      expect(result).toEqual(updatedGoal);
    });
  });
  
  describe('deleteGoal', () => {
    it('should delete a goal', async () => {
      const goalId = 'goal-1';
      
      (apiClient.delete as jest.Mock).mockResolvedValue({
        status: 204
      });
      
      await deleteGoal(goalId);
      
      expect(apiClient.delete).toHaveBeenCalledWith(`/goals/${goalId}`);
    });
  });
}); 