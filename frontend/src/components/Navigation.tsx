/**
 * frontend/src/components/Navigation.tsx
 * Navigation component with theme switching and authentication state
 */
import React, { useState } from 'react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
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
import { useAuth } from '../services/MockAuthContext';
import { useThemeMode } from '../theme';
import LoginButton from './LoginButton';
import UserMenu from './UserMenu';
import Header from './Header';
import Footer from './Footer';

// Header wrapper that only shows on certain routes
const ConditionalHeader = () => {
  const location = useLocation();
  const showHeader = location.pathname === '/' || location.pathname === '/dashboard';

  if (!showHeader) return null;

  return <Header height={220} marginBottom={3} />;
};

// Navigation component with auth state
const Navigation = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/dashboard')) return null;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeMode();

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
  const availableLinks = navigationLinks.filter(link => !link.protected || isAuthenticated);

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
            startIcon={isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            fullWidth
            sx={{ justifyContent: 'flex-start' }}
          >
            {isDarkMode ? 'Light' : 'Dark'} Mode
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
            Perfect LifeTracker Pro
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
                startIcon={isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              >
                {isDarkMode ? 'Light' : 'Dark'}
              </Button>
            </Box>
          )}
          {/* Auth components */}
          <Box sx={{ ml: 2 }}>{isAuthenticated ? <UserMenu /> : <LoginButton />}</Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawer}
      </Drawer>

      <Container
        sx={{
          flexGrow: 1,
          py: 4,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Add the header back, conditionally based on route */}
        <ConditionalHeader />

        {/* Outlet renders the current route */}
        <Outlet />
      </Container>
      <Footer />
    </Box>
  );
};

export default Navigation;
