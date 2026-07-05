import React from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { PatientSummary } from '../../../api/patients';
import ClickableCard from '../../../components/ClickableCard/ClickableCard';
import { initials } from '../utils';
import { getGenderLabel } from '../../../utils/format';

interface PatientListItemProps {
  patient: PatientSummary;
}

export const PatientListItem: React.FC<PatientListItemProps> = ({ patient }) => (
  <ClickableCard to={`/patients/${patient.id}`}>
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.75,
        px: { xs: 1.75, sm: 2 },
        py: { xs: 1.4, sm: 1.6 },
        border: '1px solid #dfe3ea',
        borderRadius: 2,
        bgcolor: '#fff',
        '&:hover': { borderColor: '#3b5bdb', boxShadow: '0 4px 14px rgba(59,91,219,0.12)' },
        transition: 'all 0.15s ease',
      }}
    >
      <Avatar
        sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: 'primary.main', fontSize: 14, fontWeight: 700, flexShrink: 0 }}
      >
        {initials(patient.firstName, patient.lastName)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>
          {patient.firstName} {patient.lastName}
        </Typography>
        <Typography sx={{ fontSize: 13, color: '#868e96' }}>
          ת"ז: {patient.idNumber ?? patient.id.slice(0, 8).toUpperCase()}
          {patient.age > 0 ? ` • גיל ${patient.age}` : ''}
          {patient.gender ? ` • ${getGenderLabel(patient.gender)}` : ''}
        </Typography>
      </Box>
      <ChevronLeftIcon sx={{ color: '#c7cfdb', flexShrink: 0, fontSize: 20 }} />
    </Paper>
  </ClickableCard>
);

export default PatientListItem;
