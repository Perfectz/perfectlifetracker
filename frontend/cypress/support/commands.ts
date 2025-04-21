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
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
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

/**
 * Custom command to programmatically login without UI interaction
 * This bypasses clicking the button and directly sets the session storage
 */
Cypress.Commands.add('programmaticLogin', () => {
  cy.window().then((win) => {
    // Set mock auth state directly
    win.sessionStorage.setItem('mock_auth_state', 'authenticated');
  });
});

/**
 * Custom command to perform a UI login via the button click
 * This simulates the actual user experience including waiting for redirect
 */
Cypress.Commands.add('uiLogin', () => {
  // Visit homepage
  cy.visit('/');
  
  // Check if already authenticated
  cy.window().then((win) => {
    const isAuthenticated = win.sessionStorage.getItem('mock_auth_state') === 'authenticated';
    if (!isAuthenticated) {
      // Click login button if not authenticated
      cy.get('.sign-in-button').click();
      
      // Wait for redirect to dashboard to ensure login completed
      cy.url().should('include', '/dashboard', { timeout: 10000 });
    }
  });
});

// Add TypeScript definitions
declare namespace Cypress {
  interface Chainable {
    programmaticLogin(): void;
    uiLogin(): void;
  }
}