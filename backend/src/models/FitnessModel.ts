/**
 * backend/src/models/FitnessModel.ts
 * Fitness model for interacting with the fitness container
 */
import { v4 as uuidv4 } from 'uuid';
import { FitnessDocument } from './types';
import { getContainer } from '../utils/cosmosClient';

export class FitnessModel {
  private container = getContainer('fitness');

  /**
   * Create a new fitness record (workout, measurement, etc.)
   */
  async createFitnessRecord(userId: string, data: Omit<FitnessDocument, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<FitnessDocument> {
    const now = new Date().toISOString();
    
    const newRecord: FitnessDocument = {
      id: uuidv4(),
      userId,
      createdAt: now,
      updatedAt: now,
      date: data.date || now,
      ...data
    };

    const { resource } = await this.container.items.create<FitnessDocument>(newRecord);
    return resource;
  }

  /**
   * Create a workout record
   */
  async logWorkout(userId: string, workoutData: {
    activity: string;
    duration: number;
    date?: string;
    calories?: number;
    distance?: number;
    steps?: number;
    notes?: string;
  }): Promise<FitnessDocument> {
    return this.createFitnessRecord(userId, {
      type: 'workout',
      ...workoutData
    });
  }

  /**
   * Log a measurement (weight, body fat, etc.)
   */
  async logMeasurement(userId: string, measurementData: {
    measurementType: string;
    value: number;
    unit: string;
    date?: string;
    notes?: string;
  }): Promise<FitnessDocument> {
    return this.createFitnessRecord(userId, {
      type: 'measurement',
      ...measurementData
    });
  }

  /**
   * Create a fitness goal
   */
  async createGoal(userId: string, goalData: {
    goalType: string;
    targetValue: number;
    currentValue?: number;
    deadline?: string;
    notes?: string;
  }): Promise<FitnessDocument> {
    return this.createFitnessRecord(userId, {
      type: 'goal',
      completed: false,
      ...goalData
    });
  }

  /**
   * Get a fitness record by ID
   */
  async getFitnessRecordById(recordId: string, userId: string): Promise<FitnessDocument | undefined> {
    try {
      const { resource } = await this.container.item(recordId, userId).read<FitnessDocument>();
      return resource;
    } catch (error) {
      if ((error as any).code === 404) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Get all fitness records for a user
   */
  async getUserFitnessRecords(userId: string): Promise<FitnessDocument[]> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.date DESC",
      parameters: [
        {
          name: "@userId",
          value: userId
        }
      ]
    };

    const { resources } = await this.container.items.query<FitnessDocument>(querySpec).fetchAll();
    return resources;
  }

  /**
   * Get fitness records by type (workout, measurement, goal)
   */
  async getRecordsByType(userId: string, type: FitnessDocument['type']): Promise<FitnessDocument[]> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.userId = @userId AND c.type = @type ORDER BY c.date DESC",
      parameters: [
        {
          name: "@userId",
          value: userId
        },
        {
          name: "@type",
          value: type
        }
      ]
    };

    const { resources } = await this.container.items.query<FitnessDocument>(querySpec).fetchAll();
    return resources;
  }

  /**
   * Get records by date range
   */
  async getRecordsByDateRange(userId: string, startDate: string, endDate: string): Promise<FitnessDocument[]> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.userId = @userId AND c.date BETWEEN @startDate AND @endDate ORDER BY c.date DESC",
      parameters: [
        {
          name: "@userId",
          value: userId
        },
        {
          name: "@startDate",
          value: startDate
        },
        {
          name: "@endDate",
          value: endDate
        }
      ]
    };

    const { resources } = await this.container.items.query<FitnessDocument>(querySpec).fetchAll();
    return resources;
  }

  /**
   * Get the most recent measurement of a specific type
   */
  async getLatestMeasurement(userId: string, measurementType: string): Promise<FitnessDocument | undefined> {
    const querySpec = {
      query: "SELECT TOP 1 * FROM c WHERE c.userId = @userId AND c.type = 'measurement' AND c.measurementType = @measurementType ORDER BY c.date DESC",
      parameters: [
        {
          name: "@userId",
          value: userId
        },
        {
          name: "@measurementType",
          value: measurementType
        }
      ]
    };

    const { resources } = await this.container.items.query<FitnessDocument>(querySpec).fetchAll();
    return resources[0];
  }

  /**
   * Update a fitness record
   */
  async updateFitnessRecord(recordId: string, userId: string, updates: Partial<FitnessDocument>): Promise<FitnessDocument> {
    const record = await this.getFitnessRecordById(recordId, userId);
    if (!record) {
      throw new Error(`Fitness record with ID ${recordId} not found`);
    }

    const updatedRecord: FitnessDocument = {
      ...record,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const { resource } = await this.container.item(recordId, userId).replace<FitnessDocument>(updatedRecord);
    return resource;
  }

  /**
   * Delete a fitness record
   */
  async deleteFitnessRecord(recordId: string, userId: string): Promise<void> {
    await this.container.item(recordId, userId).delete();
  }
} 