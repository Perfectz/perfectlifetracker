// backend/src/models/FitnessGoal.ts
// Define the FitnessGoal interface for tracking user fitness objectives

/**
 * GoalType enum representing different types of fitness goals
 */
export enum GoalType {
  WEIGHT_LOSS = 'WEIGHT_LOSS',
  MUSCLE_GAIN = 'MUSCLE_GAIN',
  ENDURANCE = 'ENDURANCE',
  STRENGTH = 'STRENGTH',
  FLEXIBILITY = 'FLEXIBILITY',
  CARDIO = 'CARDIO',
  OTHER = 'OTHER'
}

/**
 * GoalStatus enum representing the status of a fitness goal
 */
export enum GoalStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED'
}

/**
 * FitnessGoal interface representing a user's fitness goal in the system
 */
export interface FitnessGoal {
  id: string;               // Unique identifier for the goal
  userId: string;           // ID of user who owns this goal (partition key)
  title: string;            // Title/name of the goal
  targetDate: Date;         // Target date to achieve the goal
  createdAt: Date;          // When the goal was created
  updatedAt: Date;          // When the goal was last updated
  notes?: string;           // Optional additional notes about the goal
  achieved?: boolean;       // Whether the goal has been achieved
  progress?: number;        // Optional progress percentage (0-100)
  type?: GoalType;          // Type of fitness goal
  status?: GoalStatus;      // Status of the goal
}

/**
 * FitnessGoalCreateDTO - Data Transfer Object for creating a new fitness goal
 * Omits system-generated fields like id and timestamps
 */
export interface FitnessGoalCreateDTO {
  userId: string;          // ID of user who owns this goal
  title: string;           // Title/name of the goal
  targetDate: Date;        // Target date to achieve the goal
  notes?: string;          // Optional additional notes about the goal
  achieved?: boolean;      // Whether the goal has been achieved (defaults to false)
  progress?: number;       // Optional progress percentage (0-100, defaults to 0)
  type?: GoalType;         // Type of fitness goal
  status?: GoalStatus;     // Status of the goal
}

/**
 * FitnessGoalUpdateDTO - Data Transfer Object for updating an existing fitness goal
 * Makes all fields optional except those needed for identification
 */
export interface FitnessGoalUpdateDTO {
  title?: string;           // Updated title/name
  targetDate?: Date;        // Updated target date
  notes?: string;           // Updated notes
  achieved?: boolean;       // Updated achievement status
  progress?: number;        // Updated progress percentage
  type?: GoalType;          // Updated goal type
  status?: GoalStatus;      // Updated goal status
} 