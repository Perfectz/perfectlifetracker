/**
 * frontend/src/components/AuthModals.tsx
 * Controller component for managing authentication modals with context API
 */
import React from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import ResetPasswordModal from './ResetPasswordModal';
import { useAuthModals, ModalType } from '../hooks/useAuthModals';

const AuthModals = () => {
  const { activeModal, closeAllModals } = useAuthModals();

  const handleClose = () => {
    closeAllModals();
  };

  return (
    <>
      <LoginModal open={activeModal === ModalType.LOGIN} onClose={handleClose} />

      <RegisterModal open={activeModal === ModalType.REGISTER} onClose={handleClose} />

      <ResetPasswordModal open={activeModal === ModalType.RESET_PASSWORD} onClose={handleClose} />
    </>
  );
};

export default AuthModals;
