/// <reference types="cypress" />

describe('Route Configuration', () => {
  beforeEach(() => {
    // Mock the authentication since we're using a mock auth system
    // This simulates a user being logged in
    cy.window().then((win) => {
      win.sessionStorage.setItem('mock_auth_state', 'authenticated');
    });
    
    // Visit the site
    cy.visit('/');
  });

  it('should render routes from centralized configuration', () => {
    // Verify navigation items from the route configuration appear in the UI
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Profile').should('be.visible');
    
    // Navigate to dashboard and verify it loads
    cy.contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
    
    // Navigate to profile and verify it loads  
    cy.contains('Profile').click();
    cy.url().should('include', '/profile');
    
    // Verify redirecting to dashboard when visiting home as authenticated user
    cy.visit('/');
    cy.url().should('include', '/dashboard');
  });
  
  it('should handle invalid routes', () => {
    // Verify non-existent routes are redirected to home
    cy.visit('/not-a-real-route');
    cy.url().should('include', '/dashboard');
  });
  
  it('should update navigation active state based on current route', () => {
    // Go to Dashboard
    cy.contains('Dashboard').click();
    
    // In desktop view, verify the Dashboard item is highlighted
    cy.viewport(1200, 800);
    cy.contains('Dashboard')
      .closest('.MuiButtonBase-root')
      .should('have.class', 'Mui-selected');
      
    // Go to Profile
    cy.contains('Profile').click();
    
    // Verify Profile item is now highlighted and Dashboard is not
    cy.contains('Profile')
      .closest('.MuiButtonBase-root')
      .should('have.class', 'Mui-selected');
    cy.contains('Dashboard')
      .closest('.MuiButtonBase-root')
      .should('not.have.class', 'Mui-selected');
      
    // Check the same in mobile view with bottom navigation
    cy.viewport('iphone-x');
    
    // The active tab index should correspond to Profile
    cy.get('nav').find('.Mui-selected').contains('Profile');
  });
}); 