import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface IRoleMismatchDialogProps {
  open: boolean;
  onConfirm: () => void;
}

export const RoleMismatchDialog: React.FC<IRoleMismatchDialogProps> = ({ open, onConfirm }) => (
  <Dialog open={open} dir="rtl" maxWidth="xs" fullWidth>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 36, height: 36, borderRadius: '10px', bgcolor: '#fff4e6',
          color: '#e8590c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <WarningAmberIcon fontSize="small" />
      </Box>
      בעיית הרשאות
    </DialogTitle>
    <DialogContent>
      <DialogContentText sx={{ color: '#495057' }}>
        זוהתה בעיה בהרשאות המשתמש. עליך להתחבר מחדש כדי להמשיך.
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onConfirm} variant="contained" sx={{ borderRadius: 2, fontWeight: 600 }}>
        התחברות מחדש
      </Button>
    </DialogActions>
  </Dialog>
);

export default RoleMismatchDialog;
