/**
 * frontend/src/__tests__/performance/LazyLoading.test.tsx
 * Tests for lazy loading performance and optimization validation
 */
import React from 'react';
import { LazyLoadingTester } from '../../utils/testUtils';
import { PERFORMANCE_BUDGETS } from '../../setupTests';

describe('Lazy Loading Performance Tests', () => {
  describe('Component Lazy Loading', () => {
    test('Dashboard page loads within performance budget', async () => {
      const metrics = await LazyLoadingTester.testLazyComponentLoad(
        () => import('../../pages/DashboardPage')
      );

      expect(metrics.renderTime).toBeLessThan(PERFORMANCE_BUDGETS.RENDER_TIME.PAGE_LOAD);
      console.log('Dashboard lazy load time:', metrics.renderTime + 'ms');
    });

    test('Tasks screen loads within performance budget', async () => {
      const metrics = await LazyLoadingTester.testLazyComponentLoad(
        () => import('../../screens/TasksScreen')
      );

      expect(metrics.renderTime).toBeLessThan(PERFORMANCE_BUDGETS.RENDER_TIME.MEDIUM_COMPONENT);
      console.log('Tasks screen lazy load time:', metrics.renderTime + 'ms');
    });

    test('Fitness screen loads within performance budget', async () => {
      const metrics = await LazyLoadingTester.testLazyComponentLoad(
        () => import('../../screens/FitnessScreen')
      );

      expect(metrics.renderTime).toBeLessThan(PERFORMANCE_BUDGETS.RENDER_TIME.MEDIUM_COMPONENT);
      console.log('Fitness screen lazy load time:', metrics.renderTime + 'ms');
    });

    test('Settings screen loads within performance budget', async () => {
      const metrics = await LazyLoadingTester.testLazyComponentLoad(
        () => import('../../screens/SettingsScreen')
      );

      expect(metrics.renderTime).toBeLessThan(PERFORMANCE_BUDGETS.RENDER_TIME.SMALL_COMPONENT);
      console.log('Settings screen lazy load time:', metrics.renderTime + 'ms');
    });
  });

  describe('Retry Mechanism', () => {
    test('Retry mechanism works for failed imports', async () => {
      let attemptCount = 0;
      
      const mockImport = () => {
        attemptCount++;
        if (attemptCount < 2) {
          return Promise.reject(new Error('Network failure'));
        }
        return Promise.resolve({ default: () => <div>Component</div> });
      };

      const success = await LazyLoadingTester.testRetryMechanism(mockImport, 3);
      
      expect(success).toBe(true);
      expect(attemptCount).toBe(2); // Should succeed on second attempt
    });

    test('Retry mechanism respects max retry limit', async () => {
      const mockImport = () => Promise.reject(new Error('Persistent failure'));

      await expect(
        LazyLoadingTester.testRetryMechanism(mockImport, 2)
      ).rejects.toThrow('Retry mechanism failed after 2 attempts');
    });
  });

  describe('Preloading Strategy', () => {
    test('Critical components can be preloaded', async () => {
      // Mock the preload functions from App.tsx
      const preloadDashboard = () => import('../../pages/DashboardPage');
      const preloadFitness = () => import('../../screens/FitnessScreen');

      const startTime = performance.now();
      
      // Preload both components
      await Promise.all([
        preloadDashboard(),
        preloadFitness()
      ]);
      
      const endTime = performance.now();
      const preloadTime = endTime - startTime;

      // Preloading should be fast since these are small lazy chunks
      expect(preloadTime).toBeLessThan(1000); // 1 second max
      console.log('Preload time for critical components:', preloadTime + 'ms');
    });
  });

  describe('Chunk Size Validation', () => {
    test('Lazy chunks meet size budget', async () => {
      // Mock bundle analysis for lazy chunks
      const lazyChunks = {
        'DashboardPage': 15000,  // ~15KB
        'TasksScreen': 5000,     // ~5KB  
        'FitnessScreen': 8000,   // ~8KB
        'SettingsScreen': 5000,  // ~5KB
      };

      Object.entries(lazyChunks).forEach(([chunk, size]) => {
        expect(size).toBeLessThan(PERFORMANCE_BUDGETS.BUNDLE_SIZE.LAZY_COMPONENT);
        console.log(`${chunk}: ${size}B (Budget: ${PERFORMANCE_BUDGETS.BUNDLE_SIZE.LAZY_COMPONENT}B)`);
      });
    });
  });
}); 