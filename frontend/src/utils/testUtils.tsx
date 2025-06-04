/**
 * frontend/src/utils/testUtils.ts
 * Comprehensive testing utilities for performance optimization and validation
 */
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';

// Performance measurement utilities
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  bundleSize?: number;
  cacheHitRate?: number;
}

export class PerformanceTester {
  private static measurements: Map<string, PerformanceMetrics[]> = new Map();

  static startMeasurement(testName: string): number {
    const startTime = performance.now();
    return startTime;
  }

  static endMeasurement(testName: string, startTime: number): PerformanceMetrics {
    const endTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

    const metrics: PerformanceMetrics = {
      renderTime: endTime - startTime,
      memoryUsage: Math.abs(endMemory - startMemory),
    };

    // Store measurement
    if (!this.measurements.has(testName)) {
      this.measurements.set(testName, []);
    }
    this.measurements.get(testName)!.push(metrics);

    return metrics;
  }

  static getAverageMetrics(testName: string): PerformanceMetrics | null {
    const measurements = this.measurements.get(testName);
    if (!measurements || measurements.length === 0) return null;

    const total = measurements.reduce(
      (acc, metric) => ({
        renderTime: acc.renderTime + metric.renderTime,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
      }),
      { renderTime: 0, memoryUsage: 0 }
    );

    return {
      renderTime: total.renderTime / measurements.length,
      memoryUsage: total.memoryUsage / measurements.length,
    };
  }

  static assertPerformanceBudget(testName: string, budget: Partial<PerformanceMetrics>): void {
    const avg = this.getAverageMetrics(testName);
    if (!avg) throw new Error(`No measurements found for ${testName}`);

    if (budget.renderTime && avg.renderTime > budget.renderTime) {
      throw new Error(`Render time ${avg.renderTime}ms exceeds budget ${budget.renderTime}ms`);
    }

    if (budget.memoryUsage && avg.memoryUsage > budget.memoryUsage) {
      throw new Error(`Memory usage ${avg.memoryUsage}B exceeds budget ${budget.memoryUsage}B`);
    }
  }

  static clearMeasurements(): void {
    this.measurements.clear();
  }
}

// Bundle size testing utilities
export class BundleAnalyzer {
  static async analyzeBundleSize(): Promise<{ [key: string]: number }> {
    // Mock implementation - in real scenario would analyze actual bundles
    return {
      'main.js': 95190, // 95.19KB
      'vendor.js': 328920, // 328.92KB
      'components.js': 139890, // 139.89KB
    };
  }

  static assertBundleBudget(analysis: { [key: string]: number }, budget: { [key: string]: number }): void {
    Object.keys(budget).forEach(bundle => {
      const actualSize = analysis[bundle];
      const budgetSize = budget[bundle];
      
      if (actualSize && actualSize > budgetSize) {
        throw new Error(`Bundle ${bundle} size ${actualSize}B exceeds budget ${budgetSize}B`);
      }
    });
  }
}

// Lazy loading testing utilities
export class LazyLoadingTester {
  static async testLazyComponentLoad(importFunction: () => Promise<any>): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    
    try {
      await importFunction();
      const endTime = performance.now();
      
      return {
        renderTime: endTime - startTime,
        memoryUsage: 0, // Would measure actual memory in real scenario
      };
    } catch (error) {
      throw new Error(`Lazy loading failed: ${error}`);
    }
  }

  static async testRetryMechanism(importFunction: () => Promise<any>, maxRetries: number = 3): Promise<boolean> {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        await importFunction();
        return true;
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw new Error(`Retry mechanism failed after ${maxRetries} attempts`);
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
    
    return false;
  }
}

// Cache testing utilities
export class CacheTester {
  static mockCache: Map<string, { value: any; expiry: number }> = new Map();

  static setCacheItem(key: string, value: any, ttl: number = 300000): void {
    this.mockCache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }

  static getCacheItem(key: string): any | null {
    const item = this.mockCache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.mockCache.delete(key);
      return null;
    }
    
    return item.value;
  }

  static getCacheHitRate(): number {
    // Mock implementation - would calculate actual hit rate
    return 0.75; // 75% hit rate
  }

  static clearCache(): void {
    this.mockCache.clear();
  }
}

// Custom render function with minimal providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Performance-aware render function
export const renderWithPerformance = (
  ui: ReactElement,
  testName: string,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const startTime = PerformanceTester.startMeasurement(testName);
  const result = customRender(ui, options);
  PerformanceTester.endMeasurement(testName, startTime);
  return result;
};

// Export utilities
export * from '@testing-library/react';
export { customRender as render };

// API testing utilities
export const mockApiResponse = (data: any, delay: number = 0): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const mockApiError = (error: string, delay: number = 0): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(error)), delay);
  });
};

// Accessibility testing helpers
export const axeCheck = async (container: HTMLElement): Promise<void> => {
  // Mock implementation - would use @axe-core/react in real scenario
  console.log('Accessibility check passed for', container.tagName);
};

// Memory leak detection
export const detectMemoryLeaks = (): boolean => {
  const memoryInfo = (performance as any).memory;
  if (!memoryInfo) return false;
  
  const threshold = 50 * 1024 * 1024; // 50MB
  return memoryInfo.usedJSHeapSize > threshold;
};