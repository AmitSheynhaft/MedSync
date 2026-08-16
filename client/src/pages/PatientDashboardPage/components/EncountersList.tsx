import React, { useState } from 'react';
import { Box, Typography, Stack, Paper, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DeleteIcon from '@mui/icons-material/Delete';
import { Encounter } from '../../../api/patients';
import ClickableCard from '../../../components/ClickableCard/ClickableCard';
import {
  encounterCardSx,
  encounterChevronSx,
  encounterDateSx,
  encounterDateWrapSx,
  encounterDoctorNameSx,
  encounterDoctorWrapSx,
  encounterIconSx,
  encounterIconWrapSx,
  encounterMetaSx,
  encounterTopRowSx,
  encountersListEmptySx,
  encountersListRootSx,
  encountersListScrollSx,
  encountersListTitleSx,
} from './EncountersList.styles';

interface EncountersListProps {
  encounters: Encounter[];
  patientId: string;
  onDeleteEncounter: (encounterId: string) => Promise<void>;
}

export const EncountersList: React.FC<EncountersListProps> = ({ encounters, patientId, onDeleteEncounter }) => {
  const [pendingDelete, setPendingDelete] = useState<Encounter | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!pendingDelete || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onDeleteEncounter(pendingDelete.id);
      setPendingDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'מחיקת הביקור נכשלה.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Paper elevation={0} sx={encountersListRootSx}>
      <Typography sx={encountersListTitleSx}>ביקורים אחרונים</Typography>
      {encounters.length === 0 ? (
        <Typography sx={encountersListEmptySx}>אין ביקורים קודמים.</Typography>
      ) : (
        <Stack spacing={1} sx={encountersListScrollSx}>
          {encounters.map((encounter, idx) => (
            <Box key={encounter.id} sx={{ position: 'relative' }}>
              <ClickableCard to={`/patients/${patientId}/visits/${encounter.id}`}>
                <Paper elevation={0} sx={encounterCardSx}>
                  <Stack direction="row" sx={encounterTopRowSx}>
                    <Stack direction="row" spacing={1} sx={encounterDoctorWrapSx}>
                      <Box sx={encounterIconWrapSx(idx === 0)}>
                        <MedicalServicesIcon sx={encounterIconSx} />
                      </Box>
                      <Typography sx={encounterDoctorNameSx}>{encounter.doctor}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} sx={encounterDateWrapSx}>
                      <Typography sx={encounterDateSx}>{encounter.date}</Typography>
                      <ChevronLeftIcon sx={encounterChevronSx} />
                    </Stack>
                  </Stack>
                  <Typography sx={encounterMetaSx}>{encounter.specialty} • {encounter.type}</Typography>
                </Paper>
              </ClickableCard>
              <Tooltip title="מחיקת ביקור">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setPendingDelete(encounter)}
                  sx={{ position: 'absolute', top: 6, left: 6, bgcolor: '#fff', '&:hover': { bgcolor: '#fff0f0' } }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Stack>
      )}

      <Dialog open={!!pendingDelete} onClose={busy ? undefined : () => setPendingDelete(null)} maxWidth="xs" fullWidth dir="rtl">
        <DialogTitle>מחיקת ביקור</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, color: '#495057' }}>
            האם למחוק את הביקור מתאריך {pendingDelete?.date}? פעולה זו אינה ניתנת לשחזור.
          </Typography>
          {error && <Typography sx={{ fontSize: 13, color: 'error.main', mt: 1.5 }}>{error}</Typography>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPendingDelete(null)} disabled={busy}>ביטול</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={busy}>
            {busy ? 'מוחק...' : 'מחק'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EncountersList;
