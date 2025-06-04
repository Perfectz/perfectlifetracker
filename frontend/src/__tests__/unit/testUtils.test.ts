/**
 * frontend/src/__tests__/unit/testUtils.test.ts
 * Test to validate our performance testing utilities
 */
import { PerformanceTester, CacheTester } from '../../utils/simpleTestUtils';

describe('Performance Testing Infrastructure', () => {
  beforeEach(() => {
    PerformanceTester.clearMeasurements();
    CacheTester.clearCache();
  });

  test('PerformanceTester measures time correctly', () => {
    const testName = 'simple-test';
    const startTime = PerformanceTester.startMeasurement(testName);
    
    // Simulate some work
    const result = Array.from({ length: 1000 }, (_, i) => i * 2);
    
    const metrics = PerformanceTester.endMeasurement(testName, startTime);
    
    expect(metrics.renderTime).toBeGreaterThan(0);
    expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
    expect(result.length).toBe(1000);
  });

  test('PerformanceTester calculates averages correctly', () => {
    const testName = 'average-test';
    
    // Run multiple measurements
    for (let i = 0; i < 3; i++) {
      const startTime = PerformanceTester.startMeasurement(testName);
      // Small delay
      new Array(100).fill(0).forEach((_, idx) => idx * 2);
      PerformanceTester.endMeasurement(testName, startTime);
    }
    
    const average = PerformanceTester.getAverageMetrics(testName);
    expect(average).toBeDefined();
    expect(average!.renderTime).toBeGreaterThan(0);
  });

  test('CacheTester works correctly', () => {
    const key = 'test-key';
    const value = { message: 'cached data' };
    
    // Set cache item
    CacheTester.setCacheItem(key, value);
    
    // Retrieve cache item
    const retrieved = CacheTester.getCacheItem(key);
    expect(retrieved).toEqual(value);
    
    // Test non-existent key
    const notFound = CacheTester.getCacheItem('non-existent');
    expect(notFound).toBeNull();
  });

  test('Performance budget validation works', () => {
    const testName = 'budget-test';
    const startTime = PerformanceTester.startMeasurement(testName);
    PerformanceTester.endMeasurement(testName, startTime);
    
    // This should not throw
    expect(() => {
      PerformanceTester.assertPerformanceBudget(testName, {
        renderTime: 10000, // Very generous budget
        memoryUsage: 100 * 1024 * 1024, // 100MB
      });
    }).not.toThrow();
  });
}); 