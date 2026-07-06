import React from 'react';
import { Box, Typography } from '@mui/material';
import type { SlotTimeOption } from '../../../api/slots';
import type { AsyncStatus } from '../../../hooks/useAsyncData';
import { currentTimeHM, todayISO } from '../../../utils/format';

interface ITimeSlotPickerProps {
  slots: SlotTimeOption[] | null;
  status: AsyncStatus;
  ready: boolean;
  selected: string;
  onSelect: (time: string) => void;
  date: string;
}

export const TimeSlotPicker: React.FC<ITimeSlotPickerProps> = ({ slots, status, ready, selected, onSelect, date }) => {
  if (!ready) {
    return <Typography sx={{ color: '#868e96', fontSize: 13 }}>יש לבחור מטפל ותאריך כדי לראות שעות פנויות.</Typography>;
  }
  if (status === 'loading') {
    return <Typography sx={{ color: '#868e96', fontSize: 13 }}>טוען שעות פנויות...</Typography>;
  }
  if (status === 'error') {
    return <Typography sx={{ color: 'error.main', fontSize: 13 }}>טעינת השעות נכשלה.</Typography>;
  }
  if (!slots || slots.length === 0) {
    return <Typography sx={{ color: '#868e96', fontSize: 13 }}>אין שעות זמינות.</Typography>;
  }

  const isToday = date === todayISO();
  const nowHM = isToday ? currentTimeHM() : '';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
        gap: 1,
      }}
    >
      {slots.map(slot => {
        const isPast = isToday && slot.time <= nowHM;
        const enabled = slot.available && !isPast;
        const isSelected = selected === slot.time;
        return (
          <Box
            key={slot.time}
            role="button"
            aria-disabled={!enabled}
            onClick={() => enabled && onSelect(slot.time)}
            sx={{
              textAlign: 'center',
              py: 1,
              borderRadius: 2,
              fontSize: 14,
              fontWeight: 600,
              userSelect: 'none',
              border: '1px solid',
              borderColor: isSelected ? 'primary.main' : enabled ? '#dfe3ea' : '#eef0f3',
              bgcolor: isSelected ? 'primary.main' : enabled ? '#fff' : '#f1f3f5',
              color: isSelected ? '#fff' : enabled ? '#1a1a2e' : '#adb5bd',
              cursor: enabled ? 'pointer' : 'not-allowed',
              textDecoration: enabled ? 'none' : 'line-through',
              '&:hover': enabled && !isSelected ? { borderColor: '#3b5bdb' } : {},
            }}
          >
            {slot.time}
          </Box>
        );
      })}
    </Box>
  );
};

export default TimeSlotPicker;
