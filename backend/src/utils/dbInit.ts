/**
 * backend/src/utils/dbInit.ts
 * Database initialization and seeding script
 */
import { initializeCosmosDB, getContainer } from './cosmosClient';
import { UserModel } from '../models/UserModel';
import { TaskModel } from '../models/TaskModel';
import { FitnessModel } from '../models/FitnessModel';
import { v4 as uuidv4 } from 'uuid';

/**
 * Initialize the database and all containers
 */
export async function initializeDatabase() {
  try {
    // Initialize Cosmos DB client and create containers if they don't exist
    console.log('Initializing Cosmos DB...');
    await initializeCosmosDB();
    console.log('Cosmos DB initialization complete.');
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Seed the database with sample data for development purposes
 */
export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Create models to interact with containers
    const userModel = new UserModel();
    const taskModel = new TaskModel();
    const fitnessModel = new FitnessModel();
    
    // Check if database is already seeded by looking for demo user
    const existingUser = await userModel.getUserByEmail('demo@perfectlifetracker.com');
    if (existingUser) {
      console.log('Database already seeded (demo user exists). Skipping seeding.');
      return true;
    }
    
    // Create demo user
    console.log('Creating demo user...');
    const demoUser = await userModel.createUser({
      userId: uuidv4(),
      email: 'demo@perfectlifetracker.com',
      displayName: 'Demo User',
      preferences: {
        theme: 'light',
        notifications: true,
        weekStartsOn: 1 // Monday
      }
    });
    
    const userId = demoUser.id;
    console.log(`Demo user created with ID: ${userId}`);
    
    // Create sample tasks
    console.log('Creating sample tasks...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    await taskModel.createTask(userId, {
      title: 'Complete app onboarding',
      description: 'Go through the Perfect LifeTracker Pro onboarding process',
      status: 'in-progress',
      priority: 'high',
      dueDate: today.toISOString()
    });
    
    await taskModel.createTask(userId, {
      title: 'Set up fitness goals',
      description: 'Define initial fitness goals in the app',
      status: 'not-started',
      priority: 'medium',
      dueDate: tomorrow.toISOString(),
      tags: ['fitness', 'setup']
    });
    
    await taskModel.createTask(userId, {
      title: 'Plan weekly meal prep',
      description: 'Organize groceries and meal prep for the week',
      status: 'not-started',
      priority: 'medium',
      dueDate: nextWeek.toISOString(),
      tags: ['health', 'planning']
    });
    
    // Create sample fitness data
    console.log('Creating sample fitness data...');
    
    // Sample workout
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    await fitnessModel.logWorkout(userId, {
      activity: 'Running',
      duration: 30,
      distance: 5,
      calories: 320,
      date: yesterday.toISOString(),
      notes: 'Morning run in the park'
    });
    
    // Sample measurement
    await fitnessModel.logMeasurement(userId, {
      measurementType: 'weight',
      value: 70.5,
      unit: 'kg',
      date: yesterday.toISOString()
    });
    
    // Sample goal
    const twoMonthsFromNow = new Date(today);
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
    
    await fitnessModel.createGoal(userId, {
      goalType: 'weight',
      targetValue: 65,
      currentValue: 70.5,
      deadline: twoMonthsFromNow.toISOString(),
      notes: 'Target weight goal'
    });
    
    console.log('Database seeding complete.');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
} 