/**
 * frontend/src/components/LoginModal.tsx
 * Login dialog modal component for authentication
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  AlertTitle,
  Divider,
  Chip,
} from '@mui/material';
import { useAuth } from '../services/AuthContext';
import { useAuthModals } from '../hooks/useAuthModals';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import InfoIcon from '@mui/icons-material/Info';
import LoopIcon from '@mui/icons-material/Loop';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../services/authConfig';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose }) => {
  const { signIn, signInWithGoogle, signInRedirect, isLoading, error } = useAuth();
  const { closeAllModals } = useAuthModals();
  const [localError, setLocalError] = useState<string | null>(null);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isRedirectLoading, setIsRedirectLoading] = useState(false);
  const [showPopupHelp, setShowPopupHelp] = useState(false);
  const [popupBlockDetected, setPopupBlockDetected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [browserInfo, setBrowserInfo] = useState<string>('');

  // Detect browser for better guidance
  useEffect(() => {
    const detectBrowser = () => {
      const userAgent = navigator.userAgent;
      let browserName = 'your browser';

      if (userAgent.match(/chrome|chromium|crios/i)) {
        browserName = 'Chrome';
      } else if (userAgent.match(/firefox|fxios/i)) {
        browserName = 'Firefox';
      } else if (userAgent.match(/safari/i)) {
        browserName = 'Safari';
      } else if (userAgent.match(/opr\//i)) {
        browserName = 'Opera';
      } else if (userAgent.match(/edg/i)) {
        browserName = 'Edge';
      }

      setBrowserInfo(browserName);
    };

    detectBrowser();
  }, []);

  // Check if popups might be blocked
  const detectPopupBlocker = (): boolean => {
    // Simple detection - check window size difference
    const heightDiff = window.outerHeight - window.innerHeight;
    if (heightDiff < 100) {
      // This is a heuristic - if toolbar is too large it may be blocking popups
      return true;
    }

    // Try a more reliable test
    try {
      const popup = window.open('about:blank', '_blank', 'width=100,height=100');
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        return true;
      }
      popup.close();
      return false;
    } catch (e) {
      return true;
    }
  };

  const handleMicrosoftSignIn = async () => {
    try {
      // Check for popup blocker first
      if (detectPopupBlocker()) {
        setPopupBlockDetected(true);
        setShowPopupHelp(true);
        setLocalError(
          `Popup blocker detected. Please allow popups for this site in ${browserInfo}.`
        );
        return;
      }

      setLocalError(null);
      setShowPopupHelp(false);
      setIsMicrosoftLoading(true);
      await signIn();
      onClose();
      closeAllModals();
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign in with Microsoft');

      // Show popup help for popup-related errors
      if (
        err.message &&
        (err.message.includes('popup') ||
          err.message.includes('blocked') ||
          err.message.includes('cancelled'))
      ) {
        setShowPopupHelp(true);
        setPopupBlockDetected(true);
      }
    } finally {
      setIsMicrosoftLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Check for popup blocker first
      if (detectPopupBlocker()) {
        setPopupBlockDetected(true);
        setShowPopupHelp(true);
        setLocalError(
          `Popup blocker detected. Please allow popups for this site in ${browserInfo}.`
        );
        return;
      }

      setLocalError(null);
      setShowPopupHelp(false);
      setIsGoogleLoading(true);
      await signInWithGoogle();
      onClose();
      closeAllModals();
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign in with Google');

      // Show popup help for popup-related errors
      if (
        err.message &&
        (err.message.includes('popup') ||
          err.message.includes('blocked') ||
          err.message.includes('cancelled'))
      ) {
        setShowPopupHelp(true);
        setPopupBlockDetected(true);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRedirectSignIn = async () => {
    try {
      setLocalError(null);
      setIsRedirectLoading(true);
      await signInRedirect();
      // Note: This won't reach this point as redirect will navigate away
    } catch (err: any) {
      setLocalError(err.message || 'Failed to start redirect sign in');
    } finally {
      setIsRedirectLoading(false);
    }
  };

  const handleRetry = async () => {
    setRetryCount(count => count + 1);
    setLocalError(null);
    setShowPopupHelp(false);

    // Use different timeout and positioning on retry
    try {
      const msalInstance = new PublicClientApplication(msalConfig);
      const loginRequest = {
        scopes: ['openid', 'profile', 'User.Read'],
        prompt: 'select_account',
        popupWindowAttributes: {
          popupSize: { width: 800, height: 600 },
          popupPosition: { top: 100, left: 100 },
        },
      };

      const result = await msalInstance.loginPopup(loginRequest);
      if (result) {
        window.location.reload(); // Reload page to update auth state
      }
    } catch (err: any) {
      setLocalError(`Retry failed: ${err.message}`);
      setShowPopupHelp(true);
    }
  };

  // Display either the global error from auth context or the local error
  const displayError = localError || error;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="login-dialog-title"
      maxWidth="sm"
      fullWidth
      disableScrollLock={false}
    >
      <DialogTitle id="login-dialog-title">Sign In</DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          Please sign in to continue using Perfect LifeTracker Pro.
        </Typography>

        {displayError && (
          <Alert severity="error" sx={{ my: 2 }}>
            <AlertTitle>Sign-in Error</AlertTitle>
            {displayError}
          </Alert>
        )}

        {showPopupHelp && (
          <Alert severity="info" sx={{ my: 2 }} icon={<InfoIcon />}>
            <AlertTitle>Popup Window Tips</AlertTitle>
            <Typography variant="body2" component="div">
              <strong>Having trouble with the sign-in popup?</strong> Please ensure:
              <ul>
                <li>Popups are allowed for this site in your browser settings</li>
                <li>Don't close the popup window before completing sign-in</li>
                <li>Check if your popup blocker is active (look for an icon in the address bar)</li>
                <li>If using Google account, complete the entire sign-in flow in the popup</li>
              </ul>
            </Typography>
            <Divider sx={{ my: 1 }} />
            {browserInfo && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>For {browserInfo} users:</strong> Check the address bar for popup blocking
                indicators.
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                size="small"
                startIcon={<LoopIcon />}
                variant="outlined"
                onClick={handleRetry}
                disabled={isLoading || isMicrosoftLoading || isGoogleLoading || isRedirectLoading}
              >
                Retry Sign-in
              </Button>
              <Button
                size="small"
                startIcon={<OpenInNewIcon />}
                variant="outlined"
                onClick={handleRedirectSignIn}
                disabled={isLoading || isMicrosoftLoading || isGoogleLoading || isRedirectLoading}
              >
                Use Redirect Sign-in
              </Button>
            </Box>
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            startIcon={!isMicrosoftLoading && <MicrosoftIcon />}
            onClick={handleMicrosoftSignIn}
            disabled={isLoading || isMicrosoftLoading || isGoogleLoading || isRedirectLoading}
            fullWidth
            sx={{
              backgroundColor: '#2F2F2F',
              '&:hover': {
                backgroundColor: '#1E1E1E',
              },
              height: '48px',
            }}
          >
            {isMicrosoftLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign in with Microsoft'
            )}
          </Button>

          <Button
            variant="contained"
            startIcon={!isGoogleLoading && <GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={isLoading || isMicrosoftLoading || isGoogleLoading || isRedirectLoading}
            fullWidth
            sx={{
              backgroundColor: '#4285F4',
              '&:hover': {
                backgroundColor: '#357AE8',
              },
              height: '48px',
            }}
          >
            {isGoogleLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign in with Google'
            )}
          </Button>

          {popupBlockDetected && (
            <Button
              variant="outlined"
              startIcon={<OpenInNewIcon />}
              onClick={handleRedirectSignIn}
              disabled={isLoading || isMicrosoftLoading || isGoogleLoading || isRedirectLoading}
              fullWidth
              sx={{ height: '48px' }}
            >
              {isRedirectLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign in with Redirect (No Popup)'
              )}
            </Button>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginModal;
