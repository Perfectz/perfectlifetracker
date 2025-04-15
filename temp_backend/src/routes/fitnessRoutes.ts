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
      res.status(400).json({ error: 'Missing email in token' });
      return;
    }
    
    const user = await UserModel.getUserByEmail(email as string);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    req.body.userId = user.id;
    next();
  } catch (error) {
    console.error('Error extracting user ID:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all fitness records for a user
router.get('/', checkJwt, extractUserId, async (req: JWTRequest, res): Promise<void> => {
  try {
    const { userId } = req.body;
    const records = await fitnessModel.getUserFitnessRecords(userId);
    res.json(records);
  } catch (error) {
    console.error('Error fetching fitness records:', error);
    res.status(500).json({ error: 'Failed to fetch fitness records' });
  }
});

// Get fitness records by type
router.get('/type/:type', checkJwt, extractUserId, async (req: JWTRequest, res): Promise<void> => {
  try {
    const { userId } = req.body;
    const { type } = req.params;
    if (!type) {
      res.status(400).json({ error: 'Type parameter is required' });
      return;
    }
    // Only allow valid types
    if (!['workout', 'measurement', 'goal'].includes(type)) {
      res.status(400).json({ error: 'Invalid type' });
      return;
    }
    const records = await fitnessModel.getRecordsByType(userId, type as any);
    res.json(records);
  } catch (error) {
    console.error('Error fetching fitness records by type:', error);
    res.status(500).json({ error: 'Failed to fetch fitness records' });
  }
});

// Get fitness records within a date range
router.get('/daterange', checkJwt, extractUserId, async (req: JWTRequest, res): Promise<void> => {
  try {
    const { userId } = req.body;
    const { start, end } = req.query;
    if (!start || !end) {
      res.status(400).json({ error: 'Start and end dates are required' });
      return;
    }
    const records = await fitnessModel.getRecordsByDateRange(
      userId,
      String(start),
      String(end)
    );
    res.json(records);
  } catch (error) {
    console.error('Error fetching fitness records in date range:', error);
    res.status(500).json({ error: 'Failed to fetch fitness records' });
  }
});

// Get a specific fitness record
router.get('/:id', checkJwt, extractUserId, async (req: JWTRequest, res): Promise<void> => {
  try {
    const { userId } = req.body;
    const recordId = req.params.id;
    const record = await fitnessModel.getFitnessRecordById(recordId, userId);
    if (!record) {
      res.status(404).json({ error: 'Fitness record not found' });
      return;
    }
    // Ensure user can only access their own records
    if (record.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized access to record' });
      return;
    }
    res.json(record);
  } catch (error) {
    console.error('Error fetching fitness record:', error);
    res.status(500).json({ error: 'Failed to fetch fitness record' });
  }
});

// Log a workout
router.post('/workout', checkJwt, extractUserId, async (req: JWTRequest, res): Promise<void> => {
  try {
    const { userId, activity, duration, date, calories, distance, steps, notes } = req.body;
    if (!activity || !duration) {
      res.status(400).json({ error: 'Activity and duration are required' });
      return;
    }
    const workout = await fitnessModel.logWorkout(userId, {
      activity,
      duration,
      date,
      calories,
      distance,
      steps,
      notes
    });
    res.status(201).json(workout);
  } catch (error) {
    console.error('Error logging workout:', error);
    res.status(500).json({ error: 'Failed to log workout' });
  }
});

// Log a measurement
router.post('/measurement', checkJwt, extractUserId, async (req: JWTRequest, res): Promise<void> => {
  try {
    const { userId, measurementType, value, unit, date, notes } = req.body;
    if (!measurementType || value === undefined) {
      res.status(400).json({ error: 'Measurement type and value are required' });
      return;
    }
    const measurement = await fitnessModel.logMeasurement(userId, {
      measurementType,
      value,
      unit,
      date,
      notes
    });
    res.status(201).json(measurement);
  } catch (error) {
    console.error('Error logging measurement:', error);
    res.status(500).json({ error: 'Failed to log measurement' });
  }
});

// Create a fitness goal
router.post('/goal', checkJwt, extractUserId, async (req: JWTRequest, res): Promise<void> => {
  try {
    const { userId, goalType, targetValue, currentValue, deadline, notes } = req.body;
    if (!goalType || targetValue === undefined) {
      res.status(400).json({ error: 'Goal type and target value are required' });
      return;
    }
    const goal = await fitnessModel.createGoal(userId, {
      goalType,
      targetValue,
      currentValue,
      deadline,
      notes
    });
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating fitness goal:', error);
    res.status(500).json({ error: 'Failed to create fitness goal' });
  }
});

// Update a fitness record
router.put('/:id', checkJwt, extractUserId, async (req: JWTRequest, res): Promise<void> => {
  try {
    const { userId } = req.body;
    const recordId = req.params.id;
    const existingRecord = await fitnessModel.getFitnessRecordById(recordId, userId);
    if (!existingRecord) {
      res.status(404).json({ error: 'Fitness record not found' });
      return;
    }
    if (existingRecord.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to update this record' });
      return;
    }
    const { userId: _, ...updates } = req.body;
    const updatedRecord = await fitnessModel.updateFitnessRecord(recordId, userId, updates);
    res.json(updatedRecord);
  } catch (error) {
    console.error('Error updating fitness record:', error);
    res.status(500).json({ error: 'Failed to update fitness record' });
  }
});

// Delete a fitness record
router.delete('/:id', checkJwt, extractUserId, async (req: JWTRequest, res): Promise<void> => {
  try {
    const { userId } = req.body;
    const recordId = req.params.id;
    const existingRecord = await fitnessModel.getFitnessRecordById(recordId, userId);
    if (!existingRecord) {
      res.status(404).json({ error: 'Fitness record not found' });
      return;
    }
    if (existingRecord.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to delete this record' });
      return;
    }
    await fitnessModel.deleteFitnessRecord(recordId, userId);
    res.json({ message: 'Fitness record deleted successfully' });
  } catch (error) {
    console.error('Error deleting fitness record:', error);
    res.status(500).json({ error: 'Failed to delete fitness record' });
  }
});

// Get the latest measurement of a specific type
router.get('/measurements/:type/latest', checkJwt, extractUserId, async (req: JWTRequest, res): Promise<void> => {
  try {
    const { userId } = req.body;
    const { type } = req.params;
    if (!type) {
      res.status(400).json({ error: 'Measurement type is required' });
      return;
    }
    const latestMeasurement = await fitnessModel.getLatestMeasurement(userId, type);
    if (!latestMeasurement) {
      res.status(404).json({ error: `No ${type} measurements found` });
      return;
    }
    res.json(latestMeasurement);
  } catch (error) {
    console.error('Error fetching latest measurement:', error);
    res.status(500).json({ error: 'Failed to fetch latest measurement' });
  }
});

export default router; 