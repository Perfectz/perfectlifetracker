/**
 * frontend/src/components/RegisterModal.tsx
 * Registration dialog modal component for new user sign-up
 */
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { useAuth } from '../services/AuthContext';
import { useAuthModals } from '../hooks/useAuthModals';

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ open, onClose }) => {
  const { signInWithMicrosoft } = useAuth();
  const { closeAllModals } = useAuthModals();

  const handleRegister = () => {
    onClose();
    closeAllModals();
    // Using Microsoft sign-in as it includes the registration flow
    signInWithMicrosoft();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="register-dialog-title">
      <DialogTitle id="register-dialog-title">Create an Account</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Don't have an account? Sign up to start using Perfect LifeTracker Pro.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="secondary" onClick={handleRegister}>
          Register
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterModal;
