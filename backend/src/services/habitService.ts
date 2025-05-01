// backend/src/services/habitService.ts
// Service for habit CRUD operations

import { v4 as uuidv4 } from 'uuid';
import { getHabitsContainer } from './cosmosClient';
import { Habit, HabitCreateDTO, HabitUpdateDTO } from '../models/Habit';
import { ApiError } from '../utils/ApiError';

/**
 * Get container with fallback to in-memory store
 * @returns The container or in-memory store functions
 */
function getContainer() {
  try {
    const container = getHabitsContainer();
    // Test if container is valid
    if (!container || !container.items) {
      console.warn('⚠️ Cosmos DB container unavailable, using in-memory store');
      throw new Error('Invalid container'); // This will trigger the catch block
    }
    return container;
  } catch (error) {
    console.warn('⚠️ Error accessing Cosmos DB:', error);
    throw ApiError.internal('Database service unavailable');
  }
}

/**
 * Create a new habit
 * @param habitData Habit creation data
 * @returns The created habit
 */
export async function createHabit(habitData: HabitCreateDTO): Promise<Habit> {
  const container = getContainer();
  
  const now = new Date();
  const habit: Habit = {
    id: uuidv4(), // Generate a unique ID
    userId: habitData.userId,
    name: habitData.name,
    frequency: habitData.frequency,
    streak: habitData.streak ?? 0, // Default to 0 if not provided
    description: habitData.description,
    createdAt: now,
    updatedAt: now
  };
  
  const { resource } = await container.items.create(habit);
  // Handle potential undefined return value
  if (!resource) {
    throw ApiError.internal('Failed to create habit');
  }
  return resource as unknown as Habit;
}

/**
 * Interface for paginated result
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Get habits for a specific user with pagination
 * @param userId User ID
 * @param limit Maximum number of habits to return (default: 50)
 * @param offset Number of habits to skip (default: 0)
 * @returns Paginated habits result
 */
export async function getHabitsByUserId(
  userId: string,
  limit = 50,
  offset = 0
): Promise<PaginatedResult<Habit>> {
  const container = getContainer();
  
  // Build the query parameters
  const parameters = [
    {
      name: '@userId',
      value: userId
    },
    {
      name: '@offset',
      value: offset
    },
    {
      name: '@limit',
      value: limit
    }
  ];
  
  // Create query specifications
  const countQuerySpec = {
    query: 'SELECT VALUE COUNT(1) FROM c WHERE c.userId = @userId',
    parameters
  };
  
  const habitsQuerySpec = {
    query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit',
    parameters
  };
  
  // Execute both queries in parallel
  const [countResponse, habitsResponse] = await Promise.all([
    container.items.query(countQuerySpec).fetchAll(),
    container.items.query(habitsQuerySpec).fetchAll()
  ]);
  
  const total = countResponse.resources[0] || 0;
  
  return {
    items: habitsResponse.resources as Habit[],
    total,
    limit,
    offset
  };
}

/**
 * Get a habit by its ID and user ID (for security)
 * @param id Habit ID
 * @param userId User ID (for permission check)
 * @returns The habit or null if not found
 */
export async function getHabitById(id: string, userId: string): Promise<Habit | null> {
  const container = getContainer();
  
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
  
  if (resources.length === 0) {
    return null;
  }
  
  return resources[0] as Habit;
}

/**
 * Update an existing habit
 * @param id Habit ID to update
 * @param userId User ID (for permission check)
 * @param updates Partial habit updates
 * @returns The updated habit or null if not found
 */
export async function updateHabit(
  id: string, 
  userId: string, 
  updates: HabitUpdateDTO
): Promise<Habit | null> {
  const container = getContainer();
  
  // First, get the current habit
  const habit = await getHabitById(id, userId);
  if (!habit) {
    return null;
  }
  
  // Update the habit with new values
  const updatedHabit: Habit = {
    ...habit,
    ...updates,
    updatedAt: new Date() // Always update the timestamp
  };
  
  // Replace the item in the container
  const { resource } = await container.item(id, userId).replace(updatedHabit);
  
  return resource as unknown as Habit;
}

/**
 * Delete a habit
 * @param id Habit ID to delete
 * @param userId User ID (for permission check)
 * @returns True if deleted, false if not found
 */
export async function deleteHabit(id: string, userId: string): Promise<boolean> {
  const container = getContainer();
  
  try {
    // First check if the habit exists for this user
    const habit = await getHabitById(id, userId);
    if (!habit) {
      return false;
    }
    
    // Delete the habit
    await container.item(id, userId).delete();
    return true;
  } catch (error: any) {
    // If item not found (404), return false
    if (error.code === 404) {
      return false;
    }
    // Otherwise rethrow
    throw error;
  }
} 