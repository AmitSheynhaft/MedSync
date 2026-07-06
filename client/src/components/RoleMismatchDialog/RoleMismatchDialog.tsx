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
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 36, height: 36, borderRadius: '10px', bgcolor: '#fff4e6',
            color: '#e8590c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <WarningAmberIcon fontSize="small" />
        </Box>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: '#495057' }}>{body}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onConfirm} variant="contained" sx={{ borderRadius: 2, fontWeight: 600 }}>
          {cta}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleMismatchDialog;
