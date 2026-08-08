import React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { Slot } from '../../../api/slots';
import { formatSlotDate } from '../../../utils/format';
import { CancelDialogActions } from '../styled';

type CancelSlotDialogProps = {
  slot: Slot;
  cancelling: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export const CancelSlotDialog: React.FC<CancelSlotDialogProps> = ({
  slot,
  cancelling,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open
      onClose={cancelling ? undefined : onClose}
      dir="rtl"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>ביטול תור</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: '#495057' }}>
          האם לבטל את התור עם <strong>{slot.therapist.fullName}</strong> בתאריך{' '}
          {formatSlotDate(slot.date)} בשעה {slot.time}?
        </DialogContentText>
      </DialogContent>
      <CancelDialogActions>
        <Button onClick={onClose} disabled={cancelling}>סגור</Button>
        <Button onClick={onConfirm} disabled={cancelling} variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 600 }}>
          {cancelling ? 'מבטל...' : 'בטל תור'}
        </Button>
      </CancelDialogActions>
    </Dialog>
  );
};
