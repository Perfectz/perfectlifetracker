/**
 * frontend/src/components/ResetPasswordModal.tsx
 * Password reset dialog modal component for forgotten passwords
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

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ open, onClose }) => {
  const { signInWithMicrosoft } = useAuth();
  const { closeAllModals } = useAuthModals();

  const handleReset = () => {
    onClose();
    closeAllModals();
    // Using Microsoft sign-in as it includes the password reset flow
    signInWithMicrosoft();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="reset-dialog-title">
      <DialogTitle id="reset-dialog-title">Reset Password</DialogTitle>
      <DialogContent dividers>
        <Typography>Forgot your password? Click the button below to reset it.</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="primary" onClick={handleReset}>
          Reset Password
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordModal;
