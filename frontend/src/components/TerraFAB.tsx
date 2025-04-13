/**
 * frontend/src/components/TerraFAB.tsx
 * Floating Action Button component using Terra color scheme
 */
import React from 'react';
import { Fab, FabProps, styled } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { terraColors } from '../../src/theme';

// Styled FAB using Terra colors
const StyledFab = styled(Fab)(({ theme }) => ({
  backgroundColor: terraColors.tropicalRain,
  color: terraColors.pearl,
  '&:hover': {
    backgroundColor: terraColors.prussianBlue,
  },
}));

interface TerraFABProps extends Omit<FabProps, 'color'> {
  icon?: React.ReactNode;
}

const TerraFAB: React.FC<TerraFABProps> = ({ icon = <AddIcon />, ...props }) => {
  return <StyledFab {...props}>{icon}</StyledFab>;
};

export default TerraFAB;
