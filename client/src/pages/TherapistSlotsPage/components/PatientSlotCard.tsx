import React from 'react';
import { Box, Typography, Stack, Avatar, Chip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import type { Slot } from '../../../api/slots';
import { getGenderLabel } from '../../../utils/format';

interface IPatientSlotCardProps {
  slot: Slot;
  onClick: () => void;
  /** When false the slot can't be opened (only same-day slots are openable). */
  openable?: boolean;
}

export const PatientSlotCard: React.FC<IPatientSlotCardProps> = ({ slot, onClick, openable = true }) => {
  const { patient, time } = slot;
  const details = [
    patient.age !== undefined ? `גיל ${patient.age}` : null,
    getGenderLabel(patient.gender) || null,
    patient.idNumber ? `ת.ז ${patient.idNumber}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <Box
      role="button"
      aria-disabled={!openable}
      onClick={() => openable && onClick()}
      sx={{
        bgcolor: '#fff',
        borderRadius: 3,
        border: '1px solid #e9ecef',
        p: 2,
        opacity: openable ? 1 : 0.6,
        cursor: openable ? 'pointer' : 'not-allowed',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        '&:hover': openable ? { borderColor: '#c6ceda', boxShadow: '0 2px 10px rgba(59,91,219,0.08)' } : {},
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Chip
          icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
          label={time}
          size="small"
          sx={{ fontWeight: 700, bgcolor: '#eef2ff', color: 'primary.main', '& .MuiChip-icon': { color: 'primary.main' } }}
        />
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          {patient.fullName.charAt(0)}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: 700, color: '#1a1a2e' }}>{patient.fullName}</Typography>
          {details && <Typography noWrap sx={{ fontSize: 13, color: '#868e96' }}>{details}</Typography>}
        </Box>
        {openable && <ChevronLeftIcon sx={{ color: '#adb5bd' }} />}
      </Stack>
    </Box>
  );
};

export default PatientSlotCard;
