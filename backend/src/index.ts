import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
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
app.get('/health', (req: any, res: any) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/health', (req: any, res: any) => {
  res.status(200).json({ status: 'ok', message: 'LifeTracker Pro API is running!' });
});

// Protected profile route
app.get('/api/profile', jwtCheck, (req: any, res: any) => {
  res.status(200).json(req.auth);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 