// backend/src/models/Habit.ts
// Define the Habit interface for tracking user habits

/**
 * Enum for habit frequency options
 */
export enum HabitFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

/**
 * Habit interface representing a user's habit in the system
 */
export interface Habit {
  id: string;               // Unique identifier for the habit
  userId: string;           // ID of user who owns this habit (partition key)
  name: string;             // Name of the habit
  frequency: HabitFrequency;// Frequency of the habit (e.g., daily, weekly)
  streak: number;           // Current streak count
  createdAt: Date;          // When the habit record was created
  updatedAt: Date;          // When the habit record was last updated
  description?: string;     // Optional description of the habit
}

/**
 * HabitCreateDTO - Data Transfer Object for creating a new habit
 * Omits system-generated fields like id and timestamps
 */
export interface HabitCreateDTO {
  userId: string;           // ID of user who owns this habit
  name: string;             // Name of the habit
  frequency: HabitFrequency;// Frequency of the habit
  streak?: number;          // Initial streak count (defaults to 0)
  description?: string;     // Optional description
}

/**
 * HabitUpdateDTO - Data Transfer Object for updating an existing habit
 * Makes all fields optional except those needed for identification
 */
export interface HabitUpdateDTO {
  name?: string;            // Updated name
  frequency?: HabitFrequency;// Updated frequency
  streak?: number;          // Updated streak count
  description?: string;     // Updated description
} 