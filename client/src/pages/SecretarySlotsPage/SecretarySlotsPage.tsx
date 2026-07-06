import React from 'react';
import {
  Box,
  Stack,
  Tabs,
  Tab,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PageHeader from '../../components/PageHeader/PageHeader';
import { useClinicSlots } from './hooks/useClinicSlots';
import { ClinicSlotCard } from './components/ClinicSlotCard';
import { formatSlotDate } from '../../utils/format';
import type { Slot } from '../../api/slots';

export const SecretarySlotsPage: React.FC = () => {
  const state = useClinicSlots();
  const [tab, setTab] = React.useState(0);

  const upcomingList = state.upcoming.data ?? [];
  const historyList = state.history.data ?? [];
  const current = tab === 0 ? state.upcoming : state.history;
  const rows: Slot[] = tab === 0 ? upcomingList : historyList;
  const emptyText = tab === 0 ? 'אין תורים קרובים במרפאה.' : 'אין תורים קודמים או מבוטלים.';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <PageHeader title="תורי המרפאה" subtitle="ניהול תורים במרפאה שלך" showDoctorSubtitle={false} />

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#f6f8fb', p: { xs: 2, sm: 3 } }}>
        <Box sx={{ maxWidth: 760, mx: 'auto' }}>
          {state.error && <Alert severity="error" sx={{ mb: 2 }}>{state.error}</Alert>}

          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ mb: 2, '& .MuiTab-root': { fontWeight: 600, minWidth: 'auto' } }}
          >
            <Tab label="תורים קרובים" />
            <Tab label="תורים שעברו וביטולים" />
          </Tabs>

          {current.status === 'loading' ? (
            <Typography sx={{ textAlign: 'center', color: '#868e96', py: 4 }}>טוען תורים...</Typography>
          ) : current.status === 'error' ? (
            <Typography sx={{ textAlign: 'center', color: 'error.main', py: 4 }}>טעינת התורים נכשלה.</Typography>
          ) : rows.length === 0 ? (
            <Typography sx={{ textAlign: 'center', color: '#868e96', py: 4 }}>{emptyText}</Typography>
          ) : (
            <Stack spacing={1.25}>
              {rows.map(slot => (
                <ClinicSlotCard
                  key={slot.id}
                  slot={slot}
                  onCancel={tab === 0 ? state.requestCancel : undefined}
                  disabled={state.cancelling}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Box>

      <Dialog
        open={Boolean(state.pendingCancel)}
        onClose={state.cancelling ? undefined : state.dismissCancel}
        dir="rtl"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36, height: 36, borderRadius: '10px', bgcolor: '#fff4e6',
              color: '#e8590c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <WarningAmberIcon fontSize="small" />
          </Box>
          ביטול תור
        </DialogTitle>
        <DialogContent>
          {state.pendingCancel && (
            <DialogContentText sx={{ color: '#495057' }}>
              האם לבטל את התור של <strong>{state.pendingCancel.patient.fullName}</strong> עם{' '}
              <strong>{state.pendingCancel.therapist.fullName}</strong> בתאריך{' '}
              {formatSlotDate(state.pendingCancel.date)} בשעה {state.pendingCancel.time}?
              התור יישמר בהיסטוריה כמבוטל.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={state.dismissCancel} disabled={state.cancelling}>סגור</Button>
          <Button
            onClick={state.confirmCancel}
            disabled={state.cancelling}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            {state.cancelling ? 'מבטל...' : 'בטל תור'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecretarySlotsPage;
