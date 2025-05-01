import React from 'react';
import { mount } from 'cypress/react';
import { QueryClient, QueryClientProvider } from 'react-query';

// Create a QueryClient for testing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
});

// Custom mount function that includes providers
Cypress.Commands.add('mount', (component: React.ReactNode, options = {}) => {
  const wrapped = (
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
  
  return mount(wrapped, options);
});

// Add TypeScript definitions
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
} 