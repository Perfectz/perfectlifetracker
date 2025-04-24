import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../common/NavBar';
import ThemeToggle from '../common/ThemeToggle';
import Box from '@mui/material/Box';

/**
 * AppLayout provides a consistent layout with navigation and theme toggle
 * for all authenticated routes in the application
 */
const AppLayout: React.FC = () => {
  return (
    <>
      <NavBar />
      <div className="theme-toggle-container">
        <ThemeToggle />
      </div>
      
      <Box 
        component="main" 
        className="app-content"
        sx={{ 
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 240px)` },
          ml: { md: '240px' },
          mt: 8, // Space for AppBar
          mb: { xs: 7, md: 0 }, // Space for BottomNavigation on mobile
        }}
      >
        <div className="page-transition">
          <Outlet />
        </div>
      </Box>
    </>
  );
};

export default AppLayout; 