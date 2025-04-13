import React from 'react';
import { createRoot } from 'react-dom/client';
import TestApp from './TestApp';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <TestApp />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
} 