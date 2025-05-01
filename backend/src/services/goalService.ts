// backend/src/services/goalService.ts
// Service for fitness goal CRUD operations

import { v4 as uuidv4 } from 'uuid';
import { getGoalsContainer } from './cosmosClient';
import { FitnessGoal, FitnessGoalCreateDTO, FitnessGoalUpdateDTO } from '../models/FitnessGoal';
import { ApiError } from '../utils/ApiError';

// In-memory store for development when Cosmos DB is unavailable
const inMemoryGoals: FitnessGoal[] = [];

/**
 * Interface for query parameters
 */
interface QueryParameter {
  name: string;
  value: string | number | boolean;
}

interface QuerySpec {
  query: string;
  parameters: QueryParameter[];
}

/**
 * Get container with fallback to in-memory store
 * @returns The container or in-memory store functions
 */
function getContainer() {
  try {
    const container = getGoalsContainer();
    // Test if container is valid
    if (!container || !container.items) {
      console.warn('⚠️ Cosmos DB container unavailable, using in-memory store');
      return createInMemoryStore();
    }
    return container;
  } catch (error: unknown) {
    console.warn('⚠️ Error accessing Cosmos DB, using in-memory store:', error);
    return createInMemoryStore();
  }
}

/**
 * Create an in-memory store with similar API to Cosmos container
 */
function createInMemoryStore() {
  return {
    items: {
      create: async (goal: FitnessGoal) => {
        inMemoryGoals.push(goal);
        return { resource: goal };
      },
      query: (querySpec: QuerySpec) => {
        // Simple query parser
        if (querySpec.query.includes('COUNT(1)')) {
          // Count query
          const userId = querySpec.parameters.find((p: QueryParameter) => p.name === '@userId')?.value;
          const count = inMemoryGoals.filter(g => g.userId === userId).length;
          return {
            fetchAll: async () => ({ resources: [count] })
          };
        } else if (querySpec.query.includes('c.userId = @userId')) {
          const userId = querySpec.parameters.find((p: QueryParameter) => p.name === '@userId')?.value;
          const limit = querySpec.parameters.find((p: QueryParameter) => p.name === '@limit')?.value || 50;
          const offset = querySpec.parameters.find((p: QueryParameter) => p.name === '@offset')?.value || 0;
          
          let filtered = inMemoryGoals.filter(g => g.userId === userId);
          
          // Handle ORDER BY
          if (querySpec.query.includes('ORDER BY c.createdAt DESC')) {
            filtered = filtered.sort((a, b) => {
              const dateA = new Date(a.createdAt);
              const dateB = new Date(b.createdAt);
              return dateB.getTime() - dateA.getTime();
            });
          }
          
          // Apply pagination
          filtered = filtered.slice(offset as number, (offset as number) + (limit as number));
          
          return {
            fetchAll: async () => ({ resources: filtered })
          };
        } else if (querySpec.query.includes('c.id = @id')) {
          const id = querySpec.parameters.find((p: QueryParameter) => p.name === '@id')?.value;
          const userId = querySpec.parameters.find((p: QueryParameter) => p.name === '@userId')?.value;
          const filtered = inMemoryGoals.filter(g => g.id === id && g.userId === userId);
          return {
            fetchAll: async () => ({ resources: filtered })
          };
        }
        
        // Default - return all items
        return {
          fetchAll: async () => ({ resources: inMemoryGoals })
        };
      },
      upsert: async (goal: FitnessGoal) => {
        const index = inMemoryGoals.findIndex(g => g.id === goal.id);
        if (index >= 0) {
          inMemoryGoals[index] = goal;
        } else {
          inMemoryGoals.push(goal);
        }
        return { resource: goal };
      }
    },
    item: (id: string, userId: string) => ({
      delete: async () => {
        const index = inMemoryGoals.findIndex(g => g.id === id && g.userId === userId);
        if (index >= 0) {
          inMemoryGoals.splice(index, 1);
          return { resource: { id } };
        }
        throw new Error('Item not found');
      }
    })
  };
}

/**
 * Create a new fitness goal
 * @param goalData Goal creation data
 * @returns The created goal
 */
export async function createGoal(goalData: FitnessGoalCreateDTO): Promise<FitnessGoal> {
  const container = getContainer();
  
  const now = new Date();
  const goal: FitnessGoal = {
    id: uuidv4(), // Generate a unique ID
    userId: goalData.userId,
    title: goalData.title,
    targetDate: goalData.targetDate,
    notes: goalData.notes,
    achieved: goalData.achieved || false,
    progress: goalData.progress || 0,
    createdAt: now,
    updatedAt: now
  };
  
  const { resource } = await container.items.create(goal);
  // Handle potential undefined return value
  if (!resource) {
    throw ApiError.internal('Failed to create goal');
  }
  return resource as unknown as FitnessGoal;
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
 * Get all goals for a specific user with pagination
 * @param userId User ID
 * @param limit Maximum number of goals to return (default: 50)
 * @param offset Number of goals to skip (default: 0)
 * @param filters Optional filters for goal type and status
 * @returns Paginated goals result
 */
export async function getGoalsByUserId(
  userId: string,
  limit = 50,
  offset = 0,
  filters: Record<string, string> = {}
): Promise<PaginatedResult<FitnessGoal>> {
  const container = getContainer();
  
  // Build the WHERE clause with filters
  let whereClause = 'c.userId = @userId';
  const parameters = [
    {
      name: '@userId',
      value: userId
    }
  ];
  
  // Add type filter if provided
  if (filters.type) {
    whereClause += ' AND c.type = @type';
    parameters.push({
      name: '@type',
      value: filters.type
    });
  }
  
  // Add status filter if provided
  if (filters.status) {
    whereClause += ' AND c.status = @status';
    parameters.push({
      name: '@status',
      value: filters.status
    });
  }
  
  // Query to get the total count
  const countQuerySpec = {
    query: `SELECT VALUE COUNT(1) FROM c WHERE ${whereClause}`,
    parameters
  };
  
  // Query to get the paginated goals
  const querySpec = {
    query: `SELECT * FROM c WHERE ${whereClause} ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit`,
    parameters: [
      ...parameters,
      {
        name: '@offset',
        value: offset
      },
      {
        name: '@limit',
        value: limit
      }
    ]
  };
  
  // Execute both queries in parallel
  const [countResponse, goalsResponse] = await Promise.all([
    container.items.query(countQuerySpec).fetchAll(),
    container.items.query(querySpec).fetchAll()
  ]);
  
  const total = countResponse.resources[0] || 0;
  
  return {
    items: goalsResponse.resources as FitnessGoal[],
    total,
    limit,
    offset
  };
}

/**
 * Get a specific goal by ID
 * @param id Goal ID 
 * @param userId User ID
 * @returns The goal or null if not found
 */
export async function getGoalById(id: string, userId: string): Promise<FitnessGoal | null> {
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
  const container = getContainer();
  
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
    throw ApiError.internal('Failed to update goal');
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
  const container = getContainer();
  
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
  const container = getContainer();
  
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