/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.add('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// Improve resilience to network issues with longer timeouts
Cypress.Commands.add('visitWithRetry', (url: string, options = {}) => {
  // Set default timeout to 2 minutes
  const defaultOptions = { 
    timeout: 120000,
    retryOnStatusCodeFailure: true
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Log the visit for debugging
  Cypress.log({
    name: 'visitWithRetry',
    message: `Visiting ${url} with extended timeout`,
  });
  
  // First attempt
  return cy.visit(url, mergedOptions).then(() => {
    Cypress.log({ name: 'visitWithRetry', message: 'Page loaded successfully' });
  });
});

/**
 * Custom command to programmatically login without UI interaction
 * This bypasses clicking the button and directly sets the session storage
 */
Cypress.Commands.add('programmaticLogin', () => {
  cy.window().then((win) => {
    // Set mock auth state directly
    win.sessionStorage.setItem('mock_auth_state', 'authenticated');
  });
  // Force a reload to ensure the app recognizes the auth state change
  cy.reload();
});

/**
 * Custom command to perform a UI login via the button click
 * This simulates the actual user experience including waiting for redirect
 */
Cypress.Commands.add('uiLogin', () => {
  // Visit homepage with extended timeout
  cy.visit('/', { timeout: 120000 });
  
  // Check if already authenticated
  cy.window().then((win) => {
    const isAuthenticated = win.sessionStorage.getItem('mock_auth_state') === 'authenticated';
    if (!isAuthenticated) {
      // Click login button if not authenticated
      cy.get('.sign-in-button', { timeout: 30000 }).click();
      
      // Wait for redirect to dashboard to ensure login completed
      cy.url().should('include', '/dashboard', { timeout: 30000 });
    }
  });
});

// Add TypeScript definitions
declare namespace Cypress {
  interface Chainable {
    visitWithRetry(url: string, options?: Partial<Cypress.VisitOptions>): Chainable<AUTWindow>;
    programmaticLogin(): void;
    uiLogin(): void;
  }
}

// Add commands to save and restore session storage
// This is useful for maintaining auth state between tests
Cypress.Commands.add('saveSessionStorage', () => {
  cy.window().then((win) => {
    Object.keys(win.sessionStorage).forEach(key => {
      cy.setSessionStorage(key, win.sessionStorage.getItem(key));
    });
  });
});

Cypress.Commands.add('restoreSessionStorage', () => {
  cy.getSessionStorage().then(sessionData => {
    if (sessionData) {
      Object.keys(sessionData).forEach(key => {
        cy.window().then(win => {
          win.sessionStorage.setItem(key, sessionData[key]);
        });
      });
    }
  });
});

// Commands to manage session data across tests
let SESSION_STORAGE_MEMORY = {};

Cypress.Commands.add('setSessionStorage', (key, value) => {
  SESSION_STORAGE_MEMORY[key] = value;
});

Cypress.Commands.add('getSessionStorage', (key?) => {
  if (key) {
    return cy.wrap(SESSION_STORAGE_MEMORY[key]);
  }
  return cy.wrap(SESSION_STORAGE_MEMORY);
});

Cypress.Commands.add('clearAllSessionStorage', () => {
  SESSION_STORAGE_MEMORY = {};
  cy.window().then(win => {
    win.sessionStorage.clear();
  });
});

// Custom command to select by data attribute
Cypress.Commands.add('dataCy', (value) => {
  return cy.get(`[data-cy=${value}]`);
});

// Custom login helper
Cypress.Commands.add('login', () => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('mock_auth_state', 'authenticated');
    win.sessionStorage.setItem('user_id', 'user-1');
    win.sessionStorage.setItem('user_name', 'Test User');
    win.sessionStorage.setItem('user_email', 'test@example.com');
  });
});

// Mock API responses
Cypress.Commands.add('mockApiRoutes', () => {
  // Mock common API responses
  cy.intercept('GET', '/api/habits*', {
    statusCode: 200,
    body: {
      items: [
        {
          id: 'habit-1',
          userId: 'user-1',
          name: 'Morning Meditation',
          frequency: 'daily',
          streak: 7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'habit-2',
          userId: 'user-1',
          name: 'Exercise',
          frequency: 'weekly',
          streak: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      total: 2,
      limit: 10,
      offset: 0
    }
  }).as('getHabits');
  
  // Add more API mocks as needed
});