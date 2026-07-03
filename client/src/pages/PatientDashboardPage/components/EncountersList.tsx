import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Encounter } from '../../../api/patients';
import ClickableCard from '../../../components/ClickableCard/ClickableCard';

interface EncountersListProps {
  encounters: Encounter[];
  patientId: string;
}

export const EncountersList: React.FC<EncountersListProps> = ({ encounters, patientId }) => (
  <Box>
    <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#384152', mb: 1.25, letterSpacing: '0.04em' }}>ביקורים אחרונים</Typography>
    {encounters.length === 0 ? (
      <Typography sx={{ color: '#868e96', fontSize: 14 }}>אין ביקורים קודמים.</Typography>
    ) : (
      <Stack spacing={1}>
        {encounters.map((encounter, idx) => (
          <ClickableCard key={encounter.id} to={`/patients/${patientId}/visits/${encounter.id}`}>
            <Paper elevation={0} sx={{ border: '1px solid #dfe4ec', borderRadius: 3, p: 1.75, bgcolor: '#fff', boxShadow: '0 1px 2px rgba(15,23,42,0.03)', '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(59,91,219,0.1)' }, transition: 'all 0.15s ease' }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: idx > 0 ? '#f3f4f6' : '#edf2ff', color: idx > 0 ? '#8b93a1' : 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MedicalServicesIcon sx={{ fontSize: 14 }} />
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{encounter.doctor}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12, color: '#868e96' }}>{encounter.date}</Typography>
                  <ChevronLeftIcon sx={{ fontSize: 14, color: '#ced4da' }} />
                </Stack>
              </Stack>
              <Typography sx={{ fontSize: 12, color: '#7b8494' }}>{encounter.specialty} • {encounter.type}</Typography>
            </Paper>
          </ClickableCard>
        ))}
      </Stack>
    )}
  </Box>
);

export default EncountersList;
