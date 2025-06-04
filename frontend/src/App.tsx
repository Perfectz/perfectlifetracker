/**
 * frontend/src/App.tsx
 * Main application component with optimized lazy loading and theme provider
 */
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ThemeModeProvider } from './theme';
import { MockAuthProvider } from './services/MockAuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { lazyWithRetry, preloadComponent } from './utils/performance';

// Immediate imports for critical components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load non-critical pages with retry mechanism
const DashboardPage = lazyWithRetry(() => import('./pages/DashboardPage'));
const TasksScreen = lazyWithRetry(() => import('./screens/TasksScreen'));
const FitnessScreen = lazyWithRetry(() => import('./screens/FitnessScreen'));
const DevelopmentScreen = lazyWithRetry(() => import('./screens/DevelopmentScreen'));
const ProfileScreen = lazyWithRetry(() => import('./screens/ProfileScreen'));
const SettingsScreen = lazyWithRetry(() => import('./screens/SettingsScreen'));
const WeightTrackerPage = lazyWithRetry(() => import('./pages/WeightTrackerPage'));
const MealTrackerPage = lazyWithRetry(() => import('./pages/MealTrackerPage'));
const TerraDesignDemo = lazyWithRetry(() => import('./pages/TerraDesignDemo'));

// Preload functions for critical routes
const preloadDashboard = preloadComponent(() => import('./pages/DashboardPage'));
const preloadFitness = preloadComponent(() => import('./screens/FitnessScreen'));

// Enhanced loading component with Terra styling
const LoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="400px"
    flexDirection="column"
    gap={2}
  >
    <CircularProgress size={40} />
    <Box sx={{ color: 'text.secondary', fontSize: 14 }}>Loading...</Box>
  </Box>
);

function App() {
  // Preload critical routes on app start
  React.useEffect(() => {
    // Preload dashboard after 2 seconds (when initial load is complete)
    const timer = setTimeout(() => {
      preloadDashboard();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeModeProvider>
      <MockAuthProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              {/* Public Routes (Home & Login) */}
              <Route element={<Layout useStandardHeader={true} />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route 
                  path="/weight" 
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <WeightTrackerPage />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/meals" 
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <MealTrackerPage />
                    </Suspense>
                  } 
                />
              </Route>

              {/* Dashboard & Subpages (Protected) */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Layout title="Dashboard" useStandardHeader={true}>
                      <Suspense fallback={<LoadingFallback />}>
                        <Outlet />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="tasks" element={<TasksScreen />} />
                <Route path="fitness" element={<FitnessScreen />} />
                <Route path="meals" element={<MealTrackerPage />} />
                <Route path="settings" element={<SettingsScreen />} />
                <Route path="profile" element={<ProfileScreen />} />
                <Route path="development" element={<DevelopmentScreen />} />
              </Route>

              {/* Design Demo Route */}
              <Route 
                path="/terra-design" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <TerraDesignDemo />
                  </Suspense>
                } 
              />

              {/* Catch-all redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </MockAuthProvider>
    </ThemeModeProvider>
  );
}

export default App;
