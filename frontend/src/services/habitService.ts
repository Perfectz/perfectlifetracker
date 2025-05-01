// frontend/src/services/habitService.ts
import { callApi } from './apiService';
import { apiConfig } from '../authConfig';

export enum HabitFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  frequency: HabitFrequency;
  streak: number;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
}

export interface HabitListResponse {
  items: Habit[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateHabitRequest {
  name: string;
  frequency: HabitFrequency;
  description?: string;
  streak?: number;
}

export interface UpdateHabitRequest {
  name?: string;
  frequency?: HabitFrequency;
  description?: string;
  streak?: number;
}

// For mock streak data visualization
export interface StreakData {
  date: string;
  streak: number;
}

// API endpoints
const BASE_URL = `${apiConfig.baseUrl}/habits`;

// Get habits with pagination
export const getHabits = async (page: number = 1, limit: number = 10): Promise<HabitListResponse> => {
  const endpoint = `${BASE_URL}?page=${page}&limit=${limit}`;
  return callApi<HabitListResponse>(endpoint);
};

// Get a specific habit by ID
export const getHabit = async (id: string): Promise<Habit> => {
  return callApi<Habit>(`${BASE_URL}/${id}`);
};

// Create a new habit
export const createHabit = async (habitData: CreateHabitRequest): Promise<Habit> => {
  return callApi<Habit>(BASE_URL, {
    method: 'POST',
    body: habitData
  });
};

// Update an existing habit
export const updateHabit = async (id: string, habitData: UpdateHabitRequest): Promise<Habit> => {
  return callApi<Habit>(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: habitData
  });
};

// Delete a habit
export const deleteHabit = async (id: string): Promise<void> => {
  return callApi<void>(`${BASE_URL}/${id}`, {
    method: 'DELETE'
  });
};

// For development and testing - Mock streak data visualization
export const getStreakData = (habits: Habit[]): StreakData[] => {
  // If no habits, return empty array
  if (!habits || habits.length === 0) {
    return [];
  }
  
  // Generate last 30 days of streak data
  const data: StreakData[] = [];
  const today = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simple mock algorithm - randomly select a habit and use its streak
    // In real app, this would use actual habit completion data
    const randomHabit = habits[Math.floor(Math.random() * habits.length)];
    const streak = randomHabit ? Math.max(0, randomHabit.streak - Math.floor(Math.random() * 3)) : 0;
    
    data.push({
      date: date.toISOString().split('T')[0],
      streak: streak
    });
  }
  
  return data;
};

const habitService = {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  getStreakData
};

export default habitService; 