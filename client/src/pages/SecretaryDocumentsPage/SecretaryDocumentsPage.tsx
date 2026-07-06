import React, { useState } from 'react';
import { Box, Stack, Typography, Alert } from '@mui/material';
import PageHeader from '../../components/PageHeader/PageHeader';
import { LazyAutocomplete } from '../../components/LazyAutocomplete/LazyAutocomplete';
import { DocumentUploadSection } from '../SecretarySchedulePage/components/DocumentUploadSection';
import { getBookablePatients, type BookablePatient } from '../../api/slots';
import { SectionCard } from '../SecretarySchedulePage/styled';

export const SecretaryDocumentsPage: React.FC = () => {
  const [patient, setPatient] = useState<BookablePatient | null>(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <PageHeader
        title="העלאת מסמכים למטופל"
        subtitle="בחרו מטופל והעלו עבורו מסמכים רפואיים"
        showDoctorSubtitle={false}
      />

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#f6f8fb', p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2} sx={{ maxWidth: 760, mx: 'auto' }}>
          <SectionCard>
            <Typography sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1.5 }}>
              בחירת מטופל
            </Typography>
            <LazyAutocomplete<BookablePatient>
              label="מטופל"
              placeholder="חיפוש לפי שם או אימייל"
              value={patient}
              onChange={setPatient}
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

          {patient ? (
            <SectionCard>
              <Typography sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1.5 }}>
                העלאת מסמך
              </Typography>
              <DocumentUploadSection
                key={patient.userId}
                patientUserId={patient.userId}
                patientName={patient.fullName}
              />
            </SectionCard>
          ) : (
            <Alert severity="info">בחרו מטופל כדי להעלות עבורו מסמכים.</Alert>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default SecretaryDocumentsPage;
