/**
 * frontend/src/components/TerraAppBar.tsx
 * App bar component for Terra design
 */
import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  InputBase, 
  Avatar, 
  IconButton,
  styled,
  alpha,
  useMediaQuery,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import { terraColors } from '../theme';

// Styled search input
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 16,
  backgroundColor: terraColors.maastrichtBlue,
  '&:hover': {
    backgroundColor: alpha(terraColors.maastrichtBlue, 0.9),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: alpha(terraColors.pearl, 0.7),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: terraColors.pearl,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const TerraAppBar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: terraColors.prussianBlue,
        height: 64,
        zIndex: theme.zIndex.drawer + 1
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ 
            display: { xs: 'none', sm: 'block' },
            color: terraColors.pearl,
            fontWeight: 600
          }}
        >
          PerfectLifeTrack Pro
        </Typography>
        
        {/* Mobile Logo */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ 
            display: { xs: 'block', sm: 'none' },
            color: terraColors.pearl,
            fontWeight: 600
          }}
        >
          PLT Pro
        </Typography>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Search */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>
        
        {/* User Avatar */}
        <Avatar 
          sx={{ 
            bgcolor: terraColors.softTeal,
            color: terraColors.pearl,
            width: 32, 
            height: 32,
            fontWeight: 500
          }}
        >
          JD
        </Avatar>
      </Toolbar>
    </AppBar>
  );
};

export default TerraAppBar; 