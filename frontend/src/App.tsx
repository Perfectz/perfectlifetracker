/**
 * frontend/src/App.tsx
 * Main application component with theme provider, routing, and navigation
 */
import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { responsiveLightTheme, responsiveDarkTheme } from './theme';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import TerraDesignDemo from './pages/TerraDesignDemo';
import Link from '@mui/material/Link';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const activeTheme = themeMode === 'light' ? responsiveLightTheme : responsiveDarkTheme;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleDrawer = (open: boolean) => 
    (event: React.KeyboardEvent | React.MouseEvent) => {
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
    { text: 'Dashboard', path: '/dashboard' },
    { text: 'Terra Design', path: '/terra-design' },
  ];

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {navigationLinks.map((link) => (
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
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
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
                {navigationLinks.map((link) => (
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
          </Toolbar>
        </AppBar>
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Container sx={{ 
        pt: 2, 
        pb: 4, 
        minHeight: 'calc(100vh - 64px)', 
        display: 'flex',
        flexDirection: 'column'
      }}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/terra-design" element={<TerraDesignDemo />} />
          </Routes>
        </ErrorBoundary>
      </Container>
    </ThemeProvider>
  );
}

export default App;
