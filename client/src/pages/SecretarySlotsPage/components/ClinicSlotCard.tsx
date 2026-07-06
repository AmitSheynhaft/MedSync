import React from 'react';
import { Box, Typography, Stack, Avatar, Chip, IconButton, Tooltip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import type { Slot } from '../../../api/slots';
import { formatSlotDate } from '../../../utils/format';

interface IClinicSlotCardProps {
  slot: Slot;
  onCancel?: (slot: Slot) => void;
  disabled?: boolean;
}

export const ClinicSlotCard: React.FC<IClinicSlotCardProps> = ({
  slot,
  onCancel,
  disabled,
}) => {
  const { patient, therapist, time, date, status, slotTime } = slot;
  const isCancelled = status === 'cancelled';
  const isPastScheduled = !isCancelled && new Date(slotTime).getTime() < Date.now();

  const statusLabel = isCancelled ? 'בוטל' : isPastScheduled ? 'הסתיים' : 'עתידי';
  const statusColor = isCancelled ? '#e03131' : isPastScheduled ? '#495057' : '#1c7ed6';
  const statusBg = isCancelled ? '#ffe3e3' : isPastScheduled ? '#e9ecef' : '#e7f5ff';

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        borderRadius: 3,
        border: '1px solid #e9ecef',
        p: 2,
        opacity: isCancelled ? 0.85 : 1,
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}
      >
        <Chip
          icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
          label={time}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: '#eef2ff',
            color: 'primary.main',
            '& .MuiChip-icon': { color: 'primary.main' },
          }}
        />
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          {patient.fullName.charAt(0)}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: '1 1 140px' }}>
          <Typography sx={{ fontWeight: 700, color: '#1a1a2e', wordBreak: 'break-word' }}>
            {patient.fullName}
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#868e96', wordBreak: 'break-word' }}>
            {formatSlotDate(date)} · {therapist.fullName}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', ml: 'auto' }}>
          <Chip
            label={statusLabel}
            size="small"
            sx={{ fontWeight: 600, color: statusColor, bgcolor: statusBg }}
          />
          {onCancel && !isCancelled && (
            <Tooltip title="ביטול תור">
              <span>
                <IconButton
                  onClick={() => onCancel(slot)}
                  disabled={disabled}
                  size="small"
                  sx={{ color: '#e03131' }}
                  aria-label="ביטול תור"
                >
                  <CancelOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default ClinicSlotCard;
