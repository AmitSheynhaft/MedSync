import React from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import PageHeader from '../../components/PageHeader/PageHeader';
import { useAsyncData } from '../../hooks/useAsyncData';
import {
  cancelSlotAsPatient,
  getCancelledPatientSlots,
  getPastPatientSlots,
  getUpcomingPatientSlots,
  type Slot,
} from '../../api/slots';
import { formatSlotDate } from '../../utils/format';
import { SlotCard } from './components/SlotCard';

export const PatientSlotsPage: React.FC = () => {
  const [tab, setTab] = React.useState(0);
  const [reloadKey, setReloadKey] = React.useState(0);
  const [pendingCancel, setPendingCancel] = React.useState<Slot | null>(null);
  const [cancelling, setCancelling] = React.useState(false);

  const upcoming = useAsyncData<Slot[]>(getUpcomingPatientSlots, [reloadKey]);
  const past = useAsyncData<Slot[]>(getPastPatientSlots, [reloadKey]);
  const cancelled = useAsyncData<Slot[]>(getCancelledPatientSlots, [reloadKey]);

  const current = tab === 0 ? upcoming : tab === 1 ? past : cancelled;
  const emptyText =
    tab === 0
      ? 'אין לך תורים קרובים.'
      : tab === 1
      ? 'אין תורים קודמים.'
      : 'אין תורים שבוטלו.';

  const confirmCancel = async () => {
    if (!pendingCancel) return;
    setCancelling(true);
    try {
      await cancelSlotAsPatient(pendingCancel.id);
      setPendingCancel(null);
      setReloadKey(k => k + 1);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <PageHeader title="התורים שלי" subtitle="צפייה בתורים קרובים, קודמים ומבוטלים" showDoctorSubtitle={false} />

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#f6f8fb', p: { xs: 2, sm: 3 } }}>
        <Box sx={{ maxWidth: 760, mx: 'auto' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              mb: 2,
              minHeight: 40,
              bgcolor: '#fff',
              borderRadius: 2,
              border: '1px solid #e9ecef',
              p: 0.5,
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTab-root': {
                fontWeight: 600,
                minWidth: 0,
                minHeight: 36,
                px: { xs: 0.5, sm: 1 },
                fontSize: { xs: 12, sm: 14 },
                borderRadius: 1.5,
                color: '#495057',
              },
              '& .Mui-selected': { bgcolor: '#eef2ff', color: 'primary.main' },
            }}
          >
            <Tab label="תורים קרובים" />
            <Tab label="תורים שעברו" />
            <Tab label="תורים שבוטלו" />
          </Tabs>

          {current.status === 'loading' ? (
            <Typography sx={{ textAlign: 'center', color: '#868e96', py: 4 }}>טוען תורים...</Typography>
          ) : current.status === 'error' ? (
            <Typography sx={{ textAlign: 'center', color: 'error.main', py: 4 }}>טעינת התורים נכשלה.</Typography>
          ) : !current.data || current.data.length === 0 ? (
            <Typography sx={{ textAlign: 'center', color: '#868e96', py: 4 }}>{emptyText}</Typography>
          ) : (
            <Stack spacing={1.25}>
              {current.data.map(slot => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  onCancel={tab === 0 ? setPendingCancel : undefined}
                  disabled={cancelling}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Box>

      <Dialog
        open={Boolean(pendingCancel)}
        onClose={cancelling ? undefined : () => setPendingCancel(null)}
        dir="rtl"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>ביטול תור</DialogTitle>
        <DialogContent>
          {pendingCancel && (
            <DialogContentText sx={{ color: '#495057' }}>
              האם לבטל את התור עם <strong>{pendingCancel.therapist.fullName}</strong> בתאריך{' '}
              {formatSlotDate(pendingCancel.date)} בשעה {pendingCancel.time}?
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPendingCancel(null)} disabled={cancelling}>סגור</Button>
          <Button onClick={confirmCancel} disabled={cancelling} variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 600 }}>
            {cancelling ? 'מבטל...' : 'בטל תור'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientSlotsPage;
