import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Typography,
} from '@mui/material';
import { Clinic, ClinicInput } from '../../../api/clinics';
import {
  clinicDialogActionsSx,
  clinicDialogErrorSx,
  clinicDialogStackSx,
  clinicDialogTitleSx,
} from './ClinicFormDialog.styles';

interface Props {
  open: boolean;
  clinic?: Clinic;
  onClose: () => void;
  onSave: (input: ClinicInput) => Promise<void>;
}

const ClinicFormDialog: React.FC<Props> = ({ open, clinic, onClose, onSave }) => {
  const [name,     setName]     = useState('');
  const [address,  setAddress]  = useState('');
  const [nameError, setNameError] = useState('');
  const [apiError, setApiError] = useState('');
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(clinic?.name ?? '');
    setAddress(clinic?.address ?? '');
    setNameError('');
    setApiError('');
  }, [open, clinic]);

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError('שם מרפאה הוא שדה חובה');
      return;
    }
    if (name.trim().length < 2) {
      setNameError('שם חייב להכיל לפחות 2 תווים');
      return;
    }
    setSaving(true);
    setApiError('');
    try {
      await onSave({ name: name.trim(), address: address.trim() || undefined });
    } catch {
      setApiError('השמירה נכשלה, נסה שוב');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={clinicDialogTitleSx}>
        {clinic ? 'עריכת מרפאה' : 'מרפאה חדשה'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={clinicDialogStackSx}>
          <TextField
            label="שם מרפאה"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(''); }}
            fullWidth
            size="small"
            required
            error={!!nameError}
            helperText={nameError}
          />
          <TextField
            label="כתובת"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            fullWidth
            size="small"
          />
          {apiError && (
            <Typography sx={clinicDialogErrorSx}>{apiError}</Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={clinicDialogActionsSx}>
        <Button onClick={onClose} disabled={saving}>ביטול</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'שומר...' : 'שמור'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClinicFormDialog;
