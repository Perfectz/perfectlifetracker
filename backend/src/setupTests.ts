/**
 * backend/src/setupTests.ts
 * Comprehensive test setup for backend API and performance testing
 */

// Global test variables
declare global {
  var __MONGO_URI__: string;
  var __MONGO_DB_NAME__: string;
  var performanceTestUtils: any;
}

// Performance measurement utilities
global.performanceTestUtils = {
  measurements: new Map(),
  
  startMeasurement(testName: string): number {
    const startTime = process.hrtime.bigint();
    return Number(startTime);
  },
  
  endMeasurement(testName: string, startTime: number): { duration: number; memory: number } {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - BigInt(startTime)) / 1000000; // Convert to milliseconds
    const memoryUsage = process.memoryUsage();
    
    const result = {
      duration,
      memory: memoryUsage.heapUsed,
    };
    
    if (!this.measurements.has(testName)) {
      this.measurements.set(testName, []);
    }
    this.measurements.get(testName).push(result);
    
    return result;
  },
  
  getAverageMetrics(testName: string) {
    const measurements = this.measurements.get(testName);
    if (!measurements || measurements.length === 0) return null;
    
    const total = measurements.reduce(
      (acc: any, metric: any) => ({
        duration: acc.duration + metric.duration,
        memory: acc.memory + metric.memory,
      }),
      { duration: 0, memory: 0 }
    );
    
    return {
      duration: total.duration / measurements.length,
      memory: total.memory / measurements.length,
    };
  },
  
  clearMeasurements() {
    this.measurements.clear();
  }
};

// Setup test environment
beforeAll(() => {
  // Mock database setup
  global.__MONGO_URI__ = 'mongodb://localhost:27017/test-db';
  global.__MONGO_DB_NAME__ = 'test-db';
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.USE_MOCK_AUTH = 'true';
  process.env.MONGO_URI = global.__MONGO_URI__;
});

// Clean up after each test
afterEach(() => {
  // Clear performance measurements
  global.performanceTestUtils.clearMeasurements();
});

// Performance budgets for backend testing
export const API_PERFORMANCE_BUDGETS = {
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
  THROUGHPUT: {
    MIN_RPS: 100, // 100 requests per second
    TARGET_RPS: 500, // 500 requests per second
  },
}; 