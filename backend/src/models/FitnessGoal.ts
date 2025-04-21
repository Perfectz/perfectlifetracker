// backend/src/models/FitnessGoal.ts
// Define the FitnessGoal interface for tracking user fitness objectives

/**
 * FitnessGoal interface representing a user's fitness goal in the system
 */
export interface FitnessGoal {
  id: string;               // Unique identifier for the goal
  userId: string;           // ID of user who owns this goal (partition key)
  title: string;            // Title/name of the goal
  targetDate: Date;         // Target date to achieve the goal
  createdAt: Date;          // When the goal was created
  updatedAt?: Date;         // When the goal was last updated
  notes?: string;           // Optional additional notes about the goal
  achieved?: boolean;       // Whether the goal has been achieved
  progress?: number;        // Optional progress percentage (0-100)
}

/**
 * FitnessGoalCreateDTO - Data Transfer Object for creating a new fitness goal
 * Omits system-generated fields like id and timestamps
 */
export type FitnessGoalCreateDTO = Omit<FitnessGoal, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * FitnessGoalUpdateDTO - Data Transfer Object for updating an existing fitness goal
 * Makes all fields optional except those needed for identification
 */
export type FitnessGoalUpdateDTO = Partial<Omit<FitnessGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>; 