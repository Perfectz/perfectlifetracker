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
import { lightTheme, darkTheme } from './theme';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import Link from '@mui/material/Link';

function App() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const activeTheme = themeMode === 'light' ? lightTheme : darkTheme;

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Perfect LifeTracker Pro
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Link 
                component={RouterLink} 
                to="/" 
                color="inherit" 
                sx={{ textDecoration: 'none' }}
              >
                Home
              </Link>
              <Link 
                component={RouterLink} 
                to="/dashboard" 
                color="inherit" 
                sx={{ textDecoration: 'none' }}
              >
                Dashboard
              </Link>
              <Button 
                onClick={toggleTheme} 
                color="inherit"
                startIcon={themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
              >
                {themeMode === 'light' ? 'Dark' : 'Light'}
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
      
      <Container>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </Container>
    </ThemeProvider>
  );
}

export default App;
