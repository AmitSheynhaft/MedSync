import React from 'react';
import { Box, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PageHeader from '../../components/PageHeader/PageHeader';
import Toast from '../../components/Toast/Toast';
import { useProfile } from './hooks/useProfile';
import { initialsFromName } from './utils';
import { ProfileHeaderCard } from './components/ProfileHeaderCard';
import { ProfileDetailsCard } from './components/ProfileDetailsCard';

export const ProfilePage: React.FC = () => {
  const profile = useProfile();
  const { session, role, user, toast, setToast, handleLogout } = profile;

  const name = user?.fullName ?? session?.fullName ?? 'Guest';
  const email = user?.email ?? session?.email ?? '';
  const phoneDisplay = user?.phone ?? '—';
  const initials = initialsFromName(name);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', bgcolor: '#f8f9fa' }}>
      <PageHeader title="הפרופיל שלי" showDoctorSubtitle={false} />

      <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 720, mx: 'auto' }}>
          <ProfileHeaderCard name={name} initials={initials} role={role} />
          <ProfileDetailsCard profile={profile} email={email} phoneDisplay={phoneDisplay} />

          <Button
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            color="error"
            variant="outlined"
            sx={{ borderRadius: 2.5, fontWeight: 600 }}
          >
            התנתק
          </Button>
        </Box>

        <Toast toast={toast} onClose={() => setToast(null)} />
      </Box>
    </Box>
  );
};

export default ProfilePage;
