import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import {
  sectionHeaderIconWrapSx,
  sectionHeaderLabelSx,
  sectionHeaderRootSx,
} from './styles';

interface SectionHeaderProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  bg: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, label, color, bg }) => (
  <Stack direction="row" sx={sectionHeaderRootSx}>
    <Box sx={sectionHeaderIconWrapSx(bg, color)}>
      {icon}
    </Box>
    <Typography sx={sectionHeaderLabelSx(color)}>
      {label}
    </Typography>
  </Stack>
);

export default SectionHeader;
