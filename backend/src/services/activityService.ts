// backend/src/services/activityService.ts
// Service for fitness activity CRUD operations

import { v4 as uuidv4 } from 'uuid';
import { getActivitiesContainer } from './cosmosClient';
import { Activity, ActivityCreateDTO, ActivityUpdateDTO } from '../models/Activity';
import { ApiError } from '../utils/ApiError';

/**
 * Get container with fallback to in-memory store
 * @returns The container or in-memory store functions
 */
function getContainer() {
  try {
    const container = getActivitiesContainer();
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
 * Create a new activity
 * @param activityData Activity creation data
 * @returns The created activity
 */
export async function createActivity(activityData: ActivityCreateDTO): Promise<Activity> {
  const container = getContainer();
  
  const now = new Date();
  const activity: Activity = {
    id: uuidv4(), // Generate a unique ID
    userId: activityData.userId,
    type: activityData.type,
    duration: activityData.duration,
    calories: activityData.calories,
    date: activityData.date || now,
    notes: activityData.notes,
    createdAt: now,
    updatedAt: now
  };
  
  const { resource } = await container.items.create(activity);
  // Handle potential undefined return value
  if (!resource) {
    throw ApiError.internal('Failed to create activity');
  }
  return resource as unknown as Activity;
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
 * Filter options for activities
 */
export interface ActivityFilterOptions {
  type?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Get activities for a specific user with pagination and filters
 * @param userId User ID
 * @param filters Optional filters for type and date range
 * @param limit Maximum number of activities to return (default: 50)
 * @param offset Number of activities to skip (default: 0)
 * @returns Paginated activities result
 */
export async function getActivitiesByUserId(
  userId: string,
  filters: ActivityFilterOptions = {},
  limit = 50,
  offset = 0
): Promise<PaginatedResult<Activity>> {
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
  
  // Start building the queries
  let countQuery = 'SELECT VALUE COUNT(1) FROM c WHERE c.userId = @userId';
  let activitiesQuery = 'SELECT * FROM c WHERE c.userId = @userId';
  
  // Apply type filter if provided
  if (filters.type) {
    countQuery += ' AND c.type = @type';
    activitiesQuery += ' AND c.type = @type';
    parameters.push({
      name: '@type',
      value: filters.type
    });
  }
  
  // Apply start date filter if provided
  if (filters.startDate) {
    countQuery += ' AND c.date >= @startDate';
    activitiesQuery += ' AND c.date >= @startDate';
    parameters.push({
      name: '@startDate',
      value: filters.startDate.toISOString()
    });
  }
  
  // Apply end date filter if provided
  if (filters.endDate) {
    countQuery += ' AND c.date <= @endDate';
    activitiesQuery += ' AND c.date <= @endDate';
    parameters.push({
      name: '@endDate',
      value: filters.endDate.toISOString()
    });
  }
  
  // Complete the activities query with sorting and pagination
  activitiesQuery += ' ORDER BY c.date DESC OFFSET @offset LIMIT @limit';
  
  // Create query specifications
  const countQuerySpec = {
    query: countQuery,
    parameters
  };
  
  const activitiesQuerySpec = {
    query: activitiesQuery,
    parameters
  };
  
  // Execute both queries in parallel
  const [countResponse, activitiesResponse] = await Promise.all([
    container.items.query(countQuerySpec).fetchAll(),
    container.items.query(activitiesQuerySpec).fetchAll()
  ]);
  
  const total = countResponse.resources[0] || 0;
  
  return {
    items: activitiesResponse.resources as Activity[],
    total,
    limit,
    offset
  };
}

/**
 * Get an activity by its ID and user ID (for security)
 * @param id Activity ID
 * @param userId User ID (for permission check)
 * @returns The activity or null if not found
 */
export async function getActivityById(id: string, userId: string): Promise<Activity | null> {
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
  
  return resources[0] as Activity;
}

/**
 * Update an existing activity
 * @param id Activity ID
 * @param userId User ID (for permission check)
 * @param updates Updates to apply
 * @returns The updated activity or null if not found
 */
export async function updateActivity(
  id: string, 
  userId: string, 
  updates: ActivityUpdateDTO
): Promise<Activity | null> {
  const container = getContainer();
  
  // First, get the existing activity
  const existing = await getActivityById(id, userId);
  
  if (!existing) {
    return null;
  }
  
  // Create updated activity
  const updatedActivity: Activity = {
    ...existing,
    ...updates,
    updatedAt: new Date()
  };
  
  // Update in database
  const { resource } = await container.items.upsert(updatedActivity);
  
  return resource as unknown as Activity;
}

/**
 * Delete an activity
 * @param id Activity ID
 * @param userId User ID (for permission check)
 * @returns True if deleted, false if not found
 */
export async function deleteActivity(id: string, userId: string): Promise<boolean> {
  const container = getContainer();
  
  try {
    await container.item(id, userId).delete();
    return true;
  } catch (error) {
    // If the error is a 404, the activity doesn't exist
    if ((error as any)?.code === 404 || (error as Error)?.message?.includes('not found')) {
      return false;
    }
    // Otherwise, rethrow the error
    throw error;
  }
} 