import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import PageHeader from '../../components/PageHeader/PageHeader';
import { PageWrapper, ContentArea } from './styled';
import { useAdminUsers } from './hooks/useAdminUsers';
import { useAdminClinics } from './hooks/useAdminClinics';
import UsersTable from './components/UsersTable';
import ClinicsTable from './components/ClinicsTable';

const AdminPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  const usersState = useAdminUsers();
  const clinicsState = useAdminClinics(tab === 1);

  return (
    <PageWrapper>
      <PageHeader title="ניהול מערכת" subtitle="ניהול משתמשים ומרפאות" />

      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e9ecef', px: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="משתמשים" />
          <Tab label="מרפאות" />
        </Tabs>
      </Box>

      <ContentArea>
        {tab === 0 && (
          <Box>
            {usersState.loading ? (
              <Typography sx={{ color: '#868e96', textAlign: 'center', py: 4 }}>טוען...</Typography>
            ) : usersState.error ? (
              <Typography sx={{ color: 'error.main', textAlign: 'center', py: 4 }}>{usersState.error}</Typography>
            ) : (
              <UsersTable
                users={usersState.users}
                roles={usersState.roles}
                clinics={clinicsState.clinics}
                onCreate={usersState.handleCreate}
                onUpdate={usersState.handleUpdate}
                onDelete={usersState.handleDelete}
              />
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            {clinicsState.loading ? (
              <Typography sx={{ color: '#868e96', textAlign: 'center', py: 4 }}>טוען...</Typography>
            ) : clinicsState.error ? (
              <Typography sx={{ color: 'error.main', textAlign: 'center', py: 4 }}>{clinicsState.error}</Typography>
            ) : (
              <ClinicsTable
                clinics={clinicsState.clinics}
                onCreate={clinicsState.handleCreate}
                onUpdate={clinicsState.handleUpdate}
                onDelete={clinicsState.handleDelete}
              />
            )}
          </Box>
        )}
      </ContentArea>

    </PageWrapper>
  );
};

export default AdminPage;
