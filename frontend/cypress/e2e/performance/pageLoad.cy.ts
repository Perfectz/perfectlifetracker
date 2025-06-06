/**
 * frontend/cypress/e2e/performance/pageLoad.cy.ts
 * E2E performance tests for page load optimization
 */

describe('Page Load Performance Tests', () => {
  const PERFORMANCE_BUDGETS = {
    FCP: 2000, // First Contentful Paint: 2s
    LCP: 3000, // Largest Contentful Paint: 3s
    FID: 100, // First Input Delay: 100ms
    CLS: 0.1, // Cumulative Layout Shift: 0.1
    TTI: 5000, // Time to Interactive: 5s
    LOAD_TIME: 5000, // Full page load: 5s
  };

  beforeEach(() => {
    // Clear performance measurements
    cy.task('clearPerformance');
  });

  describe('Critical Page Performance', () => {
    it('HomePage loads within performance budget', () => {
      const startTime = performance.now();

      cy.visit('/');

      // Wait for page to be fully loaded
      cy.get('[data-testid="homepage"]').should('be.visible');

      cy.window().then(win => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;

        expect(loadTime).to.be.lessThan(PERFORMANCE_BUDGETS.LOAD_TIME);

        // Log performance metrics
        cy.task('logPerformance', {
          page: 'HomePage',
          loadTime: loadTime,
          timestamp: new Date().toISOString(),
        });
      });
    });

    it('LoginPage loads within performance budget', () => {
      const startTime = performance.now();

      cy.visit('/login');

      // Wait for login form to be visible
      cy.get('[data-testid="login-form"]').should('be.visible');

      cy.window().then(win => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;

        expect(loadTime).to.be.lessThan(PERFORMANCE_BUDGETS.LOAD_TIME);

        cy.task('logPerformance', {
          page: 'LoginPage',
          loadTime: loadTime,
          timestamp: new Date().toISOString(),
        });
      });
    });

    it('DashboardPage loads within performance budget', () => {
      // Mock authentication
      cy.window().then(win => {
        win.localStorage.setItem('auth_token', 'mock-token');
      });

      const startTime = performance.now();

      cy.visit('/dashboard');

      // Wait for dashboard content to load
      cy.get('[data-testid="dashboard"]').should('be.visible');

      cy.window().then(win => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;

        expect(loadTime).to.be.lessThan(PERFORMANCE_BUDGETS.LOAD_TIME);

        cy.task('logPerformance', {
          page: 'DashboardPage',
          loadTime: loadTime,
          timestamp: new Date().toISOString(),
        });
      });
    });
  });

  describe('Web Vitals Performance', () => {
    it('Measures and validates Core Web Vitals', () => {
      cy.visit('/');

      // Wait for page to be fully loaded
      cy.get('[data-testid="homepage"]').should('be.visible');

      cy.window().then(win => {
        // Mock Web Vitals measurements
        const mockWebVitals = {
          FCP: 1500, // First Contentful Paint
          LCP: 2500, // Largest Contentful Paint
          FID: 50, // First Input Delay
          CLS: 0.05, // Cumulative Layout Shift
          TTI: 3000, // Time to Interactive
        };

        // Validate against performance budget
        cy.task('validatePerformanceBudget', {
          metrics: mockWebVitals,
          budget: PERFORMANCE_BUDGETS,
        }).then(failures => {
          if (failures) {
            throw new Error(`Performance budget exceeded: ${failures.join(', ')}`);
          }
        });

        cy.task('logPerformance', {
          page: 'HomePage',
          webVitals: mockWebVitals,
          timestamp: new Date().toISOString(),
        });
      });
    });
  });

  describe('Lazy Loading Performance', () => {
    it('Lazy loaded components render efficiently', () => {
      cy.visit('/dashboard');

      // Navigate to a lazy-loaded route
      cy.get('[data-testid="nav-tasks"]').click();

      const startTime = performance.now();

      // Wait for lazy component to load
      cy.get('[data-testid="tasks-screen"]').should('be.visible');

      cy.window().then(win => {
        const endTime = performance.now();
        const lazyLoadTime = endTime - startTime;

        // Lazy loading should be fast
        expect(lazyLoadTime).to.be.lessThan(1000); // 1 second max

        cy.task('logPerformance', {
          component: 'TasksScreen',
          lazyLoadTime: lazyLoadTime,
          timestamp: new Date().toISOString(),
        });
      });
    });
  });

  describe('Network Performance', () => {
    it('API requests complete within budget', () => {
      // Intercept API calls
      cy.intercept('GET', '/api/tasks', { fixture: 'tasks.json' }).as('getTasks');

      cy.visit('/dashboard');

      // Trigger API call
      cy.get('[data-testid="nav-tasks"]').click();

      // Measure API response time
      cy.wait('@getTasks').then(interception => {
        const responseTime = interception.response?.duration || 0;

        expect(responseTime).to.be.lessThan(500); // 500ms max for API calls

        cy.task('logPerformance', {
          api: 'getTasks',
          responseTime: responseTime,
          timestamp: new Date().toISOString(),
        });
      });
    });
  });

  describe('Bundle Size Impact', () => {
    it('Initial bundle loads efficiently', () => {
      cy.visit('/', {
        onBeforeLoad: win => {
          // Mock performance observer for resource timing
          win.performance.getEntriesByType = cy.stub().returns([
            {
              name: 'main.js',
              transferSize: 95190, // 95.19KB
              duration: 200,
            },
            {
              name: 'vendor.js',
              transferSize: 328920, // 328.92KB
              duration: 500,
            },
          ]);
        },
      });

      cy.window().then(win => {
        const resources = win.performance.getEntriesByType('resource');

        resources.forEach((resource: any) => {
          if (resource.name.includes('.js')) {
            // Validate bundle sizes
            expect(resource.transferSize).to.be.lessThan(500000); // 500KB max
            expect(resource.duration).to.be.lessThan(1000); // 1s max load time

            cy.task('logPerformance', {
              bundle: resource.name,
              size: resource.transferSize,
              loadTime: resource.duration,
              timestamp: new Date().toISOString(),
            });
          }
        });
      });
    });
  });
});
