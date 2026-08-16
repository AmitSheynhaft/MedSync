import React from 'react';
import { Box, Typography, TextField, InputAdornment, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '../../components/PageHeader/PageHeader';
import { usePatientSearch } from './hooks/usePatientSearch';
import { PatientListItem } from './components/PatientListItem';

export const PatientsListPage: React.FC = () => {
  const { query, setQuery, status, patients, hasMore, loadingMore, loadMore, handleDelete } = usePatientSearch();

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!hasMore || loadingMore || status !== 'done') return;
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 200;
    if (isNearBottom) {
      loadMore();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <PageHeader title="רשימת מטופלים" subtitle="בחר מטופל להתחלת הטיפול" />

      <Box
        onScroll={handleScroll}
        sx={{ flex: 1, overflow: 'auto', bgcolor: '#f6f8fb', p: { xs: 2, sm: 3 } }}
      >
        <Box sx={{ maxWidth: 760, mx: 'auto' }}>
          <TextField
            fullWidth
            placeholder="חיפוש לפי שם או תעודת זהות..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            size="small"
            sx={{
              mb: 2,
              bgcolor: '#fff',
              borderRadius: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: '#fff',
                '& fieldset': { borderColor: '#dfe3ea' },
                '&:hover fieldset': { borderColor: '#c6ceda' },
                '&.Mui-focused fieldset': { borderColor: '#3b5bdb' },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#868e96', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          {status === 'loading' ? (
            <Typography sx={{ textAlign: 'center', color: '#868e96', py: 4 }}>
              טוען מטופלים...
            </Typography>
          ) : status === 'error' ? (
            <Typography sx={{ textAlign: 'center', color: 'error.main', py: 4 }}>
              טעינת המטופלים נכשלה.
            </Typography>
          ) : patients.length === 0 ? (
            <Typography sx={{ textAlign: 'center', color: '#868e96', py: 4 }}>
              לא נמצאו מטופלים תואמים.
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {patients.map(patient => (
                <PatientListItem key={patient.id} patient={patient} onDelete={handleDelete} />
              ))}
              {loadingMore && (
                <Typography sx={{ textAlign: 'center', color: '#868e96', py: 2 }}>
                  טוען עוד מטופלים...
                </Typography>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PatientsListPage;
