/// <reference types="cypress" />

describe('Habits Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.login();
    cy.visit('/habits');
  });

  it('should display the habits page', () => {
    cy.contains('My Habits').should('be.visible');
  });

  it('should open the add habit form', () => {
    cy.contains('Add Habit').click();
    cy.contains('Add New Habit').should('be.visible');
    cy.get('[data-testid="habit-name-input"]').should('be.visible');
  });

  it('should create a new habit', () => {
    const habitName = `Test Habit ${new Date().getTime()}`;
    
    // Open form
    cy.contains('Add Habit').click();
    
    // Fill out form
    cy.get('[data-testid="habit-name-input"]').type(habitName);
    cy.get('[data-testid="habit-description-input"]').type('This is a test habit created by Cypress');
    
    // Submit form
    cy.get('[data-testid="habit-submit-button"]').click();
    
    // Verify habit was created
    cy.contains(habitName).should('be.visible');
  });
}); 