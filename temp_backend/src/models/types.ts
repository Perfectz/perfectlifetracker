/**
 * backend/src/models/types.ts
 * Type definitions for the Perfect LifeTracker Pro application
 */

/**
 * Base interface for all database documents
 */
export interface BaseDocument {
  id: string;
  type: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User profile data
 */
export interface UserDocument extends BaseDocument {
  type: 'user';
  email: string;
  displayName: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    weekStartsOn: 0 | 1 | 6; // 0 = Sunday, 1 = Monday, 6 = Saturday
  };
  lastLogin?: string;
  isActive: boolean;
}

/**
 * Fitness data including workouts, measurements, etc.
 */
export interface FitnessDocument extends BaseDocument {
  type: 'workout' | 'measurement' | 'goal';
  date: string;
  
  // Workout specific fields
  activity?: string;
  duration?: number; // in minutes
  calories?: number;
  distance?: number;
  steps?: number;
  notes?: string;
  
  // Measurement specific fields
  measurementType?: string; // weight, body fat, etc.
  value?: number;
  unit?: string;
  
  // Goal specific fields
  goalType?: string;
  targetValue?: number;
  currentValue?: number;
  deadline?: string;
  completed?: boolean;
}

/**
 * Task data including to-dos, reminders, etc.
 */
export interface TaskDocument extends BaseDocument {
  type: 'task';
  title: string;
  description?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completedDate?: string;
  category?: string;
  tags?: string[];
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
}

/**
 * Personal development data including goals, learning activities, etc.
 */
export interface DevelopmentDocument extends BaseDocument {
  type: 'goal' | 'learning' | 'journal';
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  
  // Goal specific fields
  targetDate?: string;
  progressPercentage?: number;
  milestones?: Array<{
    id: string;
    title: string;
    completed: boolean;
    dueDate?: string;
  }>;
  
  // Learning specific fields
  source?: string;
  timeSpent?: number; // in minutes
  notes?: string;
  
  // Journal specific fields
  entryDate?: string;
  mood?: string;
  content?: string;
}

/**
 * AI-generated insights and analytics
 */
export interface AnalyticsDocument extends BaseDocument {
  type: 'insight' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  category: string;
  createdBy: 'system' | 'user';
  confidence?: number; // 0-1 representing AI confidence level
  sourceData?: {
    type: string;
    id: string[];
    fields?: string[];
  };
  dismissed?: boolean;
  actionTaken?: boolean;
}

/**
 * File data structure for uploaded files
 */
export interface FileDocument extends BaseDocument {
  type: 'file';             // Type identifier for the document
  fileName: string;        // Original file name
  blobName: string;        // Name in blob storage
  url: string;             // Public URL to access the file
  contentType: string;     // MIME type
  size: number;            // File size in bytes
  category?: string;       // Optional category (e.g., 'profile', 'task-attachment')
  relatedEntityId?: string; // ID of related entity (e.g., taskId, userId)
} 