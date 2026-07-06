import React from 'react';
import { Stack, Typography } from '@mui/material';
import { LazyAutocomplete } from '../../../components/LazyAutocomplete/LazyAutocomplete';
import { getBookablePatients, type BookablePatient } from '../../../api/slots';
import { SectionCard } from '../../SecretarySchedulePage/styled';

interface IPatientSelectCardProps {
  value: BookablePatient | null;
  onChange: (patient: BookablePatient | null) => void;
}

export const PatientSelectCard: React.FC<IPatientSelectCardProps> = ({ value, onChange }) => (
  <SectionCard>
    <Typography sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1.5 }}>בחירת מטופל</Typography>
    <LazyAutocomplete<BookablePatient>
      label="מטופל"
      placeholder="חיפוש לפי שם או אימייל"
      value={value}
      onChange={onChange}
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
);

export default PatientSelectCard;
