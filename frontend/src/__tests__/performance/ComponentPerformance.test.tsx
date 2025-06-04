/**
 * frontend/src/__tests__/performance/ComponentPerformance.test.tsx
 * Performance tests for React components to validate optimization improvements
 */
import React from 'react';
import { renderWithPerformance, PerformanceTester, BundleAnalyzer } from '../../utils/testUtils';
import { PERFORMANCE_BUDGETS } from '../../setupTests';
import HomePage from '../../pages/HomePage';
import LoginPage from '../../pages/LoginPage';
import Layout from '../../components/Layout/Layout';

describe('Component Performance Tests', () => {
  beforeEach(() => {
    PerformanceTester.clearMeasurements();
  });

  describe('Critical Path Components', () => {
    test('HomePage renders within performance budget', async () => {
      // Test multiple renders to get average
      for (let i = 0; i < 5; i++) {
        renderWithPerformance(<HomePage />, 'HomePage');
      }

      // Assert performance budget
      PerformanceTester.assertPerformanceBudget('HomePage', {
        renderTime: PERFORMANCE_BUDGETS.RENDER_TIME.LARGE_COMPONENT,
        memoryUsage: PERFORMANCE_BUDGETS.MEMORY_USAGE.LARGE_COMPONENT,
      });

      const metrics = PerformanceTester.getAverageMetrics('HomePage');
      console.log('HomePage Performance:', metrics);
      
      expect(metrics).toBeDefined();
      expect(metrics!.renderTime).toBeLessThan(PERFORMANCE_BUDGETS.RENDER_TIME.LARGE_COMPONENT);
    });

    test('LoginPage renders within performance budget', async () => {
      for (let i = 0; i < 5; i++) {
        renderWithPerformance(<LoginPage />, 'LoginPage');
      }

      PerformanceTester.assertPerformanceBudget('LoginPage', {
        renderTime: PERFORMANCE_BUDGETS.RENDER_TIME.MEDIUM_COMPONENT,
        memoryUsage: PERFORMANCE_BUDGETS.MEMORY_USAGE.MEDIUM_COMPONENT,
      });

      const metrics = PerformanceTester.getAverageMetrics('LoginPage');
      expect(metrics!.renderTime).toBeLessThan(PERFORMANCE_BUDGETS.RENDER_TIME.MEDIUM_COMPONENT);
    });

    test('Layout component renders within performance budget', async () => {
      for (let i = 0; i < 5; i++) {
        renderWithPerformance(
          <Layout title="Test Layout">
            <div>Test Content</div>
          </Layout>, 
          'Layout'
        );
      }

      PerformanceTester.assertPerformanceBudget('Layout', {
        renderTime: PERFORMANCE_BUDGETS.RENDER_TIME.MEDIUM_COMPONENT,
        memoryUsage: PERFORMANCE_BUDGETS.MEMORY_USAGE.MEDIUM_COMPONENT,
      });

      const metrics = PerformanceTester.getAverageMetrics('Layout');
      expect(metrics!.renderTime).toBeLessThan(PERFORMANCE_BUDGETS.RENDER_TIME.MEDIUM_COMPONENT);
    });
  });

  describe('Bundle Size Validation', () => {
    test('Bundle sizes meet performance budget', async () => {
      const analysis = await BundleAnalyzer.analyzeBundleSize();
      
      const budget = {
        'vendor.js': PERFORMANCE_BUDGETS.BUNDLE_SIZE.VENDOR_JS,
        'main.js': PERFORMANCE_BUDGETS.BUNDLE_SIZE.MAIN_JS,
      };

      BundleAnalyzer.assertBundleBudget(analysis, budget);
      
      // Log actual vs budget for monitoring
      Object.keys(budget).forEach(bundle => {
        const actual = analysis[bundle];
        const budgetSize = budget[bundle as keyof typeof budget];
        console.log(`${bundle}: ${actual}B (Budget: ${budgetSize}B)`);
        expect(actual).toBeLessThanOrEqual(budgetSize);
      });
    });
  });

  describe('Memory Leak Detection', () => {
    test('Components do not cause memory leaks', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Render and unmount components multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderWithPerformance(<HomePage />, `HomePage-${i}`);
        unmount();
      }

      // Force garbage collection (if available)
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal (less than 5MB)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
      console.log(`Memory increase after 10 renders: ${memoryIncrease}B`);
    });
  });

  describe('Re-render Performance', () => {
    test('Components handle prop changes efficiently', async () => {
      let renderCount = 0;
      
      const TestComponent = ({ value }: { value: number }) => {
        renderCount++;
        return <div>Value: {value}</div>;
      };

      const { rerender } = renderWithPerformance(<TestComponent value={1} />, 'TestComponent-Initial');
      
      // Measure re-render performance
      const startTime = PerformanceTester.startMeasurement('TestComponent-Rerender');
      rerender(<TestComponent value={2} />);
      PerformanceTester.endMeasurement('TestComponent-Rerender', startTime);

      const metrics = PerformanceTester.getAverageMetrics('TestComponent-Rerender');
      expect(metrics!.renderTime).toBeLessThan(PERFORMANCE_BUDGETS.RENDER_TIME.SMALL_COMPONENT);
      expect(renderCount).toBe(2); // Should only render twice
    });
  });
}); 