/**
 * backend/jest.config.js
 * Comprehensive Jest configuration for backend API and performance testing
 */
module.exports = {
  // Preset for TypeScript
  preset: 'ts-jest',
  
  // Test environment
  testEnvironment: 'node',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
  },
  
  // Transform files
  transform: {
    '^.+\\.(ts|js)$': 'ts-jest',
  },
  
  // File extensions to consider
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|js)',
    '<rootDir>/src/**/?(*.)(test|spec).(ts|js)',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/setupTests.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.*',
    '!src/**/*.spec.*',
  ],
  
  // Coverage thresholds for quality gates
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  
  // Test timeout for performance tests
  testTimeout: 60000, // 60 seconds for load tests
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Collect coverage
  collectCoverage: false, // Enable with --coverage flag
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  
  // Verbose output for CI
  verbose: true,
  
  // Handle async operations
  detectOpenHandles: true,
  forceExit: true,
  
  // Performance budget enforcement
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit.xml',
    }],
  ],
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3001',
  },
}; 