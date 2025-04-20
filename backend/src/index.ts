import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import compression from 'compression';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "*.b2clogin.com"]
    }
  }
}));
app.use(compression());
app.use(morgan('dev'));

// JWT validation middleware
const jwtCheck = jwt({
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

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'LifeTracker Pro API is running!' });
});

// Protected profile route
app.get('/api/profile', jwtCheck, (req: any, res) => {
  res.status(200).json(req.auth);
});

// Error handling middleware
interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

app.use((err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  
  // Handle JWT errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid or missing authentication token'
    });
  }
  
  // Handle other errors
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred'
  });
});

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'NotFound',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 