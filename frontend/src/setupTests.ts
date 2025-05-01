// Note: This is a simplified version to avoid TypeScript errors.
// Add jest-dom matchers for testing
import '@testing-library/jest-dom';

// Ensure jest is defined correctly for TypeScript
// This helps TypeScript recognize the jest global object
// @ts-ignore - allow global jest
declare const jest: any;
declare global {
  namespace NodeJS {
    interface Global {
      crypto: any;
    }
  }
}

// Polyfill crypto for tests
// This addresses the "crypto_nonexistent" error when testing authentication-related code
Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn().mockImplementation(() => Promise.resolve(new ArrayBuffer(32))),
      importKey: jest.fn().mockImplementation(() => Promise.resolve({})),
      sign: jest.fn().mockImplementation(() => Promise.resolve(new ArrayBuffer(32))),
      encrypt: jest.fn().mockImplementation(() => Promise.resolve(new ArrayBuffer(32))),
      decrypt: jest.fn().mockImplementation(() => Promise.resolve(new ArrayBuffer(32)))
    },
    getRandomValues: jest.fn().mockImplementation(arr => {
      return Object.assign(arr, { 0: Math.random(), 1: Math.random() });
    })
  }
});

// Mock matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
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

// Mock react-hot-toast
const mockSuccess = jest.fn();
const mockError = jest.fn();
const mockLoading = jest.fn();
const mockDismiss = jest.fn();

jest.mock('react-hot-toast', () => ({
  toast: {
    success: mockSuccess,
    error: mockError,
    loading: mockLoading,
    dismiss: mockDismiss
  },
  Toaster: () => null
}));
