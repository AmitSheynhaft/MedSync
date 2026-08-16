import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
} from '@mui/material';
import type { MedicalDocument } from '../../../../api/medical-documents';

interface Props {
  document: MedicalDocument | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DocumentDeleteDialog: React.FC<Props> = ({ document, busy, onClose, onConfirm }) => (
  <Dialog open={!!document} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth dir="rtl">
    <DialogTitle>מחיקת מסמך</DialogTitle>
    <DialogContent>
      <Typography sx={{ fontSize: 14, color: '#495057' }}>
        האם למחוק את המסמך "{document?.fileName}"? פעולה זו אינה ניתנת לשחזור.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} disabled={busy}>ביטול</Button>
      <Button variant="contained" color="error" onClick={onConfirm} disabled={busy}>
        {busy ? 'מוחק...' : 'מחק'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default DocumentDeleteDialog;
