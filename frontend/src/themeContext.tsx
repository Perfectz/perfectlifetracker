import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, PaletteMode } from '@mui/material';
import { getThemeOptions } from './theme/themeConfig';

type ThemeContextType = {
  mode: PaletteMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light', 
  toggleTheme: () => { /* This will be implemented by the actual provider */ }
});

export const useThemeContext = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Check localStorage for saved theme preference or default to 'light'
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as PaletteMode) || 'light';
  });

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    
    // Add a transition effect to the body when theme changes
    document.body.style.transition = 'background-color 0.5s ease';
  }, [mode]);

  // Toggle between light and dark modes
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Create the theme based on current mode using our config
  // Memoize the theme to prevent unnecessary re-renders
  const theme = useMemo(() => createTheme(getThemeOptions(mode)), [mode]);

  // Provide both the theme context and MUI theme provider
  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 