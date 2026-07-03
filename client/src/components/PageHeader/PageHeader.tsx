import React from 'react';
import { Box, Stack, Typography, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useCurrentDoctor } from '../../hooks/useCurrentDoctor';

export interface IPageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showDoctorSubtitle?: boolean;
}

export const PageHeader: React.FC<IPageHeaderProps> = ({ title, subtitle, onBack, showDoctorSubtitle = true }) => {
  const doctor = useCurrentDoctor();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        px: { xs: 2, sm: 3 },
        py: 2,
        borderBottom: '1px solid #e9ecef',
        bgcolor: '#fff',
        flexShrink: 0,
      }}
    >
      <Stack sx={{ flexDirection: 'row', alignItems: 'center', minWidth: 0 }} spacing={1}>
        {onBack && (
          <IconButton onClick={onBack} aria-label="Back" size="small">
            <ChevronRightIcon />
          </IconButton>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography noWrap sx={{ fontSize: 13, color: '#868e96' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'center', flexShrink: 0, pl: { xs: 0, sm: 0.5 } }} spacing={{ xs: 1.25, sm: 2 }}>
        <Box sx={{ maxWidth: { xs: 90, sm: 160 }, minWidth: 0, textAlign: 'end'}}>
          <Typography noWrap sx={{ fontSize: { xs: 12, sm: 14 }, fontWeight: 600, color: '#1a1a2e' }}>
            {doctor.fullName}
          </Typography>
          {showDoctorSubtitle && (
            <Typography noWrap sx={{ fontSize: { xs: 10.5, sm: 12 }, color: '#868e96' }}>
              {doctor.specialization}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: { xs: 32, sm: 36 },
            height: { xs: 32, sm: 36 },
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: { xs: 13, sm: 14 },
            flexShrink: 0,
          }}
        >
          {doctor.initials}
        </Box>
      </Stack>
    </Box>
  );
};

export default PageHeader;
