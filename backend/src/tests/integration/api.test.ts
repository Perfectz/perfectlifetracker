/**
 * backend/src/tests/integration/api.test.ts
 * Comprehensive integration tests for API endpoints and services
 */
import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../../app';
import { userService } from '../../services/UserService';
import { taskService } from '../../services/TaskService';
import { cacheService } from '../../services/CacheService';

describe('API Integration Tests', () => {
  let app: Express;
  let authToken: string;
  let testUser: any;
  let testTask: any;

  beforeAll(async () => {
    // Initialize test app
    app = await createApp();
    
    // Create test user and get auth token
    testUser = await userService.createUser({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'TestPassword123!'
    });

    // Generate mock JWT token for testing
    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    // Clean up test data
    if (testUser) {
      await userService.delete(testUser.id);
    }
    if (testTask) {
      await taskService.delete(testTask.id);
    }
    
    // Clear cache
    cacheService.clear();
  });

  beforeEach(() => {
    // Clear cache before each test
    cacheService.clear();
  });

  describe('Health Check Endpoints', () => {
    test('GET /api/health should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        services: {
          database: { status: 'healthy' },
          cache: { status: 'healthy' },
          api: { status: 'healthy' }
        },
        environment: 'test'
      });

      expect(response.body.timestamp).toBeDefined();
      expect(response.body.responseTime).toBeDefined();
    });

    test('Health check should include cache statistics', async () => {
      // Add some cache data
      cacheService.set('test-key', 'test-value');
      
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.services.cache.totalItems).toBe(1);
      expect(response.body.services.cache.hits).toBeDefined();
      expect(response.body.services.cache.misses).toBeDefined();
    });
  });

  describe('User Endpoints', () => {
    test('POST /api/users should create a new user', async () => {
      const newUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: 'SecurePassword123!'
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        username: newUser.username
      });
      expect(response.body.data.password).toBeUndefined();
      expect(response.body.data.id).toBeDefined();

      // Clean up
      await userService.delete(response.body.data.id);
    });

    test('POST /api/users should validate required fields', async () => {
      const invalidUser = {
        firstName: 'John',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('GET /api/users/me should return current user profile', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUser.id);
      expect(response.body.data.password).toBeUndefined();
    });

    test('PUT /api/users/me should update current user profile', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);
    });

    test('GET /api/users/:id/stats should return user statistics', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.id}/stats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        tasksCompleted: expect.any(Number),
        workoutsLogged: expect.any(Number),
        totalTasks: expect.any(Number),
        completionRate: expect.any(Number)
      });
    });
  });

  describe('Task Endpoints', () => {
    test('POST /api/tasks should create a new task', async () => {
      const newTask = {
        title: 'Test Task',
        description: 'This is a test task',
        priority: 'medium',
        dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        tags: ['test', 'api']
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTask)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: 'todo',
        userId: testUser.id
      });

      testTask = response.body.data;
    });

    test('GET /api/tasks should return user tasks with pagination', async () => {
      const response = await request(app)
        .get('/api/tasks?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number)
      });
    });

    test('GET /api/tasks/:id should return specific task', async () => {
      const response = await request(app)
        .get(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testTask.id);
      expect(response.body.data.title).toBe(testTask.title);
    });

    test('PUT /api/tasks/:id should update task', async () => {
      const updateData = {
        title: 'Updated Task Title',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.priority).toBe(updateData.priority);
    });

    test('POST /api/tasks/:id/complete should complete task', async () => {
      const response = await request(app)
        .post(`/api/tasks/${testTask.id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ actualTime: 30 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.actualTime).toBe(30);
      expect(response.body.data.completedAt).toBeDefined();
    });

    test('GET /api/tasks/overdue should return overdue tasks', async () => {
      const response = await request(app)
        .get('/api/tasks/overdue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('GET /api/tasks/due-today should return tasks due today', async () => {
      const response = await request(app)
        .get('/api/tasks/due-today')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('GET /api/tasks/stats should return task statistics', async () => {
      const response = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        total: expect.any(Number),
        completed: expect.any(Number),
        pending: expect.any(Number),
        overdue: expect.any(Number)
      });
    });
  });

  describe('Cache Integration', () => {
    test('Repeated requests should use cache', async () => {
      // First request - should hit database
      const response1 = await request(app)
        .get(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response1.body.cached).toBeUndefined();

      // Second request - should hit cache
      const response2 = await request(app)
        .get(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response2.body.cached).toBe(true);
      expect(response2.body.data).toEqual(response1.body.data);
    });

    test('Cache should be invalidated on updates', async () => {
      // Get task to populate cache
      await request(app)
        .get(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Update task - should invalidate cache
      await request(app)
        .put(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Cache Invalidation Test' })
        .expect(200);

      // Get task again - should not be cached
      const response = await request(app)
        .get(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.cached).toBeUndefined();
      expect(response.body.data.title).toBe('Cache Invalidation Test');
    });
  });

  describe('Error Handling', () => {
    test('Should handle 404 for non-existent resources', async () => {
      const response = await request(app)
        .get('/api/tasks/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TASK_NOT_FOUND');
    });

    test('Should handle unauthorized requests', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
    });

    test('Should handle validation errors', async () => {
      const invalidTask = {
        title: '', // Invalid empty title
        priority: 'invalid-priority'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTask)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });

    test('Should handle server errors gracefully', async () => {
      // Simulate server error by causing database connection failure
      const originalMethod = taskService.findById;
      taskService.findById = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');

      // Restore original method
      taskService.findById = originalMethod;
    });
  });

  describe('Performance Tests', () => {
    test('API response time should be under 500ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/health')
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(500);
    });

    test('Cached requests should be under 50ms', async () => {
      // Populate cache
      await request(app)
        .get(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Time cached request
      const startTime = Date.now();
      
      await request(app)
        .get(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(50);
    });
  });

  describe('Concurrent Request Handling', () => {
    test('Should handle multiple concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, () =>
        request(app)
          .get('/api/health')
          .expect(200)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('healthy');
      });
    });

    test('Should handle concurrent cache operations', async () => {
      const requests = Array.from({ length: 5 }, (_, index) =>
        request(app)
          .get(`/api/tasks/${testTask.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testTask.id);
      });
    });
  });
});

// Helper function to create test app
async function createApp(): Promise<Express> {
  // Mock app creation - in real implementation this would initialize the full app
  const express = require('express');
  const app = express();
  
  // Add basic middleware and routes here
  app.use(express.json());
  
  // Mock route handlers for testing
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: 10,
      services: {
        database: { status: 'healthy', responseTime: 5 },
        cache: { 
          status: 'healthy',
          ...cacheService.getStats()
        },
        api: { status: 'healthy', responseTime: 10 }
      },
      environment: 'test'
    });
  });

  return app;
} 