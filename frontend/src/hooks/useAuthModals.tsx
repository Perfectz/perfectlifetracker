/**
 * frontend/src/hooks/useAuthModals.tsx
 * Custom hook for managing authentication modals using Context instead of Redux
 */
import React, { createContext, useState, useContext, ReactNode } from 'react';
// import { useAppDispatch } from './redux';
// import { openLoginModal, openRegisterModal, openResetModal, closeAuthModal } from '../store/authSlice';
import AuthModals from '../components/AuthModals';

// Define a Modal type enum for our context
export enum ModalType {
  NONE = 'none',
  LOGIN = 'login',
  REGISTER = 'register',
  RESET_PASSWORD = 'resetPassword',
}

interface AuthModalsContextType {
  openLoginModal: () => void;
  openRegisterModal: () => void;
  openResetPasswordModal: () => void;
  closeAllModals: () => void;
  activeModal: ModalType;
}

const AuthModalsContext = createContext<AuthModalsContextType | undefined>(undefined);

interface AuthModalsProviderProps {
  children: ReactNode;
}

// Provider component that includes auth modals
export const AuthModalsProvider: React.FC<AuthModalsProviderProps> = ({ children }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);

  const openLoginModal = () => setActiveModal(ModalType.LOGIN);
  const openRegisterModal = () => setActiveModal(ModalType.REGISTER);
  const openResetPasswordModal = () => setActiveModal(ModalType.RESET_PASSWORD);
  const closeAllModals = () => setActiveModal(ModalType.NONE);

  return (
    <AuthModalsContext.Provider
      value={{
        openLoginModal,
        openRegisterModal,
        openResetPasswordModal,
        closeAllModals,
        activeModal,
      }}
    >
      {children}
      <AuthModals />
    </AuthModalsContext.Provider>
  );
};

// Hook that returns functions to control the auth modals
export const useAuthModals = () => {
  const context = useContext(AuthModalsContext);

  if (context === undefined) {
    throw new Error('useAuthModals must be used within an AuthModalsProvider');
  }

  return context;

  // Original Redux implementation
  // const dispatch = useAppDispatch();
  // return {
  //   openLoginModal: () => dispatch(openLoginModal()),
  //   openRegisterModal: () => dispatch(openRegisterModal()),
  //   openResetPasswordModal: () => dispatch(openResetModal()),
  //   closeAllModals: () => dispatch(closeAuthModal())
  // };
};

export default useAuthModals;
