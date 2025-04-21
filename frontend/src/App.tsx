import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Toaster } from 'react-hot-toast';

// Import lightweight components directly
import NavBar from './components/common/NavBar';
import ErrorBoundary from './components/common/ErrorBoundary';
import Spinner from './components/common/Spinner';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useUser } from './hooks/useUser';
import { ThemeProvider } from './themeContext';
import ThemeToggle from './components/common/ThemeToggle';
import { getAuthorizedRoutes, getPublicRoutes } from './routes';
import WelcomeScreen from './components/auth/WelcomeScreen';

// Lazy-load heavier components with prefetch
const ProfileContent = lazy(() => import('./components/profile/ProfileContent'));
const DashboardWidget = lazy(() => import('./components/dashboard/DashboardWidget'));

// Component map for route rendering
const componentMap: Record<string, React.ReactNode> = {
  'DASHBOARD': <DashboardWidget />,
  'PROFILE': <ProfileContent />,
};

// Main App component
function App() {
  const authorizedRoutes = getAuthorizedRoutes();
  const publicRoutes = getPublicRoutes();

  return (
    <ThemeProvider>
      <Router>
        <ErrorBoundary>
          <div className="app">
            <ProtectedRoute>
              <NavBar />
              <div className="theme-toggle-container">
                <ThemeToggle />
              </div>
            </ProtectedRoute>
            
            <main className="app-content">
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
                  
                  {/* Protected routes */}
                  {authorizedRoutes.map(route => (
                    <Route 
                      key={route.key}
                      path={route.path} 
                      element={
                        <ProtectedRoute>
                          <div className="page-transition">
                            {componentMap[route.key]}
                          </div>
                        </ProtectedRoute>
                      } 
                    />
                  ))}
                  
                  {/* Catch-all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
            
            {/* Toast notifications */}
            <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
          </div>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
}

export default App; 