/**
 * backend/src/index.ts
 * Express server entry point with API endpoints
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { expressjwt, Request as JWTRequest } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { initializeDatabase } from './utils/dbInit';

// Import routes
import userRoutes from './routes/userRoutes';
import taskRoutes from './routes/taskRoutes';
import fitnessRoutes from './routes/fitnessRoutes';
import uploadRoutes from './routes/uploadRoutes';

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();
const port = 3001;

// Middleware
app.use(express.json());

// Configure CORS with preflight support
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || '']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
};
app.use(cors(corsOptions));
// Handle preflight requests
app.options('*', cors(corsOptions));

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

// Development-only JWT bypass (only when explicitly enabled)
const conditionalJwt = (req: any, res: any, next: any) => {
  // Only bypass JWT in development with explicit flag
  if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_AUTH === 'true') {
    console.warn('⚠️  JWT authentication bypassed for development mode');
    return next();
  }
  
  // Use proper JWT validation in production or when mock auth is disabled
  return checkJwt(req, res, next);
};

// Public routes
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Perfect LifeTracker Pro API Server', 
    availableEndpoints: {
      health: '/api/health',
      users: '/api/users',
      tasks: '/api/tasks',
      fitness: '/api/fitness'
    },
    documentation: 'See README.md for API documentation'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/fitness', fitnessRoutes);
app.use('/api/uploads', uploadRoutes);

// Protected test route
app.get('/api/protected', conditionalJwt, (req: JWTRequest, res) => {
  res.json({ 
    message: 'This is a protected endpoint', 
    user: req.auth
  });
});

// Error handler middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Database initialization and server startup
async function startServer() {
  try {
    // Initialize and seed the database
    await initializeDatabase();
    
    // Start Express server
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
      console.log(`Health check available at http://localhost:${port}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 