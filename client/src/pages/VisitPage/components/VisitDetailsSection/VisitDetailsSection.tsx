import React from 'react';
import { Box, MenuItem, TextField } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { RTL_TEXT_DIRECTION } from '../../constants';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { visitDetailsSectionGridSx, visitDetailsSectionIconSx } from './styles';

interface IVisitDetailsSectionProps {
  visitType: string;
  setVisitType: (v: string) => void;
  followUpDate: string;
  setFollowUpDate: (v: string) => void;
  referralNotes: string;
  setReferralNotes: (v: string) => void;
  isReadOnly: boolean;
}

const VISIT_TYPE_OPTIONS = [
  { value: '', label: 'בחר סוג...' },
  { value: 'REGULAR', label: 'רגיל' },
  { value: 'EMERGENCY', label: 'חירום' },
  { value: 'FOLLOW_UP', label: 'מעקב' },
];

export const VisitDetailsSection: React.FC<IVisitDetailsSectionProps> = ({
  visitType, setVisitType, followUpDate, setFollowUpDate, referralNotes, setReferralNotes, isReadOnly,
}) => (
  <>
    <SectionHeader icon={<AssignmentIcon sx={visitDetailsSectionIconSx} />} label="פרטי ביקור" color="#3b5bdb" bg="#eef2ff" />
    <Box sx={visitDetailsSectionGridSx}>
      <TextField select size="small" fullWidth label="סוג ביקור" value={visitType} onChange={e => setVisitType(e.target.value)}
        disabled={isReadOnly} slotProps={{ inputLabel: { shrink: true } }}>
        {VISIT_TYPE_OPTIONS.map(option => (
          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ))}
      </TextField>
      <TextField type="date" size="small" fullWidth label="תאריך מעקב" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)}
        disabled={isReadOnly} slotProps={{ inputLabel: { shrink: true } }} />
    </Box>
    <TextField multiline rows={2} size="small" fullWidth label="הערות הפניה" placeholder="הערות הפניה..." value={referralNotes}
      onChange={e => setReferralNotes(e.target.value)} disabled={isReadOnly}
      slotProps={{ inputLabel: { shrink: true }, htmlInput: RTL_TEXT_DIRECTION }} />
  </>
);

export default VisitDetailsSection;
