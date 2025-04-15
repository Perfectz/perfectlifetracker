/**
 * backend/src/utils/dbInit.ts
 * Database initialization and seeding script
 */
import { initializeCosmosDB } from './cosmosClient';
import UserModel from '../models/UserModel';
import FitnessModel from '../models/FitnessModel';
import TaskModel from '../models/TaskModel';
import bcrypt from 'bcrypt';

/**
 * Initialize the database and all containers
 */
export async function initializeDatabase() {
  console.log('Initializing Cosmos DB...');
  
  // First initialize the database and containers
  try {
    await initializeCosmosDB();
    console.log('Cosmos DB initialization complete.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
  
  // Then seed it with initial data if needed
  try {
    await seedDatabase();
    console.log('Database seeding complete.');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
  
  return true;
}

/**
 * Seed the database with sample data for development purposes
 */
async function seedDatabase() {
  console.log('Starting database seeding...');
  
  // Create admin user if not exists
  const adminEmail = 'admin@example.com';
  try {
    const existingAdmin = await UserModel.getUserByEmail(adminEmail);
    if (!existingAdmin) {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await UserModel.createUser({
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
    
    // Add more seeding if needed
    
  } catch (error) {
    console.error('Error during database seeding:', error);
    throw error;
  }
}

export default {
  initializeDatabase
}; 