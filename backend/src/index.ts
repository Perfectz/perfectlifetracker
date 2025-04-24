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
import goalsRouter from './routes/goals.router';
import activitiesRouter from './routes/activities.router';
import { ApiError } from './utils/ApiError';

// Load environment variables
dotenv.config();

// Environment configuration
const isDevelopment = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';
const COSMOS_INSECURE_DEV = process.env.COSMOS_INSECURE_DEV === 'true';
const MOCK_DATA_ON_FAILURE = process.env.MOCK_DATA_ON_FAILURE === 'true';

// Create Express server
const app = express();

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
let jwtCheck: (req: Request, res: Response, next: NextFunction) => void;

if (isDevelopment) {
  console.log('Bypassing JWT validation in development (no auth required)');
  jwtCheck = (req: Request, res: Response, next: NextFunction) => next();
} else {
  console.log('Using production JWT configuration');
  jwtCheck = jwt({
    secret: jwksRsa.expressJwtSecret({
      jwksUri: process.env.JWKS_URI || 'https://default-jwks-uri.com',
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
    }),
    audience: process.env.AZURE_AD_B2C_API_IDENTIFIER,
    issuer: process.env.AZURE_AD_B2C_ISSUER,
    algorithms: ['RS256'],
  });
}

// Initialize Cosmos DB with environment-based config
initializeCosmosDb({ 
  allowInsecureConnection: isDevelopment && COSMOS_INSECURE_DEV,
  mockOnFailure: isDevelopment && MOCK_DATA_ON_FAILURE 
}).catch(err => {
  console.error('Failed to initialize Cosmos DB:', err);
  // Continue app startup, will use in-memory fallback if configured
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
    const userId = authReq.auth?.sub ?? authReq.auth?.oid ?? 'unknown-user';
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
    const userId = authReq.auth?.sub ?? authReq.auth?.oid ?? 'unknown-user';
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
    const authenticatedId = authReq.auth?.sub ?? authReq.auth?.oid ?? 'unknown-user';
    
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
    const authenticatedId = authReq.auth?.sub ?? authReq.auth?.oid ?? 'unknown-user';
    
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
    const authenticatedId = authReq.auth?.sub ?? authReq.auth?.oid ?? 'unknown-user';
    
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
    const authenticatedId = authReq.auth?.sub ?? authReq.auth?.oid ?? 'unknown-user';
    
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

// Use the goals router
app.use('/api/goals', jwtCheck, goalsRouter);

// Use the activities router
app.use('/api/activities', jwtCheck, activitiesRouter);

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
  
  // Handle ApiError instances
  if (err instanceof ApiError) {
    const apiError = err;
    const response: {
      error: string;
      message: string;
      details?: unknown;
    } = {
      error: apiError.name,
      message: apiError.message
    };
    
    if (apiError.data) {
      response.details = apiError.data;
    }
    
    res.status(apiError.status).json(response);
    return;
  }
  
  // Send a structured error response for other errors
  const error = err as Error;
  res.status(500).json({
    error: error.name || 'InternalServerError',
    message: error.message || 'An unexpected error occurred'
  });
});

// Start server with proper error handling
const server = app.listen(PORT, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log(`Environment: ${isDevelopment ? 'development' : 'production'}`);
  if (isDevelopment) {
    console.log(`Mock data on failure: ${MOCK_DATA_ON_FAILURE}`);
    console.log(`Insecure Cosmos connection: ${COSMOS_INSECURE_DEV}`);
  }
}).on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Error: Port ${PORT} is already in use.`);
    console.error('Please use a different port or kill the process using this port.');
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 