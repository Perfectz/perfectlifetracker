// backend/src/routes/journals.router.ts
// Router for journal API endpoints with sentiment analysis

import express, { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import multer from 'multer';
import * as journalService from '../services/journalService';
import * as journalInsightsService from '../services/journalInsightsService';
import { uploadAttachment } from '../services/blobStorageService';
import { JournalEntryFilterOptions } from '../models/JournalEntry';
import { ApiError } from '../utils/ApiError';
import { extractUserId } from '../middleware/auth';
import { validateDate, validateOptionalDate } from '../utils/validators';
import * as searchService from '../services/searchService';

// Custom request type including auth property set by JWT middleware
interface AuthRequest extends Request {
  auth: {
    sub?: string;
    oid?: string;
    [key: string]: unknown;
  };
  userId: string; // Added for our extractUserId middleware
}

const router = express.Router();

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'ValidationError', 
      message: 'Invalid request data',
      details: errors.array() 
    });
  }
  next();
};

// Apply userId extraction to all routes
router.use(extractUserId);

// Helper function to serialize response data to ensure dates are ISO strings
function serializeResponse(data: any): any {
  // If data is null or undefined, return it as is
  if (data == null) return data;
  
  // If data is a Date, return an ISO string
  if (data instanceof Date) return data.toISOString();
  
  // If data is an array, serialize each element
  if (Array.isArray(data)) return data.map(item => serializeResponse(item));
  
  // If data is an object, serialize each property
  if (typeof data === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializeResponse(value);
    }
    return result;
  }
  
  // Otherwise, return the value as is
  return data;
}

// Helper function to send error response
function sendErrorResponse(res: Response, status: number, message: string): void {
  res.status(status).json({ error: message });
}

// Create a new journal entry with sentiment analysis
router.post('/', [
  body('content').notEmpty().withMessage('Journal content is required').isString(),
  body('contentFormat').optional().isIn(['plain', 'markdown']).withMessage('Content format must be plain or markdown'),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  body('attachments').optional().isArray().withMessage('Attachments must be an array'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    const journalData = { 
      userId, 
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : new Date()
    };
    
    const newJournal = await journalService.createJournalEntry(journalData);
    res.status(201).json(serializeResponse(newJournal));
  } catch (error) {
    next(error);
  }
});

// Get all journal entries for current user with filters and pagination
router.get('/', [
  query('startDate').optional().custom(validateOptionalDate),
  query('endDate').optional().custom(validateOptionalDate),
  query('minSentiment').optional().isFloat({ min: 0, max: 1 }),
  query('maxSentiment').optional().isFloat({ min: 0, max: 1 }),
  query('tags').optional(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('cursor').optional().isString(),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    
    // Use validated and transformed values
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    
    // Determine which pagination method to use (cursor or offset)
    const cursorValue = req.query.cursor as string | undefined;
    // Default offset to 0 to match test expectations
    const offsetValue = req.query.offset !== undefined ? Number(req.query.offset) : 0;
    
    // Only allow one pagination method at a time (prioritize cursor over offset)
    const paginationParam = cursorValue || offsetValue;
    
    // Build filter options from query parameters
    const filters: JournalEntryFilterOptions = {};
    
    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }
    
    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }
    
    if (req.query.minSentiment || req.query.maxSentiment) {
      filters.sentimentRange = {};
      
      if (req.query.minSentiment) {
        filters.sentimentRange.min = parseFloat(req.query.minSentiment as string);
      }
      
      if (req.query.maxSentiment) {
        filters.sentimentRange.max = parseFloat(req.query.maxSentiment as string);
      }
    }
    
    if (req.query.tags) {
      const tagsString = req.query.tags as string;
      filters.tags = tagsString.split(',').map(tag => tag.trim());
    }
    
    const result = await journalService.getJournalEntriesByUserId(
      userId, 
      filters, 
      limit, 
      paginationParam
    );
    
    res.status(200).json(serializeResponse(result));
  } catch (error) {
    next(error);
  }
});

