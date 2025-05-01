/// <reference types="cypress" />

// E2E test that validates the full application flow
// This tests login, profile update, goal creation, activity logging, and dashboard viewing

describe('End-to-End User Flow', () => {
  before(() => {
    // Clear cookies and local storage before test to ensure clean state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();
  });

  beforeEach(() => {
    // Restore session between tests
    cy.restoreSessionStorage();
  });

  afterEach(() => {
    // Save session after each test
    cy.saveSessionStorage();
  });

  it('should complete the login process', () => {
    // Visit the home page
    cy.visit('/');
    
    // At the home page, we should see a login button
    cy.contains('Sign In').should('be.visible');
    
    // Programmatically login to simulate authentication
    cy.programmaticLogin();
    
    // Verify we are redirected to dashboard after login
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
    
    // Verify auth state
    cy.window().its('sessionStorage')
      .invoke('getItem', 'mock_auth_state')
      .should('eq', 'authenticated');
  });

  it('should update the user profile', () => {
    // Navigate to profile page
    cy.contains('Profile').click();
    cy.url().should('include', '/profile');
    
    // Click edit button
    cy.get('[data-testid="edit-button"]').click();
    
    // Fill in the form
    cy.get('input[name="name"]').clear().type('Test User');
    cy.get('input[name="email"]').clear().type('test@example.com');
    cy.get('textarea[name="bio"]').clear().type('This is a test bio for end-to-end testing');
    
    // Submit the form
    cy.get('[data-testid="save-button"]').click();
    
    // Verify the profile was updated
    cy.contains('Test User').should('be.visible');
    cy.contains('test@example.com').should('be.visible');
    cy.contains('This is a test bio for end-to-end testing').should('be.visible');
  });

  it('should create a fitness goal', () => {
    // Navigate to goals page
    cy.contains('Fitness Goals').click();
    cy.url().should('include', '/goals');
    
    // Click add goal button
    cy.contains('Add New Goal').click();
    
    // Fill in the goal form
    const goalTitle = `E2E Test Goal ${new Date().toISOString()}`;
    cy.get('input[name="title"]').type(goalTitle);
    
    // Set target date (one month from now)
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 1);
    cy.get('input[name="targetDate"]').type(targetDate.toISOString().split('T')[0]);
    
    // Add notes
    cy.get('textarea[name="notes"]').type('This is a test goal created during E2E testing');
    
    // Set progress
    cy.get('input[name="progress"]').clear().type('50');
    
    // Submit the form
    cy.contains('button', 'Save Goal').click();
    
    // Verify the goal was created
    cy.contains(goalTitle).should('be.visible');
    cy.contains('50%').should('be.visible');
  });

  it('should log a fitness activity', () => {
    // Navigate to activities page
    cy.contains('Activities').click();
    cy.url().should('include', '/activities');
    
    // Click add activity button
    cy.contains('Log New Activity').click();
    
    // Fill in the activity form
    const activityNote = `E2E Test Activity ${new Date().toISOString()}`;
    
    // Select activity type
    cy.get('select[name="type"]').select('Running');
    
    // Set duration
    cy.get('input[name="duration"]').clear().type('45');
    
    // Set calories
    cy.get('input[name="calories"]').clear().type('350');
    
    // Add notes
    cy.get('textarea[name="notes"]').type(activityNote);
    
    // Submit the form
    cy.contains('button', 'Save Activity').click();
    
    // Verify the activity was created
    cy.contains('Running').should('be.visible');
    cy.contains('45 mins').should('be.visible');
    cy.contains('350').should('be.visible');
    cy.contains(activityNote).should('be.visible');
  });

  it('should view insights on the dashboard', () => {
    // Navigate to dashboard
    cy.contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
    
    // Verify dashboard components are loaded
    cy.contains('Activity Insights').should('be.visible');
    
    // Check for metrics - note these could be mock data
    cy.contains('Total Activity Time').should('be.visible');
    cy.contains('Total Calories Burned').should('be.visible');
    
    // Check for insights summary
    cy.contains('Your Fitness Summary').should('be.visible');
    
    // Check for activity widgets
    cy.contains('Fitness Progress').should('be.visible');
    cy.contains('Activity Streak').should('be.visible');
    cy.contains('Health Score').should('be.visible');
    
    // No errors should be present in console (check only critical/error level)
    cy.window().then((win) => {
      expect(win.console.error).to.have.callCount(0);
    });
  });
}); 