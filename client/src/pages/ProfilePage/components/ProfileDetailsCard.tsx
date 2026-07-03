import React from 'react';
import { Box, Typography, Divider, TextField, Stack, IconButton, Tooltip, Button } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import BadgeIcon from '@mui/icons-material/Badge';
import HomeIcon from '@mui/icons-material/Home';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EditIcon from '@mui/icons-material/Edit';
import { ProfileRow } from './ProfileRow';
import { formatDob } from '../utils';
import type { useProfile } from '../hooks/useProfile';

interface ProfileDetailsCardProps {
  profile: ReturnType<typeof useProfile>;
  email: string;
  phoneDisplay: string;
}

export const ProfileDetailsCard: React.FC<ProfileDetailsCardProps> = ({ profile, email, phoneDisplay }) => {
  const {
    role, isPatient, user, idNumber, editing,
    phone, setPhone, birthDate, setBirthDate,
    hmo, setHmo, address, setAddress,
    saving, handleEdit, handleCancel, handleSave,
  } = profile;

  return (
    <Box sx={{ bgcolor: '#fff', border: '1px solid #dee5ef', borderRadius: 3, p: { xs: 2.25, sm: 3 }, mb: 3, boxShadow: '0 1px 2px rgba(15,23,42,0.03)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#8a94a5', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          פרטים אישיים
        </Typography>
        {!editing && (
          <Tooltip title="עריכה">
            <IconButton onClick={handleEdit} size="small" sx={{ color: 'primary.main' }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <ProfileRow icon={<EmailIcon fontSize="small" />} label="אימייל" value={email} />
      <Divider sx={{ my: 1.5 }} />

      {editing ? (
        <Stack spacing={2}>
          <TextField label="טלפון" value={phone} onChange={e => setPhone(e.target.value)} size="small" fullWidth placeholder="+972 50-000-0000" />
          <TextField label="תאריך לידה" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} size="small" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          {isPatient && (
            <>
              <TextField label="קופת חולים" value={hmo} onChange={e => setHmo(e.target.value)} size="small" fullWidth />
              <TextField label="כתובת" value={address} onChange={e => setAddress(e.target.value)} size="small" fullWidth />
            </>
          )}
          <Stack direction="row" spacing={1.5}>
            <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ borderRadius: 999, fontWeight: 700, px: 2.5, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>
              {saving ? 'שומר…' : 'שמור'}
            </Button>
            <Button variant="outlined" onClick={handleCancel} disabled={saving} sx={{ borderRadius: 999, fontWeight: 700, px: 2.5 }}>
              ביטול
            </Button>
          </Stack>
        </Stack>
      ) : (
        <>
          <ProfileRow icon={<PhoneIcon fontSize="small" />} label="טלפון" value={phoneDisplay} />
          <Divider sx={{ my: 1.5 }} />
          <ProfileRow icon={<CakeIcon fontSize="small" />} label="תאריך לידה" value={formatDob(user?.birthDate)} />
          {idNumber && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <ProfileRow
                icon={<BadgeIcon fontSize="small" />}
                label={role === 'doctor' ? 'מספר רישיון' : 'תעודת זהות'}
                value={idNumber}
              />
            </>
          )}
          {isPatient && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <ProfileRow icon={<LocalHospitalIcon fontSize="small" />} label="קופת חולים" value={hmo || '—'} />
              <Divider sx={{ my: 1.5 }} />
              <ProfileRow icon={<HomeIcon fontSize="small" />} label="כתובת" value={address || '—'} />
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default ProfileDetailsCard;
