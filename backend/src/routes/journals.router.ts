// backend/src/routes/journals.router.ts
// Router for journal API endpoints with sentiment analysis

import express, { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import * as journalService from '../services/journalService';
import { JournalEntryFilterOptions } from '../models/JournalEntry';
import { ApiError } from '../utils/ApiError';

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

// Extract userId from JWT token with development fallback
const extractUserId = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  
  // Development fallback - if auth is missing or incomplete, use a default dev user
  if (!authReq.auth || (!authReq.auth.sub && !authReq.auth.oid)) {
    console.warn('⚠️ Authentication missing. Using dev-user-123 for development.');
    authReq.userId = 'dev-user-123';
  } else {
    // Normal auth flow
    if (authReq.auth.sub) {
      authReq.userId = authReq.auth.sub;
    } else {
      authReq.userId = authReq.auth.oid as string;
    }
  }
  
  next();
};

// Apply userId extraction to all routes
router.use(extractUserId);

// Create a new journal entry with sentiment analysis
router.post('/', [
  body('content').notEmpty().withMessage('Journal content is required').isString(),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
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
    res.status(201).json(newJournal);
  } catch (error) {
    next(error);
  }
});

// Get all journal entries for current user with filters and pagination
router.get('/', [
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  query('minSentiment').optional().isFloat({ min: 0, max: 1 }).withMessage('Minimum sentiment must be between 0 and 1'),
  query('maxSentiment').optional().isFloat({ min: 0, max: 1 }).withMessage('Maximum sentiment must be between 0 and 1'),
  query('tags').optional().isString().withMessage('Tags should be a comma-separated list'),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
    .withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).toInt()
    .withMessage('Offset must be a non-negative integer'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    
    // Use validated and transformed values
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    
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
      offset
    );
    
    res.status(200).json(result);
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
    
    res.status(200).json(journal);
  } catch (error) {
    next(error);
  }
});

// Update a journal entry
router.put('/:id', [
  param('id').isString().notEmpty().withMessage('Journal ID is required'),
  body('content').optional().isString(),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
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
    
    res.status(200).json(updatedJournal);
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

export default router; 