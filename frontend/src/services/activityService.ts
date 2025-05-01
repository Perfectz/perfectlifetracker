// frontend/src/services/activityService.ts
// Service for interacting with the activities API

import axios from 'axios';
import { API_CONFIG } from '../config';

// Toggle this to use mock data instead of real API
const USE_MOCK_DATA = true;

// Define types for activity
export interface Activity {
  id: string;
  userId: string;
  type: string;
  duration: number;
  calories: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// Mock activity type for local development
type MockActivity = {
  id: string;
  userId: string;
  type: string;
  duration: number;
  calories: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
};

// Activity types for development
const ACTIVITY_TYPES = [
  'Running',
  'Walking',
  'Cycling',
  'Swimming',
  'Weightlifting',
  'Yoga',
  'HIIT',
  'Pilates'
];

// Mock data for development
const MOCK_ACTIVITIES: MockActivity[] = [
  {
    id: "activity-1",
    userId: "user-1",
    type: "Running",
    duration: 30,
    calories: 300,
    date: "2023-07-01T08:00:00.000Z",
    createdAt: "2023-07-01T09:30:00.000Z",
    updatedAt: "2023-07-01T09:30:00.000Z",
    notes: "Morning run in the park."
  },
  {
    id: "activity-2",
    userId: "user-1",
    type: "Cycling",
    duration: 45,
    calories: 400,
    date: "2023-07-03T17:00:00.000Z",
    createdAt: "2023-07-03T18:00:00.000Z",
    updatedAt: "2023-07-03T18:00:00.000Z",
    notes: "Evening bike ride along the river."
  },
  {
    id: "activity-3",
    userId: "user-1",
    type: "Swimming",
    duration: 60,
    calories: 500,
    date: "2023-07-05T14:00:00.000Z",
    createdAt: "2023-07-05T15:15:00.000Z",
    updatedAt: "2023-07-05T15:15:00.000Z",
    notes: "Lap swimming at the community pool."
  },
  {
    id: "activity-4",
    userId: "user-1",
    type: "Weightlifting",
    duration: 50,
    calories: 350,
    date: "2023-07-07T10:00:00.000Z",
    createdAt: "2023-07-07T11:00:00.000Z",
    updatedAt: "2023-07-07T11:00:00.000Z",
    notes: "Upper body workout."
  }
];

// Paginated response from the API
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// Activity filter parameters
export interface ActivityFilterParams {
  type?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// Data needed to create a new activity
export interface CreateActivityRequest {
  type: string;
  duration: number;
  calories: number;
  date?: string;
  notes?: string;
}

// Data needed to update an activity
export interface UpdateActivityRequest {
  type?: string;
  duration?: number;
  calories?: number;
  date?: string;
  notes?: string;
}

// API service for activities
const activityService = {
  /**
   * Get all activities for the current user with pagination and filtering
   * @param params Filter and pagination parameters
   * @returns Promise with paginated activities response
   */
  async getActivities(params?: ActivityFilterParams): Promise<PaginatedResponse<Activity>> {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      console.log('Using mock data for activities');
      
      const limit = params?.limit || 10;
      const offset = params?.offset || 0;
      
      // Apply filtering
      let filteredActivities = [...MOCK_ACTIVITIES];
      
      if (params?.type) {
        filteredActivities = filteredActivities.filter(a => a.type === params.type);
      }
      
      if (params?.startDate) {
        const startDate = new Date(params.startDate);
        filteredActivities = filteredActivities.filter(a => new Date(a.date) >= startDate);
      }
      
      if (params?.endDate) {
        const endDate = new Date(params.endDate);
        filteredActivities = filteredActivities.filter(a => new Date(a.date) <= endDate);
      }
      
      // Apply pagination
      const paginatedActivities = filteredActivities.slice(offset, offset + limit);
      
      return {
        items: paginatedActivities,
        total: filteredActivities.length,
        limit,
        offset
      };
    }
    
    try {
      const queryParams = new URLSearchParams();
      
      // Add parameters to query string
      if (params?.type) queryParams.append('type', params.type);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
      
      const queryString = queryParams.toString();
      const url = `${API_CONFIG.BASE_URL}/activities${queryString ? `?${queryString}` : ''}`;
      
      const response = await axios.get<PaginatedResponse<Activity>>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  },

  /**
   * Get a specific activity by ID
   * @param id Activity ID
   * @returns Promise with the activity data
   */
  async getActivityById(id: string): Promise<Activity> {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      console.log(`Using mock data for activity ${id}`);
      const activity = MOCK_ACTIVITIES.find(a => a.id === id);
      if (!activity) {
        throw new Error(`Activity with ID ${id} not found`);
      }
      return activity;
    }
    
    try {
      const response = await axios.get<Activity>(`${API_CONFIG.BASE_URL}/activities/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching activity ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new activity
   * @param activityData The activity data to create
   * @returns Promise with the created activity
   */
  async createActivity(activityData: CreateActivityRequest): Promise<Activity> {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      console.log('Using mock data for creating activity');
      const newActivity: MockActivity = {
        id: `activity-${MOCK_ACTIVITIES.length + 1}`,
        userId: 'user-1',
        type: activityData.type,
        duration: activityData.duration,
        calories: activityData.calories,
        date: activityData.date || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: activityData.notes || ''
      };
      
      MOCK_ACTIVITIES.push(newActivity);
      return newActivity;
    }
    
    try {
      const response = await axios.post<Activity>(`${API_CONFIG.BASE_URL}/activities`, activityData);
      return response.data;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  },

  /**
   * Update an existing activity
   * @param id Activity ID to update
   * @param updates The activity data to update
   * @returns Promise with the updated activity
   */
  async updateActivity(id: string, updates: UpdateActivityRequest): Promise<Activity> {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      console.log(`Using mock data for updating activity ${id}`);
      const index = MOCK_ACTIVITIES.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error(`Activity with ID ${id} not found`);
      }
      
      const updatedActivity: MockActivity = {
        ...MOCK_ACTIVITIES[index],
        ...(updates.type ? { type: updates.type } : {}),
        ...(updates.duration !== undefined ? { duration: updates.duration } : {}),
        ...(updates.calories !== undefined ? { calories: updates.calories } : {}),
        ...(updates.date ? { date: updates.date } : {}),
        ...(updates.notes !== undefined ? { notes: updates.notes || '' } : {}),
        updatedAt: new Date().toISOString()
      };
      
      MOCK_ACTIVITIES[index] = updatedActivity;
      return updatedActivity;
    }
    
    try {
      const response = await axios.put<Activity>(`${API_CONFIG.BASE_URL}/activities/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating activity ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an activity
   * @param id Activity ID to delete
   * @returns Promise that resolves when the activity is deleted
   */
  async deleteActivity(id: string): Promise<void> {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      console.log(`Using mock data for deleting activity ${id}`);
      const index = MOCK_ACTIVITIES.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error(`Activity with ID ${id} not found`);
      }
      
      MOCK_ACTIVITIES.splice(index, 1);
      return;
    }
    
    try {
      await axios.delete(`${API_CONFIG.BASE_URL}/activities/${id}`);
    } catch (error) {
      console.error(`Error deleting activity ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get available activity types
   * @returns Array of activity types
   */
  getActivityTypes(): string[] {
    return ACTIVITY_TYPES;
  }
};

export default activityService; 