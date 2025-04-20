import React, { Suspense, lazy } from 'react';
import './App.css';

// Import lightweight components directly
import SignInButton from './components/auth/SignInButton';
import SignOutButton from './components/auth/SignOutButton';
import { useAuth } from './authContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy-load heavier components
const ProfileContent = lazy(() => import('./components/profile/ProfileContent'));

// Simple loading spinner component
const Spinner = () => (
  <div className="spinner">
    <div className="spinner-circle"></div>
    <p>Loading...</p>
  </div>
);

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Loading authentication state...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>LifeTracker Pro</h1>
        <div className="auth-buttons">
          {!isAuthenticated ? (
            <SignInButton />
          ) : (
            <SignOutButton />
          )}
        </div>
      </header>

      <main className="app-content">
        <ErrorBoundary>
          {!isAuthenticated ? (
            <div className="welcome-container">
              <h2>Welcome to LifeTracker Pro</h2>
              <p>Please sign in to access your profile and track your progress.</p>
            </div>
          ) : (
            <Suspense fallback={<Spinner />}>
              <ProfileContent />
            </Suspense>
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App; 