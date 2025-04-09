/**
 * frontend/src/components/TerraLeftNavigation.tsx
 * Left navigation component for desktop view
 */
import React from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  styled
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SchoolIcon from '@mui/icons-material/School';
import ChecklistIcon from '@mui/icons-material/Checklist';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import { terraColors } from '../theme';

const drawerWidth = 200;

interface NavigationItem {
  id: string;
  text: string;
  icon: React.ReactNode;
  path: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/terra-design'
  },
  {
    id: 'fitness',
    text: 'Fitness',
    icon: <FitnessCenterIcon />,
    path: '/fitness'
  },
  {
    id: 'development',
    text: 'Development',
    icon: <SchoolIcon />,
    path: '/development'
  },
  {
    id: 'tasks',
    text: 'Tasks',
    icon: <ChecklistIcon />,
    path: '/tasks'
  },
  {
    id: 'analytics',
    text: 'Analytics',
    icon: <BarChartIcon />,
    path: '/analytics'
  }
];

// Settings is separate to create a divider above it
const settingsItem: NavigationItem = {
  id: 'settings',
  text: 'Settings',
  icon: <SettingsIcon />,
  path: '/settings'
};

interface TerraLeftNavigationProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

// Styled ListItemButton for custom hover and selected states
const TerraListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 4,
  margin: '4px 8px',
  '&.Mui-selected': {
    backgroundColor: `${terraColors.tropicalRain}20`,
    color: terraColors.tropicalRain,
    '& .MuiListItemIcon-root': {
      color: terraColors.tropicalRain,
    },
    '&:hover': {
      backgroundColor: `${terraColors.tropicalRain}30`,
    },
  },
  '&:hover': {
    backgroundColor: `${terraColors.softTeal}20`,
  },
}));

const TerraLeftNavigation: React.FC<TerraLeftNavigationProps> = ({
  activeItem,
  onItemClick,
}) => {
  const navigate = useNavigate();

  const handleItemClick = (item: NavigationItem) => {
    onItemClick(item.id);
    navigate(item.path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: terraColors.pearl,
          borderRight: `1px solid ${terraColors.softTeal}20`,
          pt: 1,
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: '64px' }}>
        <List>
          {navigationItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <TerraListItemButton
                selected={activeItem === item.id}
                onClick={() => handleItemClick(item)}
              >
                <ListItemIcon
                  sx={{
                    color: activeItem === item.id 
                      ? terraColors.tropicalRain 
                      : terraColors.prussianBlue,
                    minWidth: 40
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: activeItem === item.id ? 500 : 400,
                  }}
                />
              </TerraListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 1, borderColor: `${terraColors.softTeal}30` }} />
        <List>
          <ListItem disablePadding>
            <TerraListItemButton
              selected={activeItem === settingsItem.id}
              onClick={() => handleItemClick(settingsItem)}
            >
              <ListItemIcon
                sx={{
                  color: activeItem === settingsItem.id 
                    ? terraColors.tropicalRain 
                    : terraColors.prussianBlue,
                  minWidth: 40
                }}
              >
                {settingsItem.icon}
              </ListItemIcon>
              <ListItemText 
                primary={settingsItem.text}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: activeItem === settingsItem.id ? 500 : 400,
                }}
              />
            </TerraListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default TerraLeftNavigation; 