/**
 * frontend/src/App.tsx
 * Main application component with theme provider, routing, and navigation
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { ThemeModeProvider } from './theme';
import { MockAuthProvider } from './services/MockAuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import WeightTrackerPage from './pages/WeightTrackerPage';
import MealTrackerPage from './pages/MealTrackerPage';

// Temporary placeholder components for the dashboard sub-routes
const TasksPage = () => <div>Tasks Page - Coming Soon</div>;
const FitnessPage = () => <div>Fitness Page - Coming Soon</div>;
const SettingsPage = () => <div>Settings Page - Coming Soon</div>;
const ProfilePage = () => <div>Profile Page - Coming Soon</div>;

function App() {
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
                <Route path="/weight" element={<WeightTrackerPage />} />
                <Route path="/meals" element={<MealTrackerPage />} />
              </Route>

              {/* Dashboard & Subpages (Protected) */}
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <Layout title="Dashboard" useStandardHeader={true}>
                    <Outlet />
                  </Layout>
                </ProtectedRoute>
              }>
                <Route index element={<DashboardPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="fitness" element={<WeightTrackerPage />} />
                <Route path="meals" element={<MealTrackerPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

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
