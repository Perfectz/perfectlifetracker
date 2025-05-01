import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authMiddleware } from './middleware/auth';
import { telemetryMiddleware, initializeAppInsights, trackException } from './middleware/telemetry';

// Initialize Application Insights at startup
initializeAppInsights();

export const app = express();

// Apply middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Apply telemetry middleware before route handlers
app.use(telemetryMiddleware);

// Health check endpoint (publicly accessible)
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: 'up',
    timestamp: new Date().toISOString(),
    services: {
      // Add service health checks here
      api: 'up',
      database: process.env.MOCK_SERVICES === 'true' ? 'mock' : 'up'
    }
  });
});

// Apply authentication middleware to protected routes
app.use('/api/*', authMiddleware);

// Add error handler that logs to Application Insights
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  trackException(err, {
    path: req.path,
    method: req.method,
    userId: req.user?.id || 'anonymous'
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
}); 