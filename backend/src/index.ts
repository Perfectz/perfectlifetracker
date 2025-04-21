import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import compression from 'compression';
import multer, { FileFilterCallback, MulterError } from 'multer';
import { initializeCosmosDb } from './services/cosmosClient';
import { initializeBlobStorage, uploadAvatar, deleteAvatar } from './services/blobStorageService';
import * as profileService from './services/profileService';
import * as goalService from './services/goalService';

// Load environment variables
dotenv.config();

// Create Express server
const app = express();
const port = process.env.PORT || 3001;

// Environment check
const isDevelopment = process.env.NODE_ENV !== 'production';

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());

// JWT validation middleware
// For development, use a static secret; for production, use jwks-rsa
let jwtCheck;

if (isDevelopment) {
  // Use a static secret for development
  console.log('Using development JWT configuration with static secret');
  jwtCheck = jwt({
    secret: process.env.JWT_SECRET || 'dev-secret-not-for-production',
    algorithms: ['HS256']
  });
} else {
  // Use proper JWKS for production
  jwtCheck = jwt({
    secret: jwksRsa.expressJwtSecret({
      jwksUri: process.env.JWKS_URI || 'https://YOUR_TENANT.b2clogin.com/YOUR_TENANT.onmicrosoft.com/discovery/v2.0/keys',
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
    }),
    audience: process.env.AZURE_AD_B2C_API_IDENTIFIER || 'api://YOUR_API_ID',
    issuer: process.env.AZURE_AD_B2C_ISSUER || 'https://YOUR_TENANT.b2clogin.com/YOUR_TENANT.onmicrosoft.com/v2.0/',
    algorithms: ['RS256'],
  });
}

// Initialize Cosmos DB
initializeCosmosDb().catch(err => {
  console.error('Failed to initialize Cosmos DB:', err);
  // Continue app startup, will use in-memory fallback in dev mode
});

// Initialize Blob Storage
initializeBlobStorage().catch(err => {
  console.error('Failed to initialize Blob Storage:', err);
  // Continue app startup, will use mock client in dev mode
});

// Base route for health checks
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Custom request type including auth property set by JWT middleware
interface AuthRequest extends Request {
  auth: {
    sub?: string;
    oid?: string;
    [key: string]: unknown;
  };
}

// Profile routes
// Create profile
app.post('/api/profile', jwtCheck, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.auth.sub ?? authReq.auth.oid!;
    const profileData = { userId, ...req.body };
    const newProfile = await profileService.createProfile(profileData);
    res.status(201).json(newProfile);
  } catch (error) {
    next(error);
  }
});

// Get profile by ID
app.get('/api/profile/:id', jwtCheck, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await profileService.getProfileById(req.params.id);
    if (!profile) {
      res.status(404).json({ error: 'NotFound', message: 'Profile not found' });
      return;
    }
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
});

// Get current user's profile
app.get('/api/profile', jwtCheck, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.auth.sub ?? authReq.auth.oid!;
    const profile = await profileService.getProfileById(userId);
    
    if (!profile) {
      res.status(200).json(authReq.auth);
      return;
    }
    
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
});

// Update profile
app.put('/api/profile/:id', jwtCheck, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const requestedId = req.params.id;
    const authenticatedId = authReq.auth.sub ?? authReq.auth.oid!;
    
    if (requestedId !== authenticatedId) {
      res.status(403).json({ error: 'Forbidden', message: 'You can only update your own profile' });
      return;
    }
    
    const updatedProfile = await profileService.updateProfile(requestedId, req.body);
    if (!updatedProfile) {
      res.status(404).json({ error: 'NotFound', message: 'Profile not found' });
      return;
    }
    
    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
});

// Delete profile
app.delete('/api/profile/:id', jwtCheck, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const requestedId = req.params.id;
    const authenticatedId = authReq.auth.sub ?? authReq.auth.oid!;
    
    if (requestedId !== authenticatedId) {
      res.status(403).json({ error: 'Forbidden', message: 'You can only delete your own profile' });
      return;
    }
    
    const success = await profileService.deleteProfile(requestedId);
    if (!success) {
      res.status(404).json({ error: 'NotFound', message: 'Profile not found' });
      return;
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Upload avatar
app.post('/api/profile/:id/avatar', jwtCheck, upload.single('avatar'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const requestedId = req.params.id;
    const authenticatedId = authReq.auth.sub ?? authReq.auth.oid!;
    
    if (requestedId !== authenticatedId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You can only upload an avatar for your own profile'
      });
      return;
    }

    // Ensure a file was uploaded
    if (!req.file) {
      res.status(400).json({
        error: 'BadRequest',
        message: 'No avatar file uploaded'
      });
      return;
    }

    // Get the file from the request
    const imageData = req.file.buffer;
    const contentType = req.file.mimetype;

    // Upload the file to blob storage
    const avatarUrl = await uploadAvatar(requestedId, imageData, contentType);

    // Update the profile with the new avatar URL
    const updatedProfile = await profileService.updateProfile(requestedId, { 
      avatarUrl 
    });

    if (!updatedProfile) {
      res.status(404).json({ 
        error: 'NotFound', 
        message: 'Profile not found' 
      });
      return;
    }

    res.status(200).json({ 
      success: true, 
      avatarUrl,
      profile: updatedProfile
    });
  } catch (error) {
    next(error);
  }
});

