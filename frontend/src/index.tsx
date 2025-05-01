import React from 'react';
import ReactDOM from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import { AuthProvider } from './authContext';
import App from './App';
import './index.css';
import { msalInstance } from './authConfig';
import { QueryClient, QueryClientProvider } from 'react-query';

// Add type for window augmentation
declare global {
  interface Window {
    reactQueryGlobal?: {
      queryClient: QueryClient;
    };
  }
}

// Initialize axe-core for accessibility testing in development only
if (process.env.NODE_ENV !== 'production') {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000, {});
    console.log('Accessibility testing initialized');
  });
}

// Use the global QueryClient if available (for Cypress tests)
// or create a new one for normal app usage
const queryClient = window.reactQueryGlobal?.queryClient || new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MsalProvider>
    </QueryClientProvider>
  </React.StrictMode>
); 