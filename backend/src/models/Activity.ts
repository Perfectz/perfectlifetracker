// backend/src/models/Activity.ts
// Define the Activity interface for tracking user fitness activities

/**
 * Activity interface representing a user's fitness activity in the system
 */
export interface Activity {
  id: string;               // Unique identifier for the activity
  userId: string;           // ID of user who owns this activity (partition key)
  type: string;             // Type of activity (e.g., running, cycling, swimming)
  duration: number;         // Duration in minutes
  calories: number;         // Calories burned
  date: Date;               // Date when the activity was performed
  createdAt: Date;          // When the activity record was created
  updatedAt: Date;          // When the activity record was last updated
  notes?: string;           // Optional additional notes about the activity
}

/**
 * ActivityCreateDTO - Data Transfer Object for creating a new activity
 * Omits system-generated fields like id and timestamps
 */
export interface ActivityCreateDTO {
  userId: string;           // ID of user who owns this activity
  type: string;             // Type of activity
  duration: number;         // Duration in minutes
  calories: number;         // Calories burned
  date: Date;               // Date when the activity was performed
  notes?: string;           // Optional additional notes
}

/**
 * ActivityUpdateDTO - Data Transfer Object for updating an existing activity
 * Makes all fields optional except those needed for identification
 */
export interface ActivityUpdateDTO {
  type?: string;            // Updated type
  duration?: number;        // Updated duration
  calories?: number;        // Updated calories
  date?: Date;              // Updated date
  notes?: string;           // Updated notes
} 