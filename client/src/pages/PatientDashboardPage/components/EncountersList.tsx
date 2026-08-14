import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Encounter } from '../../../api/patients';
import ClickableCard from '../../../components/ClickableCard/ClickableCard';
import {
  encounterCardSx,
  encounterChevronSx,
  encounterDateSx,
  encounterDateWrapSx,
  encounterDoctorNameSx,
  encounterDoctorWrapSx,
  encounterIconSx,
  encounterIconWrapSx,
  encounterMetaSx,
  encounterTopRowSx,
  encountersListEmptySx,
  encountersListRootSx,
  encountersListScrollSx,
  encountersListTitleSx,
} from './EncountersList.styles';

interface EncountersListProps {
  encounters: Encounter[];
  patientId: string;
}

export const EncountersList: React.FC<EncountersListProps> = ({ encounters, patientId }) => (
  <Paper elevation={0} sx={encountersListRootSx}>
    <Typography sx={encountersListTitleSx}>ביקורים אחרונים</Typography>
    {encounters.length === 0 ? (
      <Typography sx={encountersListEmptySx}>אין ביקורים קודמים.</Typography>
    ) : (
      <Stack spacing={1} sx={encountersListScrollSx}>
        {encounters.map((encounter, idx) => (
          <ClickableCard key={encounter.id} to={`/patients/${patientId}/visits/${encounter.id}`}>
            <Paper elevation={0} sx={encounterCardSx}>
              <Stack direction="row" sx={encounterTopRowSx}>
                <Stack direction="row" spacing={1} sx={encounterDoctorWrapSx}>
                  <Box sx={encounterIconWrapSx(idx === 0)}>
                    <MedicalServicesIcon sx={encounterIconSx} />
                  </Box>
                  <Typography sx={encounterDoctorNameSx}>{encounter.doctor}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} sx={encounterDateWrapSx}>
                  <Typography sx={encounterDateSx}>{encounter.date}</Typography>
                  <ChevronLeftIcon sx={encounterChevronSx} />
                </Stack>
              </Stack>
              <Typography sx={encounterMetaSx}>{encounter.specialty} • {encounter.type}</Typography>
            </Paper>
          </ClickableCard>
        ))}
      </Stack>
    )}
  </Paper>
);

export default EncountersList;
