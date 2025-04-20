import React from 'react';
import './App.css';

// Import custom components
import SignInButton from './components/auth/SignInButton';
import SignOutButton from './components/auth/SignOutButton';
import ProfileContent from './components/profile/ProfileContent';
import { useAuth } from './authContext';

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
        {!isAuthenticated ? (
          <div className="welcome-container">
            <h2>Welcome to LifeTracker Pro</h2>
            <p>Please sign in to access your profile and track your progress.</p>
          </div>
        ) : (
          <ProfileContent />
        )}
      </main>
    </div>
  );
}

export default App; 