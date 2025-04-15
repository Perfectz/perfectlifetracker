/**
 * frontend/src/App.tsx
 * Main application component with theme provider, routing, and navigation
 */
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './services/authService';
import { AuthProvider } from './services/AuthContext';
import { AuthModalsProvider } from './hooks/useAuthModals';
import { FrontendAuthBridge } from './services/FrontendAuthBridge';
import { createMuiTheme } from './theme';
import { responsiveFontSizes } from '@mui/material/styles';
import ErrorBoundary from './components/ErrorBoundary';
import { Routes, Route } from 'react-router-dom';

// Navigation components
import ResponsiveNavigator from './navigation/ResponsiveNavigator';

// Create theme
const theme = responsiveFontSizes(createMuiTheme(false));

// Main App with Authentication Provider
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MsalProvider instance={msalInstance}>
          <AuthProvider>
            <FrontendAuthBridge>
              <AuthModalsProvider>
                <Routes>
                  <Route path="*" element={<ResponsiveNavigator />} />
                </Routes>
              </AuthModalsProvider>
            </FrontendAuthBridge>
          </AuthProvider>
        </MsalProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
