import React from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import type { RoleName } from '../../../../auth/types';
import { getRoleLabel } from '../../constants';
import {
  profileHeaderAvatarSx,
  profileHeaderCardSx,
  profileHeaderContentSx,
  profileHeaderNameSx,
  profileHeaderRoleChipSx,
} from './styles';

interface ProfileHeaderCardProps {
  name: string;
  initials: string;
  role: RoleName | null;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({ name, initials, role }) => (
  <Box sx={profileHeaderCardSx}>
    <Avatar sx={profileHeaderAvatarSx}>
      {initials || '?'}
    </Avatar>
    <Box sx={profileHeaderContentSx}>
      <Typography sx={profileHeaderNameSx}>{name}</Typography>
      <Chip
        label={getRoleLabel(role)}
        size="small"
        sx={profileHeaderRoleChipSx}
      />
    </Box>
  </Box>
);

export default ProfileHeaderCard;
