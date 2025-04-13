/**
 * frontend/src/components/TerraBottomNavigation.tsx
 * Bottom navigation component for mobile view
 */
import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SchoolIcon from '@mui/icons-material/School';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { terraColors } from '../../src/theme';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: <HomeIcon />,
    path: '/dashboard',
  },
  {
    id: 'fitness',
    label: 'Fitness',
    icon: <FitnessCenterIcon />,
    path: '/fitness',
  },
  {
    id: 'development',
    label: 'Develop',
    icon: <SchoolIcon />,
    path: '/development',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: <ChecklistIcon />,
    path: '/tasks',
  },
  {
    id: 'fileUpload',
    label: 'Upload',
    icon: <CloudUploadIcon />,
    path: '/file-upload',
  },
];

// Styled BottomNavigationAction for Terra colors
const TerraBottomNavigationAction = styled(BottomNavigationAction)(({ theme }) => ({
  color: terraColors.softTeal,
  '&.Mui-selected': {
    color: terraColors.tropicalRain,
  },
  minWidth: 64,
}));

// Styled BottomNavigation container
const TerraBottomNavigationContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: 56,
  borderTop: `1px solid ${terraColors.softTeal}20`,
  zIndex: theme.zIndex.appBar,
}));

interface TerraBottomNavigationProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

const TerraBottomNavigationComponent: React.FC<TerraBottomNavigationProps> = ({
  activeItem,
  onItemClick,
}) => {
  const navigate = useNavigate();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    onItemClick(newValue);
    const selectedItem = navigationItems.find(item => item.id === newValue);
    if (selectedItem) {
      navigate(selectedItem.path);
    }
  };

  return (
    <TerraBottomNavigationContainer elevation={3}>
      <BottomNavigation
        value={activeItem}
        onChange={handleChange}
        showLabels
        sx={{
          backgroundColor: '#ffffff',
          height: '100%',
        }}
      >
        {navigationItems.map(item => (
          <TerraBottomNavigationAction
            key={item.id}
            label={item.label}
            value={item.id}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </TerraBottomNavigationContainer>
  );
};

export default TerraBottomNavigationComponent;
