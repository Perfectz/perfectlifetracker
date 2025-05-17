// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock environment variables 
process.env.REACT_APP_API_URL = 'http://localhost:3001/api';

// Mock the window.matchMedia function 
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

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  
  constructor(private readonly _callback: IntersectionObserverCallback) {}
  
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn().mockReturnValue([]);
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {  
  constructor(private readonly _callback: ResizeObserverCallback) {}
  
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

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

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    custom: jest.fn(),
    dismiss: jest.fn(),
    remove: jest.fn(),
    promise: jest.fn(),
    Toaster: () => null,
  },
}));

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  
  return {
    __esModule: true,
    ...originalModule,
    useNavigate: jest.fn().mockReturnValue(jest.fn()),
    useParams: jest.fn().mockReturnValue({}),
    useLocation: jest.fn().mockReturnValue({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default'
    })
  };
});

// Mock react-toastify
jest.mock('react-toastify', () => ({
  __esModule: true,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    update: jest.fn(),
    dismiss: jest.fn()
  },
  ToastContainer: () => null
}));

// Ensure jest is defined correctly for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveAttribute(attr: string, value?: string): R;
    }
  }
}
