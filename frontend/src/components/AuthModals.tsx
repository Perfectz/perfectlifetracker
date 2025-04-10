/**
 * frontend/src/components/AuthModals.tsx
 * Controller component for managing authentication modals with Redux
 */
import React, { useState } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import ResetPasswordModal from './ResetPasswordModal';
// import { useAppSelector, useAppDispatch } from '../hooks/redux';
// import { closeAuthModal } from '../store/authSlice';

// Temporary enum to replace Redux state
enum ModalType {
  NONE = 'none',
  LOGIN = 'login',
  REGISTER = 'register',
  RESET_PASSWORD = 'resetPassword',
}

const AuthModals = () => {
  // const dispatch = useAppDispatch();
  // const { showLoginModal, showRegisterModal, showResetModal } = useAppSelector(state => state.auth);
  const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);

  const handleClose = () => {
    // dispatch(closeAuthModal());
    setActiveModal(ModalType.NONE);
  };

  return (
    <>
      <LoginModal
        open={activeModal === ModalType.LOGIN}
        onClose={handleClose}
      />
      
      <RegisterModal
        open={activeModal === ModalType.REGISTER}
        onClose={handleClose}
      />
      
      <ResetPasswordModal
        open={activeModal === ModalType.RESET_PASSWORD}
        onClose={handleClose}
      />
    </>
  );
};

export default AuthModals; 