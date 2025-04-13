/**
 * backend/src/routes/fitnessRoutes.ts
 * API routes for fitness tracking and health data management
 */
import express from 'express';
import { expressjwt, Request as JWTRequest } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import UserModel from '../models/UserModel';
import { FitnessModel } from '../models/FitnessModel';

const router = express.Router();
const fitnessModel = new FitnessModel();

// JWT validation middleware
const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AZURE_AUTHORITY}/discovery/v2.0/keys`
  }),
  audience: process.env.AZURE_CLIENT_ID,
  issuer: process.env.AZURE_AUTHORITY,
  algorithms: ['RS256']
});

// Middleware to extract user ID from token
const extractUserId = async (req: JWTRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const email = req.auth?.email || req.auth?.preferred_username;
    
    if (!email) {
      return res.status(400).json({ error: 'Missing email in token' });
    }
    
    const user = await UserModel.getUserByEmail(email as string);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    req.body.userId = user.id;
    next();
  } catch (error) {
    console.error('Error extracting user ID:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all fitness records for a user
router.get('/', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId } = req.body;
    const records = await fitnessModel.getAllRecords(userId);
    res.json(records);
  } catch (error) {
    console.error('Error fetching fitness records:', error);
    res.status(500).json({ error: 'Failed to fetch fitness records' });
  }
});

// Get fitness records by type
router.get('/type/:type', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId } = req.body;
    const { type } = req.params;
    
    if (!type) {
      return res.status(400).json({ error: 'Type parameter is required' });
    }
    
    const records = await fitnessModel.getRecordsByType(userId, type);
    res.json(records);
  } catch (error) {
    console.error('Error fetching fitness records by type:', error);
    res.status(500).json({ error: 'Failed to fetch fitness records' });
  }
});

// Get fitness records within a date range
router.get('/daterange', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId } = req.body;
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }
    
    const records = await fitnessModel.getRecordsInDateRange(
      userId,
      new Date(start as string),
      new Date(end as string)
    );
    
    res.json(records);
  } catch (error) {
    console.error('Error fetching fitness records in date range:', error);
    res.status(500).json({ error: 'Failed to fetch fitness records' });
  }
});

// Get a specific fitness record
router.get('/:id', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId } = req.body;
    const recordId = req.params.id;
    
    const record = await fitnessModel.getRecordById(recordId);
    
    if (!record) {
      return res.status(404).json({ error: 'Fitness record not found' });
    }
    
    // Ensure user can only access their own records
    if (record.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to record' });
    }
    
    res.json(record);
  } catch (error) {
    console.error('Error fetching fitness record:', error);
    res.status(500).json({ error: 'Failed to fetch fitness record' });
  }
});

// Log a workout
router.post('/workout', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { 
      userId,
      workoutType,
      duration,
      intensity,
      caloriesBurned,
      notes,
      date
    } = req.body;
    
    if (!workoutType || !duration) {
      return res.status(400).json({ error: 'Workout type and duration are required' });
    }
    
    const workout = await fitnessModel.createRecord({
      userId,
      type: 'workout',
      subType: workoutType,
      date: date ? new Date(date) : new Date(),
      duration,
      intensity,
      caloriesBurned,
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.status(201).json(workout);
  } catch (error) {
    console.error('Error logging workout:', error);
    res.status(500).json({ error: 'Failed to log workout' });
  }
});

// Log a measurement
router.post('/measurement', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { 
      userId,
      measurementType,
      value,
      unit,
      notes,
      date
    } = req.body;
    
    if (!measurementType || value === undefined) {
      return res.status(400).json({ error: 'Measurement type and value are required' });
    }
    
    const measurement = await fitnessModel.createRecord({
      userId,
      type: 'measurement',
      subType: measurementType,
      date: date ? new Date(date) : new Date(),
      value,
      unit,
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.status(201).json(measurement);
  } catch (error) {
    console.error('Error logging measurement:', error);
    res.status(500).json({ error: 'Failed to log measurement' });
  }
});

// Create a fitness goal
router.post('/goal', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { 
      userId,
      goalType,
      targetValue,
      targetDate,
      description,
      unit,
      status
    } = req.body;
    
    if (!goalType || targetValue === undefined) {
      return res.status(400).json({ error: 'Goal type and target value are required' });
    }
    
    const goal = await fitnessModel.createRecord({
      userId,
      type: 'goal',
      subType: goalType,
      targetValue,
      targetDate: targetDate ? new Date(targetDate) : null,
      description,
      unit,
      status: status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating fitness goal:', error);
    res.status(500).json({ error: 'Failed to create fitness goal' });
  }
});

// Update a fitness record
router.put('/:id', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId } = req.body;
    const recordId = req.params.id;
    
    // Get existing record
    const existingRecord = await fitnessModel.getRecordById(recordId);
    
    if (!existingRecord) {
      return res.status(404).json({ error: 'Fitness record not found' });
    }
    
    // Ensure user can only update their own records
    if (existingRecord.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this record' });
    }
    
    // Remove userId from updates to prevent owner change
    const { userId: _, ...updates } = req.body;
    
    // Add updatedAt timestamp
    const recordUpdates = {
      ...updates,
      updatedAt: new Date()
    };
    
    // Handle date conversion if dates are present
    if (updates.date) {
      recordUpdates.date = new Date(updates.date);
    }
    
    if (updates.targetDate) {
      recordUpdates.targetDate = new Date(updates.targetDate);
    }
    
    const updatedRecord = await fitnessModel.updateRecord(recordId, recordUpdates);
    
    res.json(updatedRecord);
  } catch (error) {
    console.error('Error updating fitness record:', error);
    res.status(500).json({ error: 'Failed to update fitness record' });
  }
});

// Delete a fitness record
router.delete('/:id', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId } = req.body;
    const recordId = req.params.id;
    
    // Get existing record
    const existingRecord = await fitnessModel.getRecordById(recordId);
    
    if (!existingRecord) {
      return res.status(404).json({ error: 'Fitness record not found' });
    }
    
    // Ensure user can only delete their own records
    if (existingRecord.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this record' });
    }
    
    await fitnessModel.deleteRecord(recordId);
    
    res.json({ message: 'Fitness record deleted successfully' });
  } catch (error) {
    console.error('Error deleting fitness record:', error);
    res.status(500).json({ error: 'Failed to delete fitness record' });
  }
});

// Get the latest measurement of a specific type
router.get('/measurements/:type/latest', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId } = req.body;
    const { type } = req.params;
    
    if (!type) {
      return res.status(400).json({ error: 'Measurement type is required' });
    }
    
    const latestMeasurement = await fitnessModel.getLatestMeasurement(userId, type);
    
    if (!latestMeasurement) {
      return res.status(404).json({ error: `No ${type} measurements found` });
    }
    
    res.json(latestMeasurement);
  } catch (error) {
    console.error('Error fetching latest measurement:', error);
    res.status(500).json({ error: 'Failed to fetch latest measurement' });
  }
});

export default router; 