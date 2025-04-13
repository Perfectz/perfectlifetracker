/**
 * frontend/src/components/Navigation.tsx
 * Navigation component with theme switching and authentication state
 */
import React, { useState } from 'react';
import { Routes, Route, Link as RouterLink, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
  Link,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../services/AuthContext';
import HomePage from '../pages/HomePage';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import LoginButton from './LoginButton';
import UserMenu from './UserMenu';
import ProtectedRoute from './ProtectedRoute';
import Header from './Header';

// Header wrapper that only shows on certain routes
const ConditionalHeader = () => {
  const location = useLocation();
  const showHeader = location.pathname === '/' || location.pathname === '/dashboard';
  
  if (!showHeader) return null;
  
  return <Header height={220} marginBottom={3} />;
};

// Navigation component with auth state
const Navigation = () => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const navigationLinks = [
    { text: 'Home', path: '/' },
    { text: 'Dashboard', path: '/dashboard', protected: true },
  ];

  // Filter links based on authentication state
  const availableLinks = navigationLinks.filter(
    link => !link.protected || isAuthenticated
  );

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {availableLinks.map(link => (
          <ListItem
            key={link.text}
            component={RouterLink}
            to={link.path}
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemText primary={link.text} />
          </ListItem>
        ))}
        <ListItem>
          <Button
            onClick={toggleTheme}
            color="inherit"
            startIcon={themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            fullWidth
            sx={{ justifyContent: 'flex-start' }}
          >
            {themeMode === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Perfect LifeTracker Pro - Vite Edition
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {availableLinks.map(link => (
                <Link
                  key={link.text}
                  component={RouterLink}
                  to={link.path}
                  color="inherit"
                  sx={{ textDecoration: 'none' }}
                >
                  {link.text}
                </Link>
              ))}
              <Button
                onClick={toggleTheme}
                color="inherit"
                startIcon={themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
              >
                {themeMode === 'light' ? 'Dark' : 'Light'}
              </Button>
            </Box>
          )}
          {/* Auth components */}
          <Box sx={{ ml: 2 }}>
            {isAuthenticated ? <UserMenu /> : <LoginButton />}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawer}
      </Drawer>

      <Container
        sx={{
          pt: 2,
          pb: 4,
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Add the header back, conditionally based on route */}
        <ConditionalHeader />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Container>
    </Box>
  );
};

export default Navigation; 