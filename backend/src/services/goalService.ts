// backend/src/services/goalService.ts
// Service for fitness goal CRUD operations

import { v4 as uuidv4 } from 'uuid';
import { getGoalsContainer } from './cosmosClient';
import { FitnessGoal, FitnessGoalCreateDTO, FitnessGoalUpdateDTO } from '../models/FitnessGoal';

/**
 * Create a new fitness goal
 * @param goalData Goal creation data
 * @returns The created goal
 */
export async function createGoal(goalData: FitnessGoalCreateDTO): Promise<FitnessGoal> {
  const container = getGoalsContainer();
  
  const goal: FitnessGoal = {
    id: uuidv4(), // Generate a unique ID
    userId: goalData.userId,
    title: goalData.title,
    targetDate: goalData.targetDate,
    notes: goalData.notes,
    achieved: goalData.achieved || false,
    progress: goalData.progress || 0,
    createdAt: new Date()
  };
  
  const { resource } = await container.items.create(goal);
  // Handle potential undefined return value
  if (!resource) {
    throw new Error('Failed to create goal');
  }
  return resource as unknown as FitnessGoal;
}

/**
 * Get all goals for a specific user
 * @param userId User ID
 * @returns Array of goals
 */
export async function getGoalsByUserId(userId: string): Promise<FitnessGoal[]> {
  const container = getGoalsContainer();
  
  const querySpec = {
    query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC',
    parameters: [
      {
        name: '@userId',
        value: userId
      }
    ]
  };
  
  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources as FitnessGoal[];
}

/**
 * Get a specific goal by ID
 * @param id Goal ID 
 * @param userId User ID
 * @returns The goal or null if not found
 */
export async function getGoalById(id: string, userId: string): Promise<FitnessGoal | null> {
  const container = getGoalsContainer();
  
  const querySpec = {
    query: 'SELECT * FROM c WHERE c.id = @id AND c.userId = @userId',
    parameters: [
      {
        name: '@id',
        value: id
      },
      {
        name: '@userId',
        value: userId
      }
    ]
  };
  
  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources.length > 0 ? resources[0] : null;
}

/**
 * Update an existing goal
 * @param id Goal ID to update
 * @param userId User ID
 * @param updates Goal fields to update
 * @returns The updated goal
 */
export async function updateGoal(id: string, userId: string, updates: FitnessGoalUpdateDTO): Promise<FitnessGoal | null> {
  const container = getGoalsContainer();
  
  // First get the existing goal
  const existingGoal = await getGoalById(id, userId);
  if (!existingGoal) {
    return null;
  }
  
  // Ensure user owns this goal
  if (existingGoal.userId !== userId) {
    return null;
  }
  
  // Merge updates with existing goal
  const updatedGoal: FitnessGoal = {
    ...existingGoal,
    ...updates,
    id, // Ensure ID doesn't change
    userId, // Ensure userId doesn't change
    createdAt: existingGoal.createdAt, // Preserve original creation date
    updatedAt: new Date() // Update the updated timestamp
  };
  
  const { resource } = await container.items.upsert(updatedGoal);
  // Handle potential undefined return value
  if (!resource) {
    throw new Error('Failed to update goal');
  }
  return resource as unknown as FitnessGoal;
}

/**
 * Delete a goal by ID
 * @param id Goal ID to delete
 * @param userId User ID
 * @returns True if successful, false if goal not found
 */
export async function deleteGoal(id: string, userId: string): Promise<boolean> {
  const container = getGoalsContainer();
  
  // Check if goal exists and belongs to user
  const goal = await getGoalById(id, userId);
  if (!goal) {
    return false;
  }
  
  // Delete the goal
  try {
    await container.item(id, userId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting goal:', error);
    return false;
  }
}

/**
 * Get all goals - for admin purposes
 * @param limit Maximum number of goals to return
 * @returns Array of goals
 */
export async function getAllGoals(limit = 100): Promise<FitnessGoal[]> {
  const container = getGoalsContainer();
  
  const querySpec = {
    query: 'SELECT * FROM c ORDER BY c.createdAt DESC OFFSET 0 LIMIT @limit',
    parameters: [
      {
        name: '@limit',
        value: limit
      }
    ]
  };
  
  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources as FitnessGoal[];
} 