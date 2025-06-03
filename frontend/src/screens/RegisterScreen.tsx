/**
 * frontend/src/screens/RegisterScreen.tsx
 * Registration screen for new users
 */
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Container,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { terraColors } from '../theme';
import type { StackScreenProps } from '@react-navigation/stack';
import type { MainTabParamList } from '../navigation/AppNavigator';

// Import authentication hook
import { useAuth } from '../hooks/useAuth';

type RegisterScreenProps = StackScreenProps<MainTabParamList, 'Register'>;

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { signIn, signInWithMicrosoft, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });

    // Clear errors when user types
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: '',
      });
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeToTerms) {
      errors.terms = 'You must agree to the terms and conditions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    // Registration logic would go here
    console.log('Register with:', formData);
  };

  const handleMicrosoftLogin = async () => {
    await signInWithMicrosoft();
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
          <Typography variant="h5" sx={{ color: terraColors.prussianBlue, mb: 3 }}>
            Create an Account
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, width: '100%', mb: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              variant="outlined"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
            />

            <TextField
              fullWidth
              label="Last Name"
              variant="outlined"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
            />
          </Box>

          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            margin="normal"
            error={!!formErrors.email}
            helperText={formErrors.email}
          />

          <TextField
            fullWidth
            label="Password"
            variant="outlined"
            type={isPasswordVisible ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange('password')}
            margin="normal"
            error={!!formErrors.password}
            helperText={formErrors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    edge="end"
                  >
                    {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            variant="outlined"
            type={isConfirmPasswordVisible ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            margin="normal"
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    edge="end"
                  >
                    {isConfirmPasswordVisible ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={agreeToTerms}
                onChange={() => setAgreeToTerms(!agreeToTerms)}
                sx={{
                  color: terraColors.softTeal,
                  '&.Mui-checked': {
                    color: terraColors.tropicalRain,
                  },
                }}
              />
            }
            label="I agree to the terms and conditions"
            sx={{ mt: 2, alignSelf: 'flex-start' }}
          />

          {formErrors.terms && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {formErrors.terms}
            </Typography>
          )}

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={handleRegister}
            disabled={isLoading}
            sx={{
              mt: 3,
              mb: 2,
              bgcolor: terraColors.tropicalRain,
              '&:hover': {
                bgcolor: terraColors.softTeal,
              },
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            sx={{ mb: 2 }}
          >
            Sign up with Microsoft
          </Button>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: terraColors.maastrichtBlue }}>
              Already have an account?
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
              onClick={() => navigation?.navigate && navigation.navigate('Login')}
            >
              Login here
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterScreen;
