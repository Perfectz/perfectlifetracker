import React from 'react';
import ReactDOM from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import { AuthProvider } from './authContext';
import App from './App';
import './index.css';
import { msalInstance } from './authConfig';

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