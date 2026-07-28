import React from 'react';
import { Box, Stack, Typography, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useCurrentDoctor } from '../../hooks/useCurrentDoctor';
import {
  pageHeaderAvatarSx,
  pageHeaderDoctorGroupSx,
  pageHeaderDoctorNameSx,
  pageHeaderDoctorSpecializationSx,
  pageHeaderDoctorTextWrapSx,
  pageHeaderRootSx,
  pageHeaderSubtitleSx,
  pageHeaderTitleGroupSx,
  pageHeaderTitleSx,
  pageHeaderTitleWrapSx,
} from './PageHeader.styles';

export interface IPageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showDoctorSubtitle?: boolean;
}

export const PageHeader: React.FC<IPageHeaderProps> = ({ title, subtitle, onBack, showDoctorSubtitle = true }) => {
  const doctor = useCurrentDoctor();

  return (
    <Box sx={pageHeaderRootSx}>
      <Stack sx={pageHeaderTitleGroupSx} spacing={1}>
        {onBack && (
          <IconButton onClick={onBack} aria-label="Back" size="small">
            <ChevronRightIcon />
          </IconButton>
        )}
        <Box sx={pageHeaderTitleWrapSx}>
          <Typography noWrap sx={pageHeaderTitleSx}>
            {title}
          </Typography>
          {subtitle && (
            <Typography noWrap sx={pageHeaderSubtitleSx}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      <Stack direction="row" sx={pageHeaderDoctorGroupSx} spacing={{ xs: 1.25, sm: 2 }}>
        <Box sx={pageHeaderDoctorTextWrapSx}>
          <Typography noWrap sx={pageHeaderDoctorNameSx}>
            {doctor.fullName}
          </Typography>
          {showDoctorSubtitle && (
            <Typography noWrap sx={pageHeaderDoctorSpecializationSx}>
              {doctor.specialization}
            </Typography>
          )}
        </Box>
        <Box sx={pageHeaderAvatarSx}>
          {doctor.initials}
        </Box>
      </Stack>
    </Box>
  );
};

export default PageHeader;
