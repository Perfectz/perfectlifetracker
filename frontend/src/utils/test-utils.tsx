/**
 * frontend/src/utils/test-utils.tsx
 * Utility functions for testing React components
 */
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { responsiveLightTheme } from '../theme';

// Custom wrapper that provides necessary context providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={responsiveLightTheme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Custom render method that wraps rendered UI with necessary providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render }; 