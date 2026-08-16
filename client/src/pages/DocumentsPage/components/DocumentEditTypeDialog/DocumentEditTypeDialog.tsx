import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, TextField,
} from '@mui/material';
import type { MedicalDocument, DocumentTypeEnum } from '../../../../api/medical-documents';
import { DOC_TYPE_OPTIONS } from '../../utils';

interface Props {
  document: MedicalDocument | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: (nextType: DocumentTypeEnum) => void;
}

export const DocumentEditTypeDialog: React.FC<Props> = ({ document, busy, onClose, onConfirm }) => {
  const [documentType, setDocumentType] = useState<DocumentTypeEnum>('LAB_RESULT');

  useEffect(() => {
    if (document) setDocumentType(document.documentType ?? 'LAB_RESULT');
  }, [document]);

  return (
    <Dialog open={!!document} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth dir="rtl">
      <DialogTitle>עריכת סוג מסמך</DialogTitle>
      <DialogContent>
        <TextField
          select
          fullWidth
          size="small"
          label="סוג מסמך"
          value={documentType}
          onChange={e => setDocumentType(e.target.value as DocumentTypeEnum)}
          sx={{ mt: 1 }}
        >
          {DOC_TYPE_OPTIONS.map(option => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={busy}>ביטול</Button>
        <Button variant="contained" onClick={() => onConfirm(documentType)} disabled={busy}>
          {busy ? 'שומר...' : 'שמור'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentEditTypeDialog;
