import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack } from '@mui/material';
import PageHeader from '../../components/PageHeader/PageHeader';
import { DateField } from '../../components/DateField/DateField';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getCaregiverSlots, type Slot } from '../../api/slots';
import { formatSlotDate, todayISO } from '../../utils/format';
import { PatientSlotCard } from './components/PatientSlotCard';

export const TherapistSlotsPage: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = React.useState(todayISO);
  const { data, status } = useAsyncData<Slot[]>(
    () => getCaregiverSlots(date),
    [date],
  );

  // A visit can only be opened for a slot on its own day.
  const isToday = date === todayISO();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <PageHeader title="יומן התורים" subtitle="בחר תור לצפייה בתיק המטופל" />

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#f6f8fb', p: { xs: 2, sm: 3 } }}>
        <Box sx={{ maxWidth: 760, mx: 'auto' }}>
          <DateField
            label="תאריך"
            value={date}
            onChange={setDate}
            sx={{ mb: 2, maxWidth: 220, bgcolor: '#fff' }}
          />

          <Typography sx={{ fontSize: 13, color: '#868e96', mb: 1.5 }}>
            {formatSlotDate(date)}
            {!isToday && ' · ניתן לפתוח ביקור רק בתורים של היום'}
          </Typography>

          {status === 'loading' ? (
            <Typography sx={{ textAlign: 'center', color: '#868e96', py: 4 }}>טוען תורים...</Typography>
          ) : status === 'error' ? (
            <Typography sx={{ textAlign: 'center', color: 'error.main', py: 4 }}>טעינת התורים נכשלה.</Typography>
          ) : !data || data.length === 0 ? (
            <Typography sx={{ textAlign: 'center', color: '#868e96', py: 4 }}>אין תורים בתאריך זה.</Typography>
          ) : (
            <Stack spacing={1.25}>
              {data.map(slot => (
                <PatientSlotCard
                  key={slot.id}
                  slot={slot}
                  openable={isToday}
                  onClick={() => navigate(`/patients/${slot.patient.patientId}?slotId=${slot.id}`)}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TherapistSlotsPage;
