/**
 * frontend/cypress.config.ts
 * Cypress configuration for E2E performance testing
 */
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,

    // Performance testing configuration
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    setupNodeEvents(on, config) {
      // Performance monitoring plugin
      on('task', {
        // Log performance metrics
        logPerformance(metrics) {
          console.log('Performance Metrics:', metrics);
          return null;
        },

        // Clear performance measurements
        clearPerformance() {
          return null;
        },

        // Validate performance budget
        validatePerformanceBudget({ metrics, budget }) {
          const failures: string[] = [];

          if (metrics.FCP > budget.FCP) {
            failures.push(`FCP: ${metrics.FCP}ms > ${budget.FCP}ms`);
          }
          if (metrics.LCP > budget.LCP) {
            failures.push(`LCP: ${metrics.LCP}ms > ${budget.LCP}ms`);
          }
          if (metrics.CLS > budget.CLS) {
            failures.push(`CLS: ${metrics.CLS} > ${budget.CLS}`);
          }
          if (metrics.FID > budget.FID) {
            failures.push(`FID: ${metrics.FID}ms > ${budget.FID}ms`);
          }

          return failures.length > 0 ? failures : null;
        },
      });

      return config;
    },

    specPattern: ['cypress/e2e/**/*.cy.{ts,tsx}', 'cypress/e2e/performance/**/*.cy.{ts,tsx}'],

    env: {
      // Performance budgets for E2E tests
      PERFORMANCE_BUDGETS: {
        FCP: 2000, // First Contentful Paint: 2s
        LCP: 3000, // Largest Contentful Paint: 3s
        FID: 100, // First Input Delay: 100ms
        CLS: 0.1, // Cumulative Layout Shift: 0.1
        TTI: 5000, // Time to Interactive: 5s
        LOAD_TIME: 5000, // Full page load: 5s
      },

      // Test data
      TEST_USER: {
        email: 'test@example.com',
        password: 'testpassword',
      },
    },
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },

    setupNodeEvents(on, config) {
      // Component testing setup
      return config;
    },

    specPattern: 'src/**/*.cy.{ts,tsx}',
  },
});
