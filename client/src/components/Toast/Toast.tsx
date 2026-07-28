import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { TToastState } from '../../hooks/useToast';
import { toastAlertSx } from './Toast.styles';

export interface IToastProps {
  toast: TToastState | null;
  onClose: () => void;
  autoHideDuration?: number;
}

/**
 * Bottom-centered snackbar that renders an MUI Alert for the active toast.
 */
export const Toast: React.FC<IToastProps> = ({ toast, onClose, autoHideDuration = 3500 }) => (
  <Snackbar
    open={!!toast}
    autoHideDuration={autoHideDuration}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
  >
    <Alert severity={toast?.severity} variant="filled" onClose={onClose} sx={toastAlertSx}>
      {toast?.message}
    </Alert>
  </Snackbar>
);

export default Toast;
