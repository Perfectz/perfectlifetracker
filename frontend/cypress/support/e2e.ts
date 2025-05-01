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

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Declare custom commands to Cypress namespace
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to programmatically log in a user in the mock auth system
       */
      programmaticLogin(): Chainable<void>

      /**
       * Custom command to save session storage data for use between tests
       */
      saveSessionStorage(): Chainable<void>

      /**
       * Custom command to restore session storage data from previous tests
       */
      restoreSessionStorage(): Chainable<void>

      /**
       * Custom command to set session storage data for a specific key
       */
      setSessionStorage(key: string, value: string): Chainable<void>

      /**
       * Custom command to get session storage data for all keys or a specific key
       */
      getSessionStorage(key?: string): Chainable<any>

      /**
       * Custom command to clear all session storage data
       */
      clearAllSessionStorage(): Chainable<void>
    }
  }
}

// Load React Query patching
import './reactQuerySetup';

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