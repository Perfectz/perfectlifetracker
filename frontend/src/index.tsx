import React from 'react';
import ReactDOM from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import { AuthProvider } from './authContext';
import App from './App';
import './index.css';
import { msalInstance } from './authConfig';

// Initialize axe-core for accessibility testing in development only
if (process.env.NODE_ENV !== 'production') {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000, {});
    console.log('Accessibility testing initialized');
  });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MsalProvider>
  </React.StrictMode>
); 