import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Button, Box, Typography, Container } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { lightTheme, darkTheme } from './theme';

function App() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const activeTheme = themeMode === 'light' ? lightTheme : darkTheme;

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ 
          my: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          minHeight: '100vh'
        }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Perfect LifeTracker Pro
          </Typography>
          
          <Button 
            onClick={toggleTheme} 
            color="primary" 
            variant="contained"
            startIcon={themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            sx={{ mt: 2 }}
          >
            Switch to {themeMode === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
          
          <Typography sx={{ mt: 4 }}>
            Welcome to Perfect LifeTracker Pro! Your theme is currently set to {themeMode} mode.
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
