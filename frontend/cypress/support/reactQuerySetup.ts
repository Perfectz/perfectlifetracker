// frontend/cypress/support/reactQuerySetup.ts
// This file sets up React Query for Cypress tests by patching the window object

import { QueryClient } from 'react-query';

// Create a global QueryClient that will be accessible to the application
// when running under Cypress
window.reactQueryGlobal = {
  queryClient: new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
      },
    },
  })
};

// Declare type for our window augmentation
declare global {
  interface Window {
    reactQueryGlobal: {
      queryClient: QueryClient;
    };
  }
} 