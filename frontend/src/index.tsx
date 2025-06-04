/**
 * frontend/src/index.tsx
 * Main entry point for the React application
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { logger } from './utils/logger';

const container = document.getElementById('root');

if (!container) {
  logger.error('Root element not found', {
    location: 'index.tsx',
    elementId: 'root',
  });
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
