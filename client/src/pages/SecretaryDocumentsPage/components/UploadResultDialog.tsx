import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { UploadResult } from '../hooks/useSecretaryDocumentUpload';
import { UPLOAD_RESULT_CONTENT } from '../utils';

interface IUploadResultDialogProps {
  result: UploadResult | null;
  onClose: () => void;
}

export const UploadResultDialog: React.FC<IUploadResultDialogProps> = ({ result, onClose }) => {
  const isSuccess = result === 'success';
  const content = result ? UPLOAD_RESULT_CONTENT[result] : null;

  return (
    <Dialog open={Boolean(result)} onClose={onClose} dir="rtl" maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 36, height: 36, borderRadius: '10px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            bgcolor: isSuccess ? '#e7f5e9' : '#ffe3e3',
            color: isSuccess ? '#2f9e44' : '#e03131',
          }}
        >
          {isSuccess ? <CheckCircleIcon fontSize="small" /> : <WarningAmberIcon fontSize="small" />}
        </Box>
        {content?.title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: '#495057' }}>{content?.message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2, fontWeight: 600 }}>
          סגור
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadResultDialog;
