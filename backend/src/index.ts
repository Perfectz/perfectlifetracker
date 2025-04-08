/**
 * backend/src/index.ts
 * Express server entry point with API endpoints
 */
import express from 'express';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Error handler middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    res.json({ status: 'ok', message: 'Perfect LifeTracker Pro API is running' });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', message: 'Health check failed' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 