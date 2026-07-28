import React from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import type { RoleName } from '../../../auth/types';
import { getRoleLabel } from '../constants';

interface ProfileHeaderCardProps {
  name: string;
  initials: string;
  role: RoleName | null;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({ name, initials, role }) => (
  <Box
    sx={{
      bgcolor: '#fff', border: '1px solid #dee5ef', borderRadius: 3,
      p: { xs: 2.25, sm: 3 }, display: 'flex', alignItems: 'center', gap: 2.25, mb: 2,
      boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
    }}
  >
    <Avatar sx={{ width: { xs: 62, sm: 72 }, height: { xs: 62, sm: 72 }, bgcolor: 'primary.main', fontSize: { xs: 20, sm: 24 }, fontWeight: 700 }}>
      {initials || '?'}
    </Avatar>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: { xs: 18, sm: 20 }, fontWeight: 700, color: '#1a1a2e' }}>{name}</Typography>
      <Chip
        label={getRoleLabel(role)}
        size="small"
        sx={{ mt: 0.6, bgcolor: '#eef2ff', color: 'primary.main', fontWeight: 700 }}
      />
    </Box>
  </Box>
);

export default ProfileHeaderCard;
