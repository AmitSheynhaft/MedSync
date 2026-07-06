import React from 'react';
import { Box, Typography, Stack, Avatar } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { Slot } from '../../../api/slots';
import { formatSlotDate } from '../../../utils/format';

interface ISlotCardProps {
  slot: Slot;
}

export const SlotCard: React.FC<ISlotCardProps> = ({ slot }) => (
  <Box sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid #e9ecef', p: 2 }}>
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
        {slot.therapist.fullName.charAt(0)}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          {slot.therapist.fullName}
        </Typography>
        <Typography noWrap sx={{ fontSize: 13, color: '#868e96' }}>
          {slot.therapist.specialization}
        </Typography>
      </Box>
    </Stack>
    <Stack direction="row" spacing={2} sx={{ mt: 1.5, color: '#495057' }}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        <EventIcon sx={{ fontSize: 18, color: '#868e96' }} />
        <Typography sx={{ fontSize: 13 }}>{formatSlotDate(slot.date)}</Typography>
      </Stack>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        <AccessTimeIcon sx={{ fontSize: 18, color: '#868e96' }} />
        <Typography sx={{ fontSize: 13 }}>{slot.time}</Typography>
      </Stack>
    </Stack>
  </Box>
);

export default SlotCard;
