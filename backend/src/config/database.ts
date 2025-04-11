/**
 * backend/src/config/database.ts
 * Database configuration and connection
 */
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/perfectltp';
const client = new MongoClient(MONGODB_URI);

// Database connection
let db: any;

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db();
    
    // Define database collections
    db = {
      users: database.collection('users'),
      projects: database.collection('projects'),
      tasks: database.collection('tasks'),
      comments: database.collection('comments'),
      notifications: database.collection('notifications'),
      files: database.collection('files')
    };
    
    // Create indexes
    await createIndexes();
    
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

async function createIndexes() {
  try {
    // Users collection indexes
    await db.users.createIndex({ email: 1 }, { unique: true });
    await db.users.createIndex({ username: 1 }, { unique: true });
    
    // Projects collection indexes
    await db.projects.createIndex({ id: 1 }, { unique: true });
    await db.projects.createIndex({ ownerId: 1 });
    await db.projects.createIndex({ 'members.userId': 1 });
    await db.projects.createIndex({ status: 1 });
    
    // Tasks collection indexes
    await db.tasks.createIndex({ id: 1 }, { unique: true });
    await db.tasks.createIndex({ projectId: 1 });
    await db.tasks.createIndex({ assigneeId: 1 });
    await db.tasks.createIndex({ status: 1 });
    await db.tasks.createIndex({ dueDate: 1 });
    
    // Files collection indexes
    await db.files.createIndex({ id: 1 }, { unique: true });
    await db.files.createIndex({ userId: 1 });
    await db.files.createIndex({ relatedEntityId: 1 });
    await db.files.createIndex({ category: 1 });
    await db.files.createIndex({ blobName: 1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating database indexes:', error);
  }
}

// Initialize connection
connectToDatabase();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

export default db; 