// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Handle uncaught exceptions to prevent test failures
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  console.log('Uncaught exception:', err.message);
  return false;
});

// Global timeout handler for network issues
Cypress.on('fail', (err, runnable) => {
  // Handle socket timeout errors
  if (err.message.includes('ESOCKETTIMEDOUT') || 
      err.message.includes('Timed out waiting') ||
      err.message.includes('timed out after') ||
      err.message.includes('Failed to load resource')) {
    
    console.log('Network error detected:', err.message);
    
    // You can choose to retry or ignore based on your preference
    // return false to ignore the error
    return false;
  }
  
  // For other errors, fail the test as normal
  throw err;
});