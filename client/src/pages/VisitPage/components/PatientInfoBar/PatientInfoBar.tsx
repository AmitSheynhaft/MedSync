import React from 'react';
import { Stack, Typography, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import { PatientInfoBarRoot } from '../../styled';
import { PatientInfo } from '../../constants';
import {
  patientInfoBarIdentitySx,
  patientInfoBarNameSx,
  patientInfoBarPersonIconSx,
  patientInfoBloodTypeChipSx,
  patientInfoChipSx,
  patientInfoPhoneIconSx,
} from './styles';

interface PatientInfoBarProps {
  info: PatientInfo;
}

export const PatientInfoBar: React.FC<PatientInfoBarProps> = ({ info }) => (
  <PatientInfoBarRoot>
    <Stack direction="row" sx={patientInfoBarIdentitySx}>
      <PersonIcon sx={patientInfoBarPersonIconSx} />
      <Typography sx={patientInfoBarNameSx}>{info.name}</Typography>
    </Stack>
    {info.idNumber && <Chip label={`ID: ${info.idNumber}`} size="small" variant="outlined" sx={patientInfoChipSx} />}
    {info.phone && <Chip icon={<PhoneIcon sx={patientInfoPhoneIconSx} />} label={info.phone} size="small" variant="outlined" sx={patientInfoChipSx} />}
    {info.dob && <Chip label={`DOB: ${info.dob}`} size="small" variant="outlined" sx={patientInfoChipSx} />}
    {info.hmo && <Chip label={`HMO: ${info.hmo}`} size="small" variant="outlined" sx={patientInfoChipSx} />}
    {info.bloodType && <Chip label={`🩸 ${info.bloodType}`} size="small" sx={patientInfoBloodTypeChipSx} />}
  </PatientInfoBarRoot>
);

export default PatientInfoBar;