// Search journal entries by text
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('startDate').optional().custom(validateOptionalDate),
  query('endDate').optional().custom(validateOptionalDate),
  query('minSentiment').optional().isFloat({ min: 0, max: 1 }),
  query('maxSentiment').optional().isFloat({ min: 0, max: 1 }),
  query('tags').optional(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('cursor').optional().isString(),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    
    // Get query parameters
    const searchQuery = req.query.q as string;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    
    // Determine which pagination method to use (cursor or offset)
    const cursorValue = req.query.cursor as string | undefined;
    // Default offset to 0 to match test expectations
    const offsetValue = req.query.offset !== undefined ? Number(req.query.offset) : 0;
    
    // Only allow one pagination method at a time (prioritize cursor over offset)
    const paginationParam = cursorValue || offsetValue;
    
    // Build filter options
    const filters: JournalEntryFilterOptions = {};
    
    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }
    
    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }
    
    if (req.query.minSentiment || req.query.maxSentiment) {
      filters.sentimentRange = {};
      
      if (req.query.minSentiment) {
        filters.sentimentRange.min = parseFloat(req.query.minSentiment as string);
      }
      
      if (req.query.maxSentiment) {
        filters.sentimentRange.max = parseFloat(req.query.maxSentiment as string);
      }
    }
    
    if (req.query.tags) {
      const tagsString = req.query.tags as string;
      filters.tags = tagsString.split(',').map(tag => tag.trim());
    }
    
    // Perform search
    const result = await journalService.searchJournalEntries(
      userId,
      searchQuery,
      filters,
      limit,
      paginationParam
    );
    
    res.status(200).json(serializeResponse(result));
  } catch (error) {
    if (error instanceof ApiError && error.status === 503) {
      sendErrorResponse(res, 503, 'Search service not available');
    } else {
      next(error);
    }
  }
});

// Upload attachment file
router.post('/attachments', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    const file = req.file;
    
    if (!file) {
      throw new ApiError('No file uploaded', 400);
    }
    
    // Check file size (additional check beyond multer)
    if (file.size > 5 * 1024 * 1024) {
      throw new ApiError('File size exceeds limit (5MB)', 400);
    }
    
    // Check file type (allow only images for now)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new ApiError('File type not allowed. Please upload an image file (JPEG, PNG, GIF, WEBP)', 400);
    }
    
    // Upload to blob storage with proper parameter order
    const attachment = await uploadAttachment(
      userId,
      file.buffer as unknown as Buffer,
      file.originalname,
      file.mimetype
    );
    
    res.status(201).json(serializeResponse(attachment));
  } catch (error) {
    next(error);
  }
});

// Get a specific journal entry by ID
router.get('/:id', [
  param('id').isString().notEmpty().withMessage('Journal ID is required'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    const journalId = req.params.id;
    
    const journal = await journalService.getJournalEntryById(journalId, userId);
    if (!journal) {
      throw ApiError.notFound('Journal entry not found');
    }
    
    res.status(200).json(serializeResponse(journal));
  } catch (error) {
    next(error);
  }
});

// Update a journal entry
router.put('/:id', [
  param('id').isString().notEmpty().withMessage('Journal ID is required'),
  body('content').optional().isString(),
  body('contentFormat').optional().isIn(['plain', 'markdown']).withMessage('Content format must be plain or markdown'),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  body('attachments').optional().isArray().withMessage('Attachments must be an array'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    const journalId = req.params.id;
    
    // Process dates if provided
    const updates = { ...req.body };
    if (updates.date) {
      updates.date = new Date(updates.date);
    }
    
    const updatedJournal = await journalService.updateJournalEntry(journalId, userId, updates);
    if (!updatedJournal) {
      throw ApiError.notFound('Journal entry not found');
    }
    
    res.status(200).json(serializeResponse(updatedJournal));
  } catch (error) {
    next(error);
  }
});

// Delete a journal entry
router.delete('/:id', [
  param('id').isString().notEmpty().withMessage('Journal ID is required'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    const journalId = req.params.id;
    
    const success = await journalService.deleteJournalEntry(journalId, userId);
    if (!success) {
      throw ApiError.notFound('Journal entry not found');
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get sentiment trends
router.get('/insights/sentiment-trends', [
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    
    // Use default date range if not provided (last 30 days)
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string)
      : new Date();
    
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    const trends = await journalInsightsService.getSentimentTrends(userId, startDate, endDate);
    res.status(200).json(serializeResponse(trends));
  } catch (error) {
    next(error);
  }
});

// Get topic analysis
router.get('/insights/topic-analysis', [
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    
    // Use default date range if not provided (last 30 days)
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string)
      : new Date();
    
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    const topics = await journalInsightsService.getTopicAnalysis(userId, startDate, endDate);
    res.status(200).json(serializeResponse(topics));
  } catch (error) {
    next(error);
  }
});

// Get mood insights and recommendations
router.get('/insights/mood-recommendations', [
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt().withMessage('Limit must be between 1 and 50'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    
    // Use default limit if not provided (10)
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const insights = await journalInsightsService.getMoodInsightsAndRecommendations(userId, limit);
    res.status(200).json(serializeResponse(insights));
  } catch (error) {
    next(error);
  }
});

// Error handler middleware
router.use((err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
  console.error('Journal router error:', err);
  
  if (err instanceof ApiError) {
    sendErrorResponse(res, err.status, err.message);
  } else {
    sendErrorResponse(res, 500, 'Internal server error');
  }
});

export default router; 