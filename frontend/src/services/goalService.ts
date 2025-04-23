// frontend/src/services/goalService.ts
// Service for interacting with the goals API

import axios from 'axios';
import { API_CONFIG } from '../config';

// Toggle this to use mock data instead of real API
const USE_MOCK_DATA = true;

// Define types for the fitness goal
export interface FitnessGoal {
  id: string;
  userId: string;
  title: string;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  achieved?: boolean;
  progress?: number;
}

// Mock goal type to make TypeScript happy with our literal declaration
type MockGoal = {
  id: string;
  userId: string;
  title: string;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  achieved: boolean;
  progress: number;
};

// Mock data for development
const MOCK_GOALS: MockGoal[] = [
  {
    id: "goal-1",
    userId: "user-1",
    title: "Run 5K Marathon",
    targetDate: "2023-12-31T00:00:00.000Z",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-02-15T00:00:00.000Z",
    notes: "Train 3 times per week. Focus on endurance.",
    achieved: false,
    progress: 65
  },
  {
    id: "goal-2",
    userId: "user-1",
    title: "Complete 30-Day Fitness Challenge",
    targetDate: "2023-06-30T00:00:00.000Z",
    createdAt: "2023-06-01T00:00:00.000Z",
    updatedAt: "2023-06-30T00:00:00.000Z",
    notes: "Daily workout routine completed!",
    achieved: true,
    progress: 100
  },
  {
    id: "goal-3",
    userId: "user-1",
    title: "Lose 10 pounds",
    targetDate: "2023-11-30T00:00:00.000Z",
    createdAt: "2023-09-01T00:00:00.000Z",
    updatedAt: "2023-10-15T00:00:00.000Z",
    notes: "Focus on diet and cardio",
    achieved: false,
    progress: 40
  }
];

// Paginated response from the API
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// Pagination params
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

// Data needed to create a new goal
export interface CreateGoalRequest {
  title: string;
  targetDate: string;
  notes?: string;
  achieved?: boolean;
  progress?: number;
}

// Data needed to update a goal
export interface UpdateGoalRequest {
  title?: string;
  targetDate?: string;
  notes?: string;
  achieved?: boolean;
  progress?: number;
}

// API service for goals
const goalService = {
  /**
   * Get all goals for the current user with pagination
   * @param params Pagination parameters
   * @returns Promise with paginated goals response
   */
  async getGoals(params?: PaginationParams): Promise<PaginatedResponse<FitnessGoal>> {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      console.log('Using mock data for goals');
      const limit = params?.limit || 10;
      const offset = params?.offset || 0;
      const end = Math.min(offset + limit, MOCK_GOALS.length);
      
      return {
        items: MOCK_GOALS.slice(offset, end),
        total: MOCK_GOALS.length,
        limit,
        offset
      };
    }
    
    try {
      const queryParams = new URLSearchParams();
      
      // Only append parameters that are defined
      if (params?.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
      }
      
      if (params?.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      
      const queryString = queryParams.toString();
      const url = `${API_CONFIG.BASE_URL}/goals${queryString ? `?${queryString}` : ''}`;
      
      const response = await axios.get<PaginatedResponse<FitnessGoal>>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  },

  /**
   * Get a specific goal by ID
   * @param id Goal ID
   * @returns Promise with the goal data
   */
  async getGoalById(id: string): Promise<FitnessGoal> {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      console.log(`Using mock data for goal ${id}`);
      const goal = MOCK_GOALS.find(g => g.id === id);
      if (!goal) {
        throw new Error(`Goal with ID ${id} not found`);
      }
      return goal;
    }
    
    try {
      const response = await axios.get<FitnessGoal>(`${API_CONFIG.BASE_URL}/goals/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching goal ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new goal
   * @param goalData The goal data to create
   * @returns Promise with the created goal
   */
  async createGoal(goalData: CreateGoalRequest): Promise<FitnessGoal> {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      console.log('Using mock data for creating goal');
      const newGoal: MockGoal = {
        id: `goal-${MOCK_GOALS.length + 1}`,
        userId: 'user-1',
        title: goalData.title,
        targetDate: goalData.targetDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: goalData.notes || '',
        achieved: goalData.achieved || false,
        progress: goalData.progress || 0
      };
      
      MOCK_GOALS.push(newGoal);
      return newGoal;
    }
    
    try {
      const response = await axios.post<FitnessGoal>(`${API_CONFIG.BASE_URL}/goals`, goalData);
      return response.data;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  /**
   * Update an existing goal
   * @param id Goal ID to update
   * @param updates The goal data to update
   * @returns Promise with the updated goal
   */
  async updateGoal(id: string, updates: UpdateGoalRequest): Promise<FitnessGoal> {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      console.log(`Using mock data for updating goal ${id}`);
      const index = MOCK_GOALS.findIndex(g => g.id === id);
      if (index === -1) {
        throw new Error(`Goal with ID ${id} not found`);
      }
      
      // Create a properly typed updated goal
      const updatedGoal: MockGoal = {
        ...MOCK_GOALS[index],
        ...(updates.title ? { title: updates.title } : {}),
        ...(updates.targetDate ? { targetDate: updates.targetDate } : {}),
        ...(updates.notes !== undefined ? { notes: updates.notes || '' } : {}),
        ...(updates.achieved !== undefined ? { achieved: updates.achieved } : {}),
        ...(updates.progress !== undefined ? { progress: updates.progress } : {}),
        updatedAt: new Date().toISOString()
      };
      
      MOCK_GOALS[index] = updatedGoal;
      return updatedGoal;
    }
    
    try {
      const response = await axios.put<FitnessGoal>(`${API_CONFIG.BASE_URL}/goals/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating goal ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a goal
   * @param id Goal ID to delete
   * @returns Promise with void
   */
  async deleteGoal(id: string): Promise<void> {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      console.log(`Using mock data for deleting goal ${id}`);
      const index = MOCK_GOALS.findIndex(g => g.id === id);
      if (index === -1) {
        throw new Error(`Goal with ID ${id} not found`);
      }
      
      MOCK_GOALS.splice(index, 1);
      return;
    }
    
    try {
      await axios.delete(`${API_CONFIG.BASE_URL}/goals/${id}`);
    } catch (error) {
      console.error(`Error deleting goal ${id}:`, error);
      throw error;
    }
  }
};

export default goalService; 