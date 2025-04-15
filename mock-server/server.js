const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mock user data
const users = [
  { id: '1', name: 'Demo User', email: 'demo@example.com' }
];

// Mock fitness data
const fitnessData = [
  { id: '1', userId: '1', type: 'Running', duration: 30, distance: 5, date: new Date().toISOString() },
  { id: '2', userId: '1', type: 'Cycling', duration: 45, distance: 15, date: new Date().toISOString() }
];

// Mock authentication endpoint
app.post('/api/auth/login', (req, res) => {
  res.json({
    token: 'mock-jwt-token',
    user: users[0]
  });
});

// Get current user
app.get('/api/users/me', (req, res) => {
  res.json(users[0]);
});

// Get fitness data
app.get('/api/fitness', (req, res) => {
  res.json(fitnessData);
});

// Create fitness entry
app.post('/api/fitness', (req, res) => {
  const newEntry = {
    id: Date.now().toString(),
    userId: '1',
    ...req.body,
    date: new Date().toISOString()
  };
  
  fitnessData.push(newEntry);
  res.status(201).json(newEntry);
});

// Mock file upload endpoint
app.post('/api/upload', (req, res) => {
  res.status(200).json({
    url: 'https://example.com/uploads/mockfile.jpg',
    filename: 'mockfile.jpg'
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
}); 