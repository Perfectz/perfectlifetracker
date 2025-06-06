/**
 * backend/src/models/FitnessModel.ts
 * Fitness model for interacting with the fitness container
 */
import { v4 as uuidv4 } from 'uuid';
import { FitnessDocument } from './types';
import { getContainer } from '../utils/cosmosClient';

export class FitnessModel {
  private container: any;

  constructor() {
    try {
      this.container = null; // Will be initialized lazily
    } catch (error) {
      console.error('Error initializing fitness container, will initialize later:', error instanceof Error ? error.message : String(error));
    }
  }

  // Initialize container if it wasn't available during construction
  private async ensureContainer() {
    if (!this.container) {
      try {
        this.container = await getContainer('fitness');
      } catch (error) {
        throw new Error(`Failed to initialize fitness container: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    return this.container;
  }

  /**
   * Create a new fitness record (workout, measurement, etc.)
   */
  async createFitnessRecord(
    userId: string, 
    data: Omit<FitnessDocument, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'date'> & { date?: string | Date | null }
  ): Promise<FitnessDocument> {
    const { date: inputDate, ...restData } = data;
    const newRecord: FitnessDocument = {
      id: uuidv4(),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      date: this.formatDate(inputDate),
      ...restData
    };
    
    if (typeof (this.container as any).items === 'function') {
      const { resource } = await (this.container as any).items().create(newRecord);
      return resource;
    } else {
      const { resource } = await (this.container as any).items.create(newRecord);
      return resource;
    }
  }
  
  /**
   * Format a date value to ISO string
   */
  private formatDate(dateValue?: string | Date | null): string {
    // Default case - no date provided
    if (!dateValue) {
      return new Date().toISOString();
    }
    
    // Date is provided as a string
    if (typeof dateValue === 'string') {
      const d = new Date(dateValue);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    }
    
    // Date is provided as a Date object
    if (isDate(dateValue)) {
      return dateValue.toISOString();
    }
    
    // Fallback default
    return new Date().toISOString();
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
    await this.ensureContainer();
    const now = new Date().toISOString();
    return this.createFitnessRecord(userId, {
      type: 'workout',
      date: workoutData.date || now,
      ...workoutData,
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
    await this.ensureContainer();
    const now = new Date().toISOString();
    return this.createFitnessRecord(userId, {
      type: 'measurement',
      date: measurementData.date || now,
      ...measurementData,
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
    await this.ensureContainer();
    const now = new Date().toISOString();
    return this.createFitnessRecord(userId, {
      type: 'goal',
      completed: false,
      date: goalData.deadline || now,
      ...goalData
    });
  }

  /**
   * Get a fitness record by ID
   */
  async getFitnessRecordById(recordId: string, userId: string): Promise<FitnessDocument | undefined> {
    try {
      await this.ensureContainer();
      if (typeof (this.container as any).item === 'function') {
        // Cosmos Container
        const { resource } = await (this.container as any).item(recordId, userId).read();
        return resource;
      } else {
        // MockContainer does not support item(), fallback to searching in items()
        const allRecords = await this.getUserFitnessRecords(userId);
        return allRecords.find(r => r.id === recordId);
      }
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
    await this.ensureContainer();
    const querySpec = {
      query: "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.date DESC",
      parameters: [
        {
          name: "@userId",
          value: userId
        }
      ]
    };
    if (typeof (this.container as any).items === 'function') {
      // MockContainer
      const { resources } = await (this.container as any).items().query(querySpec).fetchAll();
      return resources;
    } else {
      // Cosmos Container
      const { resources } = await (this.container as any).items.query(querySpec).fetchAll();
      return resources;
    }
  }

  /**
   * Get fitness records by type (workout, measurement, goal)
   */
  async getRecordsByType(userId: string, type: FitnessDocument['type']): Promise<FitnessDocument[]> {
    await this.ensureContainer();
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
    if (typeof (this.container as any).items === 'function') {
      const { resources } = await (this.container as any).items().query(querySpec).fetchAll();
      return resources;
    } else {
      const { resources } = await (this.container as any).items.query(querySpec).fetchAll();
      return resources;
    }
  }

  /**
   * Get records by date range
   */
  async getRecordsByDateRange(userId: string, startDate: string, endDate: string): Promise<FitnessDocument[]> {
    await this.ensureContainer();
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
    if (typeof (this.container as any).items === 'function') {
      const { resources } = await (this.container as any).items().query(querySpec).fetchAll();
      return resources;
    } else {
      const { resources } = await (this.container as any).items.query(querySpec).fetchAll();
      return resources;
    }
  }

  /**
   * Get the most recent measurement of a specific type
   */
  async getLatestMeasurement(userId: string, measurementType: string): Promise<FitnessDocument | undefined> {
    await this.ensureContainer();
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
    if (typeof (this.container as any).items === 'function') {
      const { resources } = await (this.container as any).items().query(querySpec).fetchAll();
      return resources[0];
    } else {
      const { resources } = await (this.container as any).items.query(querySpec).fetchAll();
      return resources[0];
    }
  }

  /**
   * Update a fitness record
   */
  async updateFitnessRecord(recordId: string, userId: string, updates: Partial<FitnessDocument>): Promise<FitnessDocument> {
    await this.ensureContainer();
    const record = await this.getFitnessRecordById(recordId, userId);
    if (!record) {
      throw new Error(`Fitness record with ID ${recordId} not found`);
    }
    const updatedRecord: FitnessDocument = {
      ...record,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    if (typeof (this.container as any).item === 'function') {
      // Cosmos Container
      const { resource } = await (this.container as any).item(recordId, userId).replace(updatedRecord);
      return resource;
    } else {
      // MockContainer fallback: remove old and add updated
      const allRecords = await this.getUserFitnessRecords(userId);
      const idx = allRecords.findIndex(r => r.id === recordId);
      if (idx !== -1) {
        allRecords[idx] = updatedRecord;
      }
      return updatedRecord;
    }
  }

  /**
   * Delete a fitness record
   */
  async deleteFitnessRecord(recordId: string, userId: string): Promise<void> {
    await this.ensureContainer();
    if (typeof (this.container as any).item === 'function') {
      await (this.container as any).item(recordId, userId).delete();
    } else {
      // MockContainer fallback: not implemented
      // Could filter out from mock data if needed
    }
  }

  async getWorkouts(userId: string) {
    await this.ensureContainer();
    // ... rest of method ...
  }

  async getMeasurements(userId: string, type?: string) {
    await this.ensureContainer();
    // ... rest of method ...
  }

  async getGoals(userId: string) {
    await this.ensureContainer();
    // ... rest of method ...
  }

  async updateGoal(userId: string, goalId: string, updates: any) {
    await this.ensureContainer();
    // ... rest of method ...
  }

  async deleteGoal(userId: string, goalId: string) {
    await this.ensureContainer();
    // ... rest of method ...
  }
}

/**
 * Helper function to check if a value is a Date object
 */
function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

// Export the class only, not an instance
export default FitnessModel;