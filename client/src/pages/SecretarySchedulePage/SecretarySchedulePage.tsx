import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Alert,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PageHeader from '../../components/PageHeader/PageHeader';
import { LazyAutocomplete } from '../../components/LazyAutocomplete/LazyAutocomplete';
import { DateField } from '../../components/DateField/DateField';
import { useScheduleForm } from './hooks/useScheduleForm';
import { TimeSlotPicker } from './components/TimeSlotPicker';
import {
  getBookablePatients,
  getTherapistOptions,
  type BookablePatient,
  type TherapistOption,
} from '../../api/slots';
import { formatSlotDate, todayISO } from '../../utils/format';
import { SectionCard } from './styled';

const SectionTitle: React.FC<{ index: number; title: string }> = ({ index, title }) => (
  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        bgcolor: 'primary.main',
        color: '#fff',
        fontSize: 13,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {index}
    </Box>
    <Typography sx={{ fontWeight: 700, color: '#1a1a2e' }}>{title}</Typography>
  </Stack>
);

export const SecretarySchedulePage: React.FC = () => {
  const form = useScheduleForm();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <PageHeader title="קביעת תור" subtitle="שיבוץ תור חדש בלוח הזמנים" showDoctorSubtitle={false} />

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#f6f8fb', p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2} sx={{ maxWidth: 760, mx: 'auto' }}>
          {form.error && <Alert severity="error">{form.error}</Alert>}

          <SectionCard>
            <SectionTitle index={1} title="בחירת מטפל" />
            <LazyAutocomplete<TherapistOption>
              label="מטפל"
              placeholder="חיפוש לפי שם או התמחות"
              value={form.therapist}
              onChange={form.selectTherapist}
              fetchPage={getTherapistOptions}
              getOptionLabel={t => `${t.fullName} · ${t.specialization}`}
              isOptionEqualToValue={(a, b) => a.caregiverId === b.caregiverId}
              renderOptionContent={t => (
                <span>{t.fullName} · {t.specialization}</span>
              )}
            />
          </SectionCard>

          <SectionCard>
            <SectionTitle index={2} title="בחירת מטופל" />
            <LazyAutocomplete<BookablePatient>
              label="מטופל"
              placeholder="חיפוש לפי שם או אימייל"
              value={form.patient}
              onChange={form.selectPatient}
              fetchPage={getBookablePatients}
              getOptionLabel={p => p.fullName}
              isOptionEqualToValue={(a, b) => a.userId === b.userId}
              renderOptionContent={p => (
                <Stack>
                  <Typography sx={{ fontSize: 14 }}>{p.fullName}</Typography>
                  <Typography sx={{ fontSize: 12, color: '#868e96' }}>{p.email}</Typography>
                </Stack>
              )}
            />
          </SectionCard>

          <SectionCard>
            <SectionTitle index={3} title="תאריך ושעה" />
            <DateField
              label="תאריך"
              value={form.date}
              onChange={form.selectDate}
              min={todayISO()}
              sx={{ maxWidth: 220, mb: 2, bgcolor: '#fff' }}
            />
            {form.date && (
              <Typography sx={{ fontSize: 13, color: '#868e96', mb: 1.5 }}>
                {formatSlotDate(form.date)} · תורים באורך 30 דקות
              </Typography>
            )}
            <TimeSlotPicker
              slots={form.availability.data?.slots ?? null}
              status={form.availability.status}
              ready={Boolean(form.caregiverId && form.date)}
              selected={form.time}
              onSelect={form.setTime}
              date={form.date}
            />
            <FormControlLabel
              sx={{ mt: 1.5 }}
              control={
                <Checkbox
                  checked={form.hasReferral}
                  onChange={e => form.setHasReferral(e.target.checked)}
                />
              }
              label="המטופל הגיע עם הפניה מרופא"
            />
          </SectionCard>

          <Button
            variant="contained"
            size="large"
            onClick={form.submit}
            disabled={!form.canSubmit}
            sx={{ py: 1.25, fontSize: 15 }}
          >
            {form.submitting ? 'קובע תור...' : 'קבע תור'}
          </Button>
        </Stack>
      </Box>

      {/* Success confirmation popup */}
      <Dialog
        open={Boolean(form.successDialog)}
        onClose={form.dismissSuccess}
        dir="rtl"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36, height: 36, borderRadius: '10px', bgcolor: '#e7f5e9',
              color: '#2f9e44', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <CheckCircleIcon fontSize="small" />
          </Box>
          התור נקבע בהצלחה
        </DialogTitle>
        <DialogContent>
          {form.successDialog && (
            <DialogContentText sx={{ color: '#495057' }}>
              נקבע תור עבור <strong>{form.successDialog.patient.fullName}</strong> עם{' '}
              <strong>{form.successDialog.therapist.fullName}</strong> בתאריך{' '}
              {formatSlotDate(form.successDialog.date)} בשעה {form.successDialog.time}.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={form.dismissSuccess} variant="contained" sx={{ borderRadius: 2, fontWeight: 600 }}>
            סגור
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecretarySchedulePage;
