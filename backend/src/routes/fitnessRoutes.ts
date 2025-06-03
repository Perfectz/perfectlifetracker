/**
 * backend/src/routes/fitnessRoutes.ts
 * API routes for fitness tracking and health data management
 */
import express from 'express';
import { expressjwt, Request as JWTRequest } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import multer from 'multer';
import UserModel from '../models/UserModel';
import { FitnessModel } from '../models/FitnessModel';
import { analyzeFoodImage, FoodAnalysisResult } from '../services/openaiService';

const router = express.Router();
const fitnessModel = new FitnessModel();

// Configure multer for image uploads (memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

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
    if (!['workout', 'measurement', 'goal', 'nutrition'].includes(type)) {
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

// Add dedicated weight entry endpoints
// Get all weight measurements for a user
router.get('/weight', checkJwt, extractUserId, async (req: JWTRequest, res): Promise<void> => {
  try {
    const { userId } = req.body;
    // Fetch all measurement records then filter for weight
    const records = await fitnessModel.getRecordsByType(userId, 'measurement');
    const weightRecords = records.filter(r => r.measurementType === 'weight');
    res.json(weightRecords);
  } catch (error) {
    console.error('Error fetching weight records:', error);
    res.status(500).json({ error: 'Failed to fetch weight records' });
  }
});

// Log a weight measurement (upsert for a given date)
router.post('/weight', checkJwt, extractUserId, async (req: JWTRequest, res): Promise<void> => {
  try {
    const { userId, weight, date } = req.body;
    if (weight === undefined) {
      res.status(400).json({ error: 'Weight is required' });
      return;
    }
    const measurement = await fitnessModel.logMeasurement(userId, {
      measurementType: 'weight',
      value: weight,
      unit: 'lbs',
      date,
    });
    res.status(201).json(measurement);
  } catch (error) {
    console.error('Error logging weight measurement:', error);
    res.status(500).json({ error: 'Failed to log weight measurement' });
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

// MEAL TRACKING ENDPOINTS

// Get all nutrition/meal records for a user
router.get('/meals', checkJwt, extractUserId, async (req: JWTRequest, res): Promise<void> => {
  try {
    const { userId } = req.body;
    const { date } = req.query;
    
    let records = await fitnessModel.getRecordsByType(userId, 'nutrition');
    
    // Filter by date if provided
    if (date) {
      const targetDate = new Date(date as string).toDateString();
      records = records.filter(r => new Date(r.date).toDateString() === targetDate);
    }
    
    res.json(records);
  } catch (error) {
    console.error('Error fetching meal records:', error);
    res.status(500).json({ error: 'Failed to fetch meal records' });
  }
});

// Log a meal manually
router.post('/meals', checkJwt, extractUserId, async (req: JWTRequest, res): Promise<void> => {
  try {
    const { 
      userId, 
      foodName, 
      mealType, 
      calories, 
      servingSize, 
      servingUnit,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      brand,
      date,
      notes 
    } = req.body;
    
    if (!foodName || !calories) {
      res.status(400).json({ error: 'Food name and calories are required' });
      return;
    }
    
    const nutritionRecord = await fitnessModel.createFitnessRecord(userId, {
      type: 'nutrition',
      date: date || new Date().toISOString(),
      foodName,
      mealType: mealType || 'snack',
      totalCalories: calories,
      servingSize: servingSize || 1,
      servingUnit: servingUnit || 'serving',
      brand,
      macros: {
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0,
        fiber,
        sugar
      },
      analysisMethod: 'manual',
      notes
    });
    
    res.status(201).json(nutritionRecord);
  } catch (error) {
    console.error('Error logging meal:', error);
    res.status(500).json({ error: 'Failed to log meal' });
  }
});

// Analyze food image using AI
router.post('/meals/analyze-image', checkJwt, extractUserId, upload.single('image'), async (req: JWTRequest, res): Promise<void> => {
  try {
    const { userId } = req.body;
    const imageFile = req.file;
    
    if (!imageFile) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    // Check if OpenAI is configured before attempting analysis
    const { isOpenAIConfigured } = await import('../services/openaiService');
    if (!isOpenAIConfigured()) {
      res.status(503).json({ 
        error: 'AI analysis service not configured. Please contact administrator.',
        fallback: true
      });
      return;
    }
    
    // Validate image file size (additional check)
    if (imageFile.size > 10 * 1024 * 1024) {
      res.status(400).json({ error: 'Image file too large. Maximum size is 10MB.' });
      return;
    }
    
    // Convert image to base64
    const imageBase64 = imageFile.buffer.toString('base64');
    
    // Analyze with OpenAI Vision
    const analysis: FoodAnalysisResult = await analyzeFoodImage(imageBase64);
    
    res.json({
      success: true,
      analysis,
      message: `Food analysis completed with ${Math.round(analysis.confidence * 100)}% confidence`
    });
  } catch (error) {
    console.error('Error analyzing food image:', error);
    
    // Check if it's an OpenAI configuration error
    if (error instanceof Error && error.message.includes('OpenAI API not configured')) {
      res.status(503).json({ 
        error: 'AI analysis service temporarily unavailable',
        fallback: true 
      });
      return;
    }
    
    res.status(500).json({ 
      error: 'Failed to analyze food image',
      fallback: true
    });
  }
});

// Log a meal from AI analysis
router.post('/meals/from-analysis', checkJwt, extractUserId, async (req: JWTRequest, res): Promise<void> => {
  try {
    const { 
      userId, 
      analysis, 
      mealType, 
      date,
      imageUrl,
      notes 
    } = req.body;
    
    if (!analysis || !analysis.foodName) {
      res.status(400).json({ error: 'Food analysis data is required' });
      return;
    }
    
    const nutritionRecord = await fitnessModel.createFitnessRecord(userId, {
      type: 'nutrition',
      date: date || new Date().toISOString(),
      foodName: analysis.foodName,
      brand: analysis.brand,
      mealType: mealType || 'snack',
      totalCalories: analysis.estimatedCalories,
      servingSize: analysis.servingSize,
      servingUnit: analysis.servingUnit,
      macros: analysis.macros,
      analysisMethod: 'ai_vision',
      confidence: analysis.confidence,
      imageUrl,
      notes: notes || analysis.description
    });
    
    res.status(201).json(nutritionRecord);
  } catch (error) {
    console.error('Error logging meal from analysis:', error);
    res.status(500).json({ error: 'Failed to log meal from analysis' });
  }
});

// Get daily nutrition summary
router.get('/meals/daily-summary', checkJwt, extractUserId, async (req: JWTRequest, res): Promise<void> => {
  try {
    const { userId } = req.body;
    const { date } = req.query;
    
    const targetDate = date ? new Date(date as string) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const records = await fitnessModel.getRecordsByDateRange(
      userId, 
      startOfDay.toISOString(), 
      endOfDay.toISOString()
    );
    
    const nutritionRecords = records.filter(r => r.type === 'nutrition');
    
    const summary = {
      date: targetDate.toISOString().split('T')[0],
      totalCalories: nutritionRecords.reduce((sum, record) => sum + (record.totalCalories || 0), 0),
      totalProtein: nutritionRecords.reduce((sum, record) => sum + (record.macros?.protein || 0), 0),
      totalCarbs: nutritionRecords.reduce((sum, record) => sum + (record.macros?.carbs || 0), 0),
      totalFat: nutritionRecords.reduce((sum, record) => sum + (record.macros?.fat || 0), 0),
      mealCount: nutritionRecords.length,
      mealsByType: {
        breakfast: nutritionRecords.filter(r => r.mealType === 'breakfast').length,
        lunch: nutritionRecords.filter(r => r.mealType === 'lunch').length,
        dinner: nutritionRecords.filter(r => r.mealType === 'dinner').length,
        snack: nutritionRecords.filter(r => r.mealType === 'snack').length,
      },
      meals: nutritionRecords
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching daily nutrition summary:', error);
    res.status(500).json({ error: 'Failed to fetch daily nutrition summary' });
  }
});

export default router; 