/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clean up any existing auth state
    cy.window().then((win) => {
      win.sessionStorage.removeItem('mock_auth_state');
    });
    cy.visit('/');
  });

  it('should display the welcome screen for unauthenticated users', () => {
    cy.contains('Welcome to LifeTracker Pro');
    cy.contains('Sign In').should('be.visible');
  });

  it('should log in and redirect to dashboard', () => {
    // Use our custom login command
    cy.login();
    cy.visit('/dashboard');
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Activity Summary').should('be.visible');
  });

  it('should persist authentication across page reloads', () => {
    cy.login();
    cy.visit('/dashboard');
    cy.contains('Dashboard');
    
    // Reload the page
    cy.reload();
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Sign Out').should('be.visible');
  });

  it('should redirect to dashboard when authenticated user visits home page', () => {
    cy.login();
    cy.visit('/');
    cy.url().should('include', '/dashboard');
  });

  it('should at least render the login form correctly', () => {
    cy.visit('/');
    cy.contains('Welcome to LifeTracker Pro');
    cy.contains('Sign In').should('be.visible');
  });

  it('should be able to login through UI interaction', () => {
    cy.visit('/');
    cy.contains('Sign In').click();
    // Our mock auth will handle the login
    cy.url().should('include', '/dashboard');
  });
}); 