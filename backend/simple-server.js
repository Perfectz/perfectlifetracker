const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cosmosEndpoint: process.env.COSMOS_DB_ENDPOINT ? 'configured' : 'not configured',
    cosmosKey: process.env.COSMOS_DB_KEY ? 'configured' : 'not configured',
    cosmosDatabase: process.env.COSMOS_DB_DATABASE_NAME || 'not configured'
  });
});

// Test Cosmos DB endpoint
app.get('/api/test-cosmos', async (req, res) => {
  try {
    const { CosmosClient } = require('@azure/cosmos');
    
    const endpoint = process.env.COSMOS_DB_ENDPOINT;
    const key = process.env.COSMOS_DB_KEY;
    const databaseId = process.env.COSMOS_DB_DATABASE_NAME || 'perfectltp';

    if (!endpoint || !key) {
      return res.status(500).json({ 
        error: 'Cosmos DB configuration missing',
        endpoint: !!endpoint,
        key: !!key
      });
    }

    const client = new CosmosClient({ endpoint, key });
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    
    // List containers
    const { resources: containers } = await database.containers.readAll().fetchAll();
    
    res.json({
      status: 'success',
      database: database.id,
      containers: containers.map(c => c.id),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Cosmos DB connection failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Basic user endpoints for testing
app.get('/api/users', (req, res) => {
  res.json({
    message: 'Users endpoint working',
    users: [],
    timestamp: new Date().toISOString()
  });
});

app.post('/api/users', (req, res) => {
  res.json({
    message: 'User creation endpoint working',
    user: { id: Date.now(), ...req.body },
    timestamp: new Date().toISOString()
  });
});

// Fitness endpoints for testing
app.get('/api/fitness', (req, res) => {
  res.json({
    message: 'Fitness endpoint working',
    data: [],
    timestamp: new Date().toISOString()
  });
});

app.post('/api/fitness', (req, res) => {
  res.json({
    message: 'Fitness data creation endpoint working',
    data: { id: Date.now(), ...req.body },
    timestamp: new Date().toISOString()
  });
});

// Tasks endpoints for testing
app.get('/api/tasks', (req, res) => {
  res.json({
    message: 'Tasks endpoint working',
    tasks: [],
    timestamp: new Date().toISOString()
  });
});

app.post('/api/tasks', (req, res) => {
  res.json({
    message: 'Task creation endpoint working',
    task: { id: Date.now(), ...req.body },
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`🚀 Perfect LifeTracker Pro API running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`🗄️ Cosmos test: http://localhost:${port}/api/test-cosmos`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 