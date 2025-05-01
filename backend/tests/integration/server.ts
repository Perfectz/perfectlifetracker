import express from 'express';
import jwt from 'jsonwebtoken';

// Create a test server for integration tests
export const setupTestServer = () => {
  const app = express();
  
  // Apply middleware
  app.use(express.json());
  
  // Mock authentication middleware
  const mockAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    req.user = {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User'
    };
    next();
  };
  
  // Health endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'up' });
  });
  
  // Apply auth middleware to all /api routes
  app.use('/api/*', mockAuth);
  
  // Mock profile endpoints
  app.post('/api/profile', (req, res) => {
    res.status(201).json({ 
      id: 'profile-123',
      userId: req.user?.id,
      ...req.body
    });
  });
  
  app.get('/api/profile/:id', (req, res) => {
    res.status(200).json({
      id: req.params.id,
      userId: req.user?.id,
      name: 'Test User',
      email: 'test@example.com',
      fitnessLevel: 'Intermediate'
    });
  });
  
  app.delete('/api/profile/:id', (req, res) => {
    res.status(204).end();
  });
  
  // Mock goals endpoints
  app.post('/api/goals', (req, res) => {
    res.status(201).json({
      id: 'goal-123',
      userId: req.user?.id,
      ...req.body,
      createdAt: new Date().toISOString()
    });
  });
  
  app.delete('/api/goals/:id', (req, res) => {
    res.status(204).end();
  });
  
  // Mock activities endpoints
  app.post('/api/activities', (req, res) => {
    res.status(201).json({
      id: 'activity-123',
      userId: req.user?.id,
      ...req.body,
      createdAt: new Date().toISOString()
    });
  });
  
  app.get('/api/analytics/fitness', (req, res) => {
    res.status(200).json({
      totalDuration: 25,
      totalCalories: 300,
      averageDurationPerDay: 25
    });
  });
  
  app.post('/api/openai/fitness-summary', (req, res) => {
    res.status(200).json({
      summary: 'This is a mock fitness summary of your recent activities.'
    });
  });
  
  app.delete('/api/activities/:id', (req, res) => {
    res.status(204).end();
  });
  
  // Error handler
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error in test server:', err);
    res.status(500).json({ error: 'Internal server error' });
  });
  
  return app;
}; 