// Delete avatar
app.delete('/api/profile/:id/avatar', jwtCheck, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const requestedId = req.params.id;
    const authenticatedId = authReq.auth.sub ?? authReq.auth.oid!;
    
    if (requestedId !== authenticatedId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete an avatar for your own profile'
      });
      return;
    }

    // Get the current profile to get the avatar URL
    const profile = await profileService.getProfileById(requestedId);
    
    if (!profile) {
      res.status(404).json({ 
        error: 'NotFound', 
        message: 'Profile not found' 
      });
      return;
    }
    
    if (!profile.avatarUrl) {
      res.status(404).json({
        error: 'NotFound',
        message: 'No avatar found for this profile'
      });
      return;
    }
    
    // Delete the avatar from blob storage
    const success = await deleteAvatar(profile.avatarUrl);
    
    if (!success) {
      res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to delete avatar from storage'
      });
      return;
    }
    
    // Update the profile to remove the avatar URL
    const updatedProfile = await profileService.updateProfile(requestedId, { 
      avatarUrl: undefined 
    });
    
    if (!updatedProfile) {
      res.status(404).json({ 
        error: 'NotFound', 
        message: 'Profile not found' 
      });
      return;
    }
    
    res.status(200).json({ 
      success: true, 
      profile: updatedProfile
    });
  } catch (error) {
    next(error);
  }
});

// Goals routes
// Create a new goal
app.post('/api/goals', jwtCheck, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.auth.sub ?? authReq.auth.oid!;
    const goalData = { 
      userId, 
      ...req.body,
      targetDate: req.body.targetDate ? new Date(req.body.targetDate) : new Date()
    };
    
    const newGoal = await goalService.createGoal(goalData);
    res.status(201).json(newGoal);
  } catch (error) {
    next(error);
  }
});

// Get all goals for current user
app.get('/api/goals', jwtCheck, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.auth.sub ?? authReq.auth.oid!;
    
    const goals = await goalService.getGoalsByUserId(userId);
    res.status(200).json(goals);
  } catch (error) {
    next(error);
  }
});

// Get a specific goal by ID
app.get('/api/goals/:id', jwtCheck, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.auth.sub ?? authReq.auth.oid!;
    const goalId = req.params.id;
    
    const goal = await goalService.getGoalById(goalId, userId);
    if (!goal) {
      res.status(404).json({ error: 'NotFound', message: 'Goal not found' });
      return;
    }
    
    res.status(200).json(goal);
  } catch (error) {
    next(error);
  }
});

// Update a goal
app.put('/api/goals/:id', jwtCheck, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.auth.sub ?? authReq.auth.oid!;
    const goalId = req.params.id;
    
    // Process dates if provided
    const updates = { ...req.body };
    if (updates.targetDate) {
      updates.targetDate = new Date(updates.targetDate);
    }
    
    const updatedGoal = await goalService.updateGoal(goalId, userId, updates);
    if (!updatedGoal) {
      res.status(404).json({ error: 'NotFound', message: 'Goal not found' });
      return;
    }
    
    res.status(200).json(updatedGoal);
  } catch (error) {
    next(error);
  }
});

// Delete a goal
app.delete('/api/goals/:id', jwtCheck, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.auth.sub ?? authReq.auth.oid!;
    const goalId = req.params.id;
    
    const success = await goalService.deleteGoal(goalId, userId);
    if (!success) {
      res.status(404).json({ error: 'NotFound', message: 'Goal not found' });
      return;
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Error handler
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  console.error('API Error:', err);
  
  // Format multer errors
  if (err instanceof MulterError) {
    const multerErr = err;
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        error: 'FileTooLarge',
        message: 'File too large. Maximum size is 5MB.'
      });
      return;
    }
    res.status(400).json({
      error: 'UploadError',
      message: multerErr.message
    });
    return;
  }
  
  // Send a structured error response
  const error = err as Error;
  res.status((error as any).status || 500).json({
    error: error.name || 'InternalServerError',
    message: error.message || 'An unexpected error occurred'
  });
});

// Only start the server if this module is the entry point
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
} 