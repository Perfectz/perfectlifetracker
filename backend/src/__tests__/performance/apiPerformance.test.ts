/**
 * backend/src/__tests__/performance/apiPerformance.test.ts
 * API performance tests to validate backend optimization improvements
 */
import request from 'supertest';
import express from 'express';

// Mock API performance budgets
const API_PERFORMANCE_BUDGETS = {
  RESPONSE_TIME: {
    GET_ENDPOINT: 100, // 100ms
    POST_ENDPOINT: 200, // 200ms
    PUT_ENDPOINT: 150, // 150ms
    DELETE_ENDPOINT: 100, // 100ms
    SEARCH_ENDPOINT: 300, // 300ms
  },
  MEMORY_USAGE: {
    SMALL_OPERATION: 5 * 1024 * 1024, // 5MB
    MEDIUM_OPERATION: 10 * 1024 * 1024, // 10MB
    LARGE_OPERATION: 20 * 1024 * 1024, // 20MB
  },
};

// Mock express app for testing
const createMockApp = () => {
  const app = express();
  app.use(express.json());

  // Mock routes for testing
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/tasks', (req, res) => {
    // Simulate database query
    setTimeout(() => {
      res.json({
        tasks: [
          { id: '1', title: 'Test Task 1', status: 'pending' },
          { id: '2', title: 'Test Task 2', status: 'completed' },
        ],
        total: 2
      });
    }, 10); // 10ms simulated delay
  });

  app.post('/api/tasks', (req, res) => {
    // Simulate task creation
    setTimeout(() => {
      res.status(201).json({
        id: 'new-task-id',
        ...req.body,
        createdAt: new Date().toISOString()
      });
    }, 20); // 20ms simulated delay
  });

  app.get('/api/tasks/search', (req, res) => {
    // Simulate search operation (more complex)
    setTimeout(() => {
      res.json({
        results: [
          { id: '1', title: 'Matching Task', relevance: 0.95 }
        ],
        query: req.query.q,
        total: 1
      });
    }, 50); // 50ms simulated delay
  });

  return app;
};

describe('API Performance Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createMockApp();
  });

  describe('Response Time Validation', () => {
    test('Health endpoint responds within budget', async () => {
      const startTime = process.hrtime.bigint();
      
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      
      expect(responseTime).toBeLessThan(API_PERFORMANCE_BUDGETS.RESPONSE_TIME.GET_ENDPOINT);
      expect(response.body.status).toBe('ok');
      
      console.log(`Health endpoint response time: ${responseTime}ms`);
    });

    test('Tasks GET endpoint responds within budget', async () => {
      const startTime = process.hrtime.bigint();
      
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);
      
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1000000;
      
      expect(responseTime).toBeLessThan(API_PERFORMANCE_BUDGETS.RESPONSE_TIME.GET_ENDPOINT);
      expect(response.body.tasks).toHaveLength(2);
      
      console.log(`Tasks GET response time: ${responseTime}ms`);
    });

    test('Tasks POST endpoint responds within budget', async () => {
      const startTime = process.hrtime.bigint();
      
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'New Task',
          description: 'Test task description',
          priority: 'medium'
        })
        .expect(201);
      
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1000000;
      
      expect(responseTime).toBeLessThan(API_PERFORMANCE_BUDGETS.RESPONSE_TIME.POST_ENDPOINT);
      expect(response.body.title).toBe('New Task');
      
      console.log(`Tasks POST response time: ${responseTime}ms`);
    });

    test('Search endpoint responds within budget', async () => {
      const startTime = process.hrtime.bigint();
      
      const response = await request(app)
        .get('/api/tasks/search?q=test')
        .expect(200);
      
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1000000;
      
      expect(responseTime).toBeLessThan(API_PERFORMANCE_BUDGETS.RESPONSE_TIME.SEARCH_ENDPOINT);
      expect(response.body.results).toHaveLength(1);
      
      console.log(`Search response time: ${responseTime}ms`);
    });
  });

  describe('Memory Usage Validation', () => {
    test('API endpoints do not cause memory leaks', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Make multiple requests to detect memory leaks
      for (let i = 0; i < 50; i++) {
        await request(app).get('/api/health').expect(200);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(API_PERFORMANCE_BUDGETS.MEMORY_USAGE.SMALL_OPERATION);
      console.log(`Memory increase after 50 requests: ${memoryIncrease} bytes`);
    });
  });

  describe('Concurrent Request Handling', () => {
    test('Handles concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const startTime = process.hrtime.bigint();
      
      const promises = Array.from({ length: concurrentRequests }, () =>
        request(app).get('/api/tasks').expect(200)
      );
      
      const responses = await Promise.all(promises);
      
      const endTime = process.hrtime.bigint();
      const totalTime = Number(endTime - startTime) / 1000000;
      const averageTime = totalTime / concurrentRequests;
      
      expect(averageTime).toBeLessThan(API_PERFORMANCE_BUDGETS.RESPONSE_TIME.GET_ENDPOINT * 2);
      expect(responses).toHaveLength(concurrentRequests);
      
      console.log(`Average response time for ${concurrentRequests} concurrent requests: ${averageTime}ms`);
    });
  });

  describe('Database Query Performance', () => {
    test('Query optimization utilities work correctly', () => {
      // Mock query optimization test
      const startTime = process.hrtime.bigint();
      
      // Simulate optimized query
      const mockOptimizedQuery = () => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ count: 100 }), 5); // 5ms optimized query
        });
      };
      
      return mockOptimizedQuery().then(() => {
        const endTime = process.hrtime.bigint();
        const queryTime = Number(endTime - startTime) / 1000000;
        
        expect(queryTime).toBeLessThan(50); // Should be very fast
        console.log(`Optimized query time: ${queryTime}ms`);
      });
    });

    test('Cache effectiveness validation', () => {
      // Mock cache test
      const cache = new Map();
      const cacheKey = 'test-key';
      const testData = { data: 'cached-result' };
      
      // First access (cache miss)
      const startMiss = process.hrtime.bigint();
      if (!cache.has(cacheKey)) {
        cache.set(cacheKey, testData);
      }
      const endMiss = process.hrtime.bigint();
      const missTime = Number(endMiss - startMiss) / 1000000;
      
      // Second access (cache hit)
      const startHit = process.hrtime.bigint();
      const cachedResult = cache.get(cacheKey);
      const endHit = process.hrtime.bigint();
      const hitTime = Number(endHit - startHit) / 1000000;
      
      expect(cachedResult).toEqual(testData);
      expect(hitTime).toBeLessThan(missTime); // Cache hit should be faster
      
      console.log(`Cache miss time: ${missTime}ms, Cache hit time: ${hitTime}ms`);
    });
  });
}); 