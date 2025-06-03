/**
 * frontend/src/screens/LoginScreen.tsx
 * Login screen for user authentication (web version)
 */
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  InputAdornment,
  Container,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { terraColors } from '../theme';
import type { StackScreenProps } from '@react-navigation/stack';
import type { MainTabParamList } from '../navigation/AppNavigator';

// Import authentication hook
import { useAuth } from '../hooks/useAuth';

type LoginScreenProps = StackScreenProps<MainTabParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { signIn, signInWithMicrosoft, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (email.trim() === '' || password.trim() === '') {
      return;
    }
    await signIn();
  };

  const handleMicrosoftLogin = async () => {
    await signInWithMicrosoft();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: terraColors.pearl,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Perfect LifeTracker Pro"
              sx={{ width: 80, height: 80, mb: 2 }}
            />
            <Typography variant="h5" sx={{ color: terraColors.prussianBlue, mb: 1 }}>
              Perfect LifeTracker Pro
            </Typography>
            <Typography variant="body2" sx={{ color: terraColors.maastrichtBlue }}>
              Manage your life with excellence
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={email}
            onChange={e => setEmail(e.target.value)}
            margin="normal"
            type="email"
            autoComplete="email"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Password"
            variant="outlined"
            value={password}
            onChange={e => setPassword(e.target.value)}
            margin="normal"
            type={isPasswordVisible ? 'text' : 'password'}
            autoComplete="current-password"
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleLogin}
            disabled={isLoading}
            sx={{
              mb: 2,
              bgcolor: terraColors.tropicalRain,
              '&:hover': {
                bgcolor: terraColors.softTeal,
              },
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            sx={{ mb: 2 }}
          >
            Sign in with Microsoft
          </Button>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: terraColors.maastrichtBlue }}>
              Don't have an account?
            </Typography>
            <Typography
              variant="body2"
              sx={{
                ml: 1,
                color: terraColors.tropicalRain,
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
              onClick={() => navigation?.navigate && navigation.navigate('Register')}
            >
              Register here
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginScreen;
