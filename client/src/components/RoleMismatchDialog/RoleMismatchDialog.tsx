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
import {
  roleMismatchActionsSx,
  roleMismatchBodySx,
  roleMismatchConfirmButtonSx,
  roleMismatchDialogTitleSx,
  roleMismatchIconWrapSx,
} from './RoleMismatchDialog.styles';

/** How the mismatch was detected — controls the title, message and CTA. */
export type TRoleMismatchMode = 'tamper' | 'route';

interface IRoleMismatchDialogProps {
  open: boolean;
  onConfirm: () => void;
  /**
   * `'tamper'` (default) — the server-verified role differs from the cached
   *   session; the user must re-authenticate.
   * `'route'` — the current role does not have permission for the requested
   *   screen; sending them to their home page is enough.
   */
  mode?: TRoleMismatchMode;
}

const COPY: Record<TRoleMismatchMode, { title: string; body: string; cta: string }> = {
  tamper: {
    title: 'בעיית הרשאות',
    body: 'זוהתה בעיה בהרשאות המשתמש. עליך להתחבר מחדש כדי להמשיך.',
    cta: 'התחברות מחדש',
  },
  route: {
    title: 'אין הרשאה למסך זה',
    body: 'התפקיד הנוכחי שלך אינו כולל הרשאה לצפייה במסך זה. נעביר אותך לדף הבית שלך.',
    cta: 'חזרה לדף הבית',
  },
};

export const RoleMismatchDialog: React.FC<IRoleMismatchDialogProps> = ({
  open,
  onConfirm,
  mode = 'tamper',
}) => {
  const { title, body, cta } = COPY[mode];
  return (
    <Dialog open={open} dir="rtl" maxWidth="xs" fullWidth>
      <DialogTitle sx={roleMismatchDialogTitleSx}>
        <Box sx={roleMismatchIconWrapSx}>
          <WarningAmberIcon fontSize="small" />
        </Box>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={roleMismatchBodySx}>{body}</DialogContentText>
      </DialogContent>
      <DialogActions sx={roleMismatchActionsSx}>
        <Button onClick={onConfirm} variant="contained" sx={roleMismatchConfirmButtonSx}>
          {cta}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleMismatchDialog;
