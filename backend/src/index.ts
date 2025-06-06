/**
 * backend/src/index.ts
 * Updated Express server entry point with centralized middleware architecture
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { secretsManager } from './config/secrets';
import { logger } from './utils/logger';
import databaseService from './services/DatabaseService';
import { webSocketService } from './services/WebSocketService';

// Import centralized middleware
import RequestEnhancer from './middleware/requestEnhancer';
import ErrorHandler from './middleware/errorHandler';
import AuthMiddleware from './middleware/auth';
import requestIdMiddleware from './middleware/requestId';

// Import comprehensive API routes
import apiRoutes from './routes/api';

// Initialize environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3001;

// Initialize secrets and configuration
async function initializeApp() {
  try {
    logger.info('Starting application initialization...');
    
    // Initialize secrets from Key Vault
    await secretsManager.initializeSecrets();
    logger.info('✓ Secrets initialization completed');
    
    // Initialize database service with configuration
    await databaseService.initialize({
      endpoint: process.env.COSMOS_DB_ENDPOINT || '',
      key: process.env.COSMOS_DB_KEY || '',
      databaseId: process.env.COSMOS_DB_DATABASE_NAME || 'LifeTrackerDB',
      connectionPolicy: {
        requestTimeout: 10000,
        connectionMode: 'Gateway',
        maxRetryAttemptCount: 3,
        maxRetryWaitTimeInSeconds: 30
      }
    });
    logger.info('✓ Database service initialization completed');
    
    // Initialize WebSocket service
    webSocketService.initialize(server);
    logger.info('✓ WebSocket service initialization completed');
    
    logger.info('Application initialization completed successfully');
  } catch (error) {
    logger.error('Failed to initialize application:', { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
  }
}

// Health check endpoint (before middleware)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    keyVaultEnabled: process.env.USE_KEY_VAULT === 'true',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Core Express middleware
app.use(requestIdMiddleware);
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

// Apply centralized request enhancement middleware
RequestEnhancer.enhance.forEach(middleware => {
  app.use(middleware as express.RequestHandler);
});

// Initialize authentication middleware if not using mock auth
const useAuth = process.env.USE_MOCK_AUTH !== 'true';
if (useAuth) {
  try {
    AuthMiddleware.initialize();
  } catch (error) {
    logger.warn('Auth middleware initialization failed, continuing without auth', { error });
  }
}

// API Routes with comprehensive Phase 3 integration
app.use('/api', apiRoutes);

// 404 handler using centralized error handling
app.use('*', ErrorHandler.handleNotFound);

// Global error handling middleware
app.use(ErrorHandler.handleError);

// Start server only after initialization
async function startServer() {
  await initializeApp();
  
  server.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    logger.info(`WebSocket server enabled on port ${port}`);
    logger.info(`Key Vault enabled: ${process.env.USE_KEY_VAULT === 'true'}`);
    logger.info(`Mock auth enabled: ${process.env.USE_MOCK_AUTH === 'true'}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(error => {
  logger.error('Failed to start server:', { error: error instanceof Error ? error.message : String(error) });
  process.exit(1);
}); 