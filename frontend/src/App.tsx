import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './themeContext';
import { getAuthorizedRoutes, getPublicRoutes } from './routes';
import WelcomeScreen from './components/auth/WelcomeScreen';
import ErrorBoundary from './components/common/ErrorBoundary';
import Spinner from './components/common/Spinner';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './authContext';

// Create a query client instance once (not on each render)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Main App component
function App() {
  const authorizedRoutes = getAuthorizedRoutes();
  const publicRoutes = getPublicRoutes();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <ErrorBoundary>
              <div className="app">
                {/* Global toast notifications */}
                <ToastContainer 
                  position="bottom-right"
                  autoClose={4000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
                
                {/* All routes with Suspense for code splitting */}
                <Suspense fallback={<Spinner message="Loading page..." />}>
                  <Routes>
                    {/* Public routes */}
                    {publicRoutes.map(route => (
                      <Route 
                        key={route.key}
                        path={route.path} 
                        element={<WelcomeScreen />} 
                      />
                    ))}
                    
                    {/* Protected routes with shared layout */}
                    <Route 
                      element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      {/* Map all authorized routes */}
                      {authorizedRoutes.map(route => {
                        const RouteComponent = route.lazyComponent;
                        
                        return (
                          <Route 
                            key={route.key}
                            path={route.key === 'GOALS' ? `${route.path}/*` : route.path}
                            element={RouteComponent ? <RouteComponent /> : <Navigate to="/" replace />}
                          />
                        );
                      })}
                    </Route>
                    
                    {/* Catch-all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </div>
            </ErrorBoundary>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 