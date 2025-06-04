/**
 * frontend/src/setupTests.ts
 * Comprehensive test setup with performance monitoring
 */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Performance API mock for testing environments
if (typeof performance === 'undefined') {
  global.performance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
  } as any;
}

// Mock performance.memory for testing
Object.defineProperty(global.performance, 'memory', {
  value: {
    usedJSHeapSize: 1024 * 1024 * 10, // 10MB
    totalJSHeapSize: 1024 * 1024 * 50, // 50MB
    jsHeapSizeLimit: 1024 * 1024 * 100, // 100MB
  },
  configurable: true,
});

// Mock IntersectionObserver for lazy loading tests
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

// Mock ResizeObserver for responsive component tests
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test timeout for performance tests
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clean up DOM
  document.body.innerHTML = '';
  
  // Clear localStorage
  localStorage.clear();
  sessionStorage.clear();
});

// Performance budget constants for tests
export const PERFORMANCE_BUDGETS = {
  RENDER_TIME: {
    SMALL_COMPONENT: 50, // 50ms
    MEDIUM_COMPONENT: 100, // 100ms
    LARGE_COMPONENT: 200, // 200ms
    PAGE_LOAD: 500, // 500ms
  },
  MEMORY_USAGE: {
    SMALL_COMPONENT: 1024 * 1024, // 1MB
    MEDIUM_COMPONENT: 5 * 1024 * 1024, // 5MB
    LARGE_COMPONENT: 10 * 1024 * 1024, // 10MB
  },
  BUNDLE_SIZE: {
    MAIN_JS: 100 * 1024, // 100KB
    VENDOR_JS: 400 * 1024, // 400KB
    LAZY_COMPONENT: 50 * 1024, // 50KB
  },
};
