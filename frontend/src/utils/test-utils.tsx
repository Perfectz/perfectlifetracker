/**
 * frontend/src/utils/test-utils.tsx
 * Utility functions for testing React components
 */
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createMuiTheme } from '../../src/theme';
import { responsiveFontSizes } from '@mui/material/styles';

// Custom wrapper that provides necessary context providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // Create theme using the shared theme creator and apply responsive font sizes
  const muiTheme = createMuiTheme(false); // Use light theme for tests
  const responsiveTheme = responsiveFontSizes(muiTheme);
  
  return (
    <BrowserRouter>
      <ThemeProvider theme={responsiveTheme}>
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