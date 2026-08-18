import React, { useState } from 'react';
import { Box, Typography, Avatar, Paper, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { PatientSummary } from '../../../api/patients';
import ClickableCard from '../../../components/ClickableCard/ClickableCard';
import { initials } from '../utils';
import { getGenderLabel } from '../../../utils/format';

interface PatientListItemProps {
  patient: PatientSummary;
  onDelete: (id: string) => Promise<void>;
}

export const PatientListItem: React.FC<PatientListItemProps> = ({ patient, onDelete }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openMenu = (e: React.MouseEvent<HTMLElement>) => { e.preventDefault(); e.stopPropagation(); setMenuAnchor(e.currentTarget); };
  const closeMenu = () => setMenuAnchor(null);

  const handleConfirmDelete = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await onDelete(patient.id);
      setConfirmOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'מחיקת המטופל נכשלה.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box>
      <Box sx={{ position: 'relative' }}>
        <ClickableCard to={`/patients/${patient.id}`}>
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.75,
              px: { xs: 1.75, sm: 2 },
              py: { xs: 1.4, sm: 1.6 },
              border: '1px solid #dfe3ea',
              borderRadius: 2,
              bgcolor: '#fff',
              '&:hover': { borderColor: '#3b5bdb', boxShadow: '0 4px 14px rgba(59,91,219,0.12)' },
              transition: 'all 0.15s ease',
            }}
          >
            <Avatar
              sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: 'primary.main', fontSize: 14, fontWeight: 700, flexShrink: 0 }}
            >
              {initials(patient.firstName, patient.lastName)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>
                {patient.firstName} {patient.lastName}
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#868e96' }}>
                ת"ז: {patient.idNumber ?? patient.id.slice(0, 8).toUpperCase()}
                {patient.age > 0 ? ` • גיל ${patient.age}` : ''}
                {patient.gender ? ` • ${getGenderLabel(patient.gender)}` : ''}
              </Typography>
            </Box>
            <Box sx={{ width: 28, flexShrink: 0 }} />
            <ChevronLeftIcon sx={{ color: '#c7cfdb', flexShrink: 0, fontSize: 20 }} />
          </Paper>
        </ClickableCard>
        <IconButton
          size="small"
          onClick={openMenu}
          sx={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', color: '#868e96', zIndex: 1 }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={closeMenu}
        onClick={e => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem
          onClick={() => { closeMenu(); setConfirmOpen(true); }}
          sx={{ color: 'error.main', gap: 1 }}
        >
          <DeleteIcon fontSize="small" />
          מחיקת מטופל
        </MenuItem>
      </Menu>

      <Dialog open={confirmOpen} onClose={busy ? undefined : () => setConfirmOpen(false)} maxWidth="xs" fullWidth dir="rtl">
        <DialogTitle>מחיקת מטופל</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, color: '#495057' }}>
            האם למחוק את המטופל {patient.firstName} {patient.lastName}? פעולה זו אינה ניתנת לשחזור.
          </Typography>
          {error && <Typography sx={{ fontSize: 13, color: 'error.main', mt: 1.5 }}>{error}</Typography>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} disabled={busy}>ביטול</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={busy}>
            {busy ? 'מוחק...' : 'מחק'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientListItem;
