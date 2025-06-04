/**
 * backend/src/index.ts
 * Updated Express server entry point with Key Vault integration
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { expressjwt, Request as JWTRequest } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { secretsManager } from './config/secrets';
import { initCosmosConfig, initializeContainers } from './utils/cosmosClient';
import { initializeDatabase } from './utils/dbInit';
import { logger, logApiRequest } from './utils/logger';

// Import routes
import userRoutes from './routes/userRoutes';
import taskRoutes from './routes/taskRoutes';
import fitnessRoutes from './routes/fitnessRoutes';
import uploadRoutes from './routes/uploadRoutes';

// Initialize environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize secrets and configuration
async function initializeApp() {
  try {
    logger.info('Starting application initialization...');
    
    // Initialize secrets from Key Vault
    await secretsManager.initializeSecrets();
    logger.info('✓ Secrets initialization completed');
    
    // Initialize Cosmos DB configuration
    await initCosmosConfig();
    logger.info('✓ Cosmos DB configuration completed');
    
    // Initialize database containers
    await initializeContainers();
    logger.info('✓ Database containers initialized');
    
    // Initialize database (additional setup if needed)
    await initializeDatabase();
    logger.info('✓ Database initialization completed');
    
    logger.info('Application initialization completed successfully');
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Health check endpoint (before authentication middleware)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    keyVaultEnabled: process.env.USE_KEY_VAULT === 'true',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  logApiRequest(req.method, req.path);
  next();
});

// Authentication middleware (conditionally applied)
const useAuth = process.env.USE_MOCK_AUTH !== 'true';
let authMiddleware: any = null;

if (useAuth) {
  authMiddleware = expressjwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${process.env.AZURE_AUTHORITY}/discovery/v2.0/keys`
    }),
    audience: process.env.AZURE_CLIENT_ID,
    issuer: `${process.env.AZURE_AUTHORITY}/v2.0`,
    algorithms: ['RS256']
  });
}

// Apply authentication middleware to protected routes
if (authMiddleware) {
  app.use('/api/users', authMiddleware);
  app.use('/api/tasks', authMiddleware);
  app.use('/api/fitness', authMiddleware);
  app.use('/api/upload', authMiddleware);
}

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/fitness', fitnessRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Invalid token' });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server only after initialization
async function startServer() {
  await initializeApp();
  
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    logger.info(`Key Vault enabled: ${process.env.USE_KEY_VAULT === 'true'}`);
    logger.info(`Mock auth enabled: ${process.env.USE_MOCK_AUTH === 'true'}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
}); 