import React from 'react';
import { Box, Tabs, Tab, Typography, Stack } from '@mui/material';
import PageHeader from '../../components/PageHeader/PageHeader';
import { useAsyncData } from '../../hooks/useAsyncData';
import {
  getCancelledPatientSlots,
  getPastPatientSlots,
  getUpcomingPatientSlots,
  type Slot,
} from '../../api/slots';
import { SlotCard } from './components/SlotCard';

export const PatientSlotsPage: React.FC = () => {
  const [tab, setTab] = React.useState(0);
  const upcoming = useAsyncData<Slot[]>(getUpcomingPatientSlots, []);
  const past = useAsyncData<Slot[]>(getPastPatientSlots, []);
  const cancelled = useAsyncData<Slot[]>(getCancelledPatientSlots, []);

  const current = tab === 0 ? upcoming : tab === 1 ? past : cancelled;
  const emptyText =
    tab === 0
      ? 'אין לך תורים קרובים.'
      : tab === 1
      ? 'אין תורים קודמים.'
      : 'אין תורים שבוטלו.';

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
                <SlotCard key={slot.id} slot={slot} />
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PatientSlotsPage;
