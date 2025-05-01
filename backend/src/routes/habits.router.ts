// backend/src/routes/habits.router.ts
// Router for habit tracking API endpoints

import express, { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import * as habitService from '../services/habitService';
import { ApiError } from '../utils/ApiError';
import { extractUserId } from '../middleware/extractUserId';
import { HabitFrequency } from '../models/Habit';
import { z } from 'zod';

// Custom request type including auth property set by JWT middleware
interface AuthRequest extends Request {
  auth?: {
    sub?: string;
    oid?: string;
    [key: string]: unknown;
  };
  userId: string; // Added by extractUserId middleware
}

// Interface for validated request body
interface ValidatedRequest<T> extends Request {
  validatedBody: T;
  userId: string;
}

const router = express.Router();

// Validation schemas
const habitCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  frequency: z.nativeEnum(HabitFrequency, {
    errorMap: () => ({ message: `Frequency must be one of: ${Object.values(HabitFrequency).join(', ')}` })
  }),
  description: z.string().optional(),
  streak: z.number().int().nonnegative().optional()
});

const habitUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  frequency: z.nativeEnum(HabitFrequency, {
    errorMap: () => ({ message: `Frequency must be one of: ${Object.values(HabitFrequency).join(', ')}` })
  }).optional(),
  description: z.string().optional(),
  streak: z.number().int().nonnegative().optional()
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10)
});

type PaginationParams = z.infer<typeof paginationSchema>;

const idValidation = [
  param('id').isString().notEmpty().withMessage('Habit ID is required'),
];

// Validation middleware
const validateRequest = (schema: z.ZodType<any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = schema.parse(req.body);
    (req as any).validatedBody = result;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: formattedErrors 
      });
    }
    next(error);
  }
};

// Apply userId extraction to all routes
router.use(extractUserId);

// GET /habits - Get all habits for the user with pagination
router.get('/', async (req: Request & { userId: string }, res: Response, next: NextFunction) => {
  try {
    const { userId } = req;
    
    // Validate and extract pagination parameters
    const { page, limit } = paginationSchema.parse({ 
      page: req.query.page, 
      limit: req.query.limit 
    });
    
    // Calculate offset from page and limit
    const offset = (page - 1) * limit;
    
    const result = await habitService.getHabitsByUserId(userId, limit, offset);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /habits/:id - Get a specific habit by ID
router.get('/:id', async (req: Request & { userId: string }, res: Response, next: NextFunction) => {
  try {
    const { userId } = req;
    const { id } = req.params;
    
    const habit = await habitService.getHabitById(id, userId);
    
    if (!habit) {
      return res.status(404).json({ message: `Habit with ID ${id} not found` });
    }
    
    res.json(habit);
  } catch (error) {
    next(error);
  }
});

// POST /habits - Create a new habit
router.post('/', validateRequest(habitCreateSchema), async (req: ValidatedRequest<z.infer<typeof habitCreateSchema>>, res: Response, next: NextFunction) => {
  try {
    const { userId } = req;
    const habitData = {
      ...req.validatedBody,
      userId
    };
    
    const newHabit = await habitService.createHabit(habitData);
    res.status(201).json(newHabit);
  } catch (error) {
    next(error);
  }
});

// PUT /habits/:id - Update an existing habit
router.put('/:id', validateRequest(habitUpdateSchema), async (req: ValidatedRequest<z.infer<typeof habitUpdateSchema>>, res: Response, next: NextFunction) => {
  try {
    const { userId } = req;
    const { id } = req.params;
    
    // Check if the habit exists and belongs to the user
    const existingHabit = await habitService.getHabitById(id, userId);
    
    if (!existingHabit) {
      return res.status(404).json({ message: `Habit with ID ${id} not found` });
    }
    
    const updatedHabit = await habitService.updateHabit(id, userId, req.validatedBody);
    res.json(updatedHabit);
  } catch (error) {
    next(error);
  }
});

// DELETE /habits/:id - Delete a habit
router.delete('/:id', async (req: Request & { userId: string }, res: Response, next: NextFunction) => {
  try {
    const { userId } = req;
    const { id } = req.params;
    
    // Check if the habit exists and belongs to the user
    const existingHabit = await habitService.getHabitById(id, userId);
    
    if (!existingHabit) {
      return res.status(404).json({ message: `Habit with ID ${id} not found` });
    }
    
    await habitService.deleteHabit(id, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router; 