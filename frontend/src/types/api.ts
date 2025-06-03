/**
 * frontend/src/types/api.ts
 * TypeScript interfaces for API responses and requests
 */

// Base API response structure
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

// File upload related interfaces
export interface FileResponse {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  downloadUrl?: string;
  blobName?: string;
  url?: string;
  contentType?: string;
}

export interface MultipleFilesResponse {
  files: FileResponse[];
}

// Authentication related interfaces
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  bio?: string;
  role?: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

// Error handling interfaces
export interface ApiError {
  message: string;
  status?: number;
  details?: Record<string, unknown>;
}

// Progress callback for uploads
export interface UploadProgressCallback {
  (progress: number): void;
}

// Fitness related interfaces
export interface FitnessRecord {
  id: string;
  userId: string;
  type: 'workout' | 'measurement' | 'goal';
  date: string;
  data: WorkoutData | MeasurementData | GoalData;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutData {
  activity: string;
  duration: number;
  distance?: number;
  calories?: number;
  notes?: string;
}

export interface MeasurementData {
  measurementType: string;
  value: number;
  unit: string;
  notes?: string;
}

export interface GoalData {
  goalType: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  notes?: string;
}

// Meal tracking interfaces
export interface MealRecord {
  id: string;
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
  foods: FoodItem[];
  totalCalories: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

// Task management interfaces
export interface TaskRecord {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Generic list response
export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
