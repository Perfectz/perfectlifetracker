/**
 * frontend/src/navigation/ResponsiveNavigator.tsx
 * Responsive navigation structure that works on both desktop and mobile
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useMediaQuery } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import { terraColors } from '../theme';

// Desktop components
import Header from '../components/Header';
import TerraAppBar from '../components/TerraAppBar';
import TerraLeftNavigation from '../components/TerraLeftNavigation';
import TerraBottomNavigation from '../components/TerraBottomNavigation';

// Universal screens
import UniversalHomeScreen from '../screens/UniversalHomeScreen';
// Other screens will be converted to universal versions
import FitnessScreen from '../screens/FitnessScreen';
import DevelopmentScreen from '../screens/DevelopmentScreen';
import TasksScreen from '../screens/TasksScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FileUploadDemo from '../pages/FileUploadDemo';
import DashboardPage from '../pages/DashboardPage';
import TestPage from '../pages/TestPage';
import BasicPage from '../pages/BasicPage';

// Auth context and hook
import { useAuth } from '../hooks/useAuth';

// Error Boundary component to catch navigation errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Navigation error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h2>Something went wrong with the navigation.</h2>
          <p>Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>Refresh</button>
          <p>Error: {this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Debounce function to prevent multiple resize triggers
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: number | undefined;
  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * Responsive navigator component that adapts to desktop or mobile layouts
 */
const ResponsiveNavigator: React.FC = () => {
  // In development mode, we'll use a simulated authentication state
  // This allows testing the UI without a backend
  const isDevelopment = import.meta.env.MODE === 'development';
  const { isAuthenticated: authState } = useAuth();
  
  // During development, override the auth state for UI testing
  // This lets us test the authenticated UI even if auth services aren't available
  const [devModeAuthenticated, setDevModeAuthenticated] = useState(() => {
    // Check local storage for saved dev auth state
    const savedState = localStorage.getItem('devModeAuthenticated');
    return savedState ? savedState === 'true' : true; // Default to true in dev mode
  });

  // Let the dev toggle auth state via browser console for testing:
  // window.toggleAuth() in browser console
  useEffect(() => {
    if (isDevelopment) {
      // Add a global function to toggle auth state from browser console
      (window as any).toggleAuth = () => {
        const newState = !devModeAuthenticated;
        setDevModeAuthenticated(newState);
        localStorage.setItem('devModeAuthenticated', String(newState));
        console.log(`Development mode auth state: ${newState ? 'Authenticated' : 'Logged out'}`);
      };
      
      // Cleanup
      return () => {
        delete (window as any).toggleAuth;
      };
    }
  }, [isDevelopment, devModeAuthenticated]);
  
  // Use the real auth state in production, dev override in development
  const isAuthenticated = isDevelopment ? devModeAuthenticated : authState;
  
  const [activeItem, setActiveItem] = useState('dashboard');
  const [layoutMode, setLayoutMode] = useState<'mobile' | 'desktop'>('desktop');
  
  // Use useMediaQuery but don't directly use its value for rendering
  const isMobileQuery = useMediaQuery('(max-width:768px)');
  
  // Update layout mode with debounce to prevent rapid changes
  const updateLayoutMode = useCallback(
    debounce((isMobile: boolean) => {
      setLayoutMode(isMobile ? 'mobile' : 'desktop');
    }, 250),
    []
  );
  
  // Effect to handle resize only when the query result changes
  useEffect(() => {
    updateLayoutMode(isMobileQuery);
  }, [isMobileQuery, updateLayoutMode]);
  
  // Handle navigation item click
  const handleNavItemClick = (item: string) => {
    setActiveItem(item);
  };

  // Determine if mobile based on state, not directly from the query
  const isMobile = layoutMode === 'mobile';

  return (
    <ErrorBoundary>
      {isAuthenticated ? (
        // Authenticated layout
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          {/* Top navigation */}
          <TerraAppBar />
          
          {/* Main content area with side or bottom navigation based on screen size */}
          <div style={{ 
            display: 'flex', 
            flexGrow: 1,
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Side navigation for desktop */}
            {!isMobile && (
              <div style={{ width: '240px', height: '100%' }}>
                <TerraLeftNavigation 
                  activeItem={activeItem}
                  onItemClick={handleNavItemClick}
                />
              </div>
            )}
            
            {/* Main content */}
            <div style={{ 
              flexGrow: 1, 
              overflow: 'auto',
              padding: isMobile ? '16px' : '24px',
              backgroundColor: terraColors.pearl
            }}>
              <Routes>
                <Route path="/" element={<BasicPage />} />
                <Route path="/basic" element={<BasicPage />} />
                <Route path="/test" element={<TestPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/home" element={<UniversalHomeScreen />} />
                <Route path="/fitness" element={<FitnessScreen />} />
                <Route path="/development" element={<DevelopmentScreen />} />
                <Route path="/tasks" element={<TasksScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/settings" element={<SettingsScreen />} />
                <Route path="/file-upload" element={<FileUploadDemo />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
          
          {/* Bottom navigation for mobile */}
          {isMobile && (
            <TerraBottomNavigation 
              activeItem={activeItem}
              onItemClick={handleNavItemClick}
            />
          )}
        </div>
      ) : (
        // Unauthenticated layout
        <div style={{ height: '100vh' }}>
          <Header />
          <div style={{ 
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {isDevelopment && (
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <p>Development Mode: Authentication bypassed</p>
                <button 
                  onClick={() => setDevModeAuthenticated(true)}
                  style={{
                    padding: '8px 16px',
                    margin: '10px',
                    background: '#4285F4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Enter Dashboard (Dev Mode)
                </button>
              </div>
            )}
            <Routes>
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};

export default ResponsiveNavigator; 