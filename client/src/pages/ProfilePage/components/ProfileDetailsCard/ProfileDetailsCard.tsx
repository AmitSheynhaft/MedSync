import React from 'react';
import { Box, Typography, Divider, TextField, Stack, IconButton, Tooltip, Button } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import BadgeIcon from '@mui/icons-material/Badge';
import HomeIcon from '@mui/icons-material/Home';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import EditIcon from '@mui/icons-material/Edit';
import { Role } from '../../../../constants/roles';
import { ProfileRow } from '../ProfileRow/ProfileRow';
import { formatDob } from '../../utils';
import type { useProfile } from '../../hooks/useProfile';
import {
  profileDetailsCardSx,
  profileDetailsHeaderSx,
  profileDetailsTitleSx,
  profileDetailsDividerSx,
  profileEditIconButtonSx,
  profilePrimaryActionButtonSx,
  profileSecondaryActionButtonSx,
} from './styles';

interface ProfileDetailsCardProps {
  profile: ReturnType<typeof useProfile>;
  email: string;
  phoneDisplay: string;
}

export const ProfileDetailsCard: React.FC<ProfileDetailsCardProps> = ({ profile, email, phoneDisplay }) => {
  const {
    role, isPatient, user, idNumber, editing, clinicName,
    phone, setPhone, birthDate, setBirthDate,
    hmo, setHmo, address, setAddress,
    saving, handleEdit, handleCancel, handleSave,
  } = profile;

  return (
    <Box sx={profileDetailsCardSx}>
      <Box sx={profileDetailsHeaderSx}>
        <Typography sx={profileDetailsTitleSx}>
          פרטים אישיים
        </Typography>
        {!editing && (
          <Tooltip title="עריכה">
            <IconButton onClick={handleEdit} size="small" sx={profileEditIconButtonSx}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <ProfileRow icon={<EmailIcon fontSize="small" />} label="אימייל" value={email} />
      <Divider sx={profileDetailsDividerSx} />

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
            <Button variant="contained" onClick={handleSave} disabled={saving} sx={profilePrimaryActionButtonSx}>
              {saving ? 'שומר…' : 'שמור'}
            </Button>
            <Button variant="outlined" onClick={handleCancel} disabled={saving} sx={profileSecondaryActionButtonSx}>
              ביטול
            </Button>
          </Stack>
        </Stack>
      ) : (
        <>
          <ProfileRow icon={<PhoneIcon fontSize="small" />} label="טלפון" value={phoneDisplay} />
          <Divider sx={profileDetailsDividerSx} />
          <ProfileRow icon={<CakeIcon fontSize="small" />} label="תאריך לידה" value={formatDob(user?.birthDate)} />
          {idNumber && (
            <>
              <Divider sx={profileDetailsDividerSx} />
              <ProfileRow
                icon={<BadgeIcon fontSize="small" />}
                label={role === Role.Doctor ? 'מספר רישיון' : 'תעודת זהות'}
                value={idNumber}
              />
            </>
          )}
          {role === Role.Doctor && (
            <>
              <Divider sx={profileDetailsDividerSx} />
              <ProfileRow icon={<MeetingRoomIcon fontSize="small" />} label="מרפאה" value={clinicName || '—'} />
            </>
          )}
          {isPatient && (
            <>
              <Divider sx={profileDetailsDividerSx} />
              <ProfileRow icon={<LocalHospitalIcon fontSize="small" />} label="קופת חולים" value={hmo || '—'} />
              <Divider sx={profileDetailsDividerSx} />
              <ProfileRow icon={<HomeIcon fontSize="small" />} label="כתובת" value={address || '—'} />
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default ProfileDetailsCard;
