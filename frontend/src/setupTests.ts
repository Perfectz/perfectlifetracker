// Note: This is a simplified version to avoid TypeScript errors.
// Add jest-dom matchers for testing
import '@testing-library/jest-dom';

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
