/**
 * frontend/src/minimal-index.tsx
 * Minimal entry point for the React application
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import MinimalApp from './MinimalApp';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <MinimalApp />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}
