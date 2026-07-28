import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  profileRowContainerSx,
  profileRowContentSx,
  profileRowIconBoxSx,
  profileRowLabelSx,
  profileRowValueSx,
} from './styles';

interface ProfileRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export const ProfileRow: React.FC<ProfileRowProps> = ({ icon, label, value }) => (
  <Box sx={profileRowContainerSx}>
    <Box sx={profileRowIconBoxSx}>
      {icon}
    </Box>
    <Box sx={profileRowContentSx}>
      <Typography sx={profileRowLabelSx}>{label}</Typography>
      <Typography sx={profileRowValueSx}>{value}</Typography>
    </Box>
  </Box>
);

export default ProfileRow;
