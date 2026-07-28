import React from 'react';
import { Box, TextField } from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { RTL_TEXT_DIRECTION } from '../../constants';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { vitalsSectionGridSx, vitalsSectionIconSx } from './styles';

type TVitalField = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

interface IVitalsSectionProps {
  bloodPressure: string;
  setBloodPressure: (v: string) => void;
  pulse: string;
  setPulse: (v: string) => void;
  bodyTemp: string;
  setBodyTemp: (v: string) => void;
  weight: string;
  setWeight: (v: string) => void;
  height: string;
  setHeight: (v: string) => void;
  oxygenSat: string;
  setOxygenSat: (v: string) => void;
  isReadOnly: boolean;
}

export const VitalsSection: React.FC<IVitalsSectionProps> = ({
  bloodPressure, setBloodPressure, pulse, setPulse, bodyTemp, setBodyTemp,
  weight, setWeight, height, setHeight, oxygenSat, setOxygenSat, isReadOnly,
}) => {
  const VITALS_FIELDS: TVitalField[] = [
    { label: 'לחץ דם',  placeholder: '120/80', value: bloodPressure, onChange: setBloodPressure },
    { label: 'דופק',    placeholder: '72 bpm', value: pulse,         onChange: setPulse },
    { label: 'חום',     placeholder: '36.6°C', value: bodyTemp,      onChange: setBodyTemp },
    { label: 'משקל',    placeholder: '70 kg',  value: weight,        onChange: setWeight },
    { label: 'גובה',    placeholder: '170 cm', value: height,        onChange: setHeight },
    { label: 'סטורציה', placeholder: '98%',    value: oxygenSat,     onChange: setOxygenSat },
  ];

  return (
    <>
      <SectionHeader icon={<MonitorHeartIcon sx={vitalsSectionIconSx} />} label="מדדים" color="#0c8599" bg="#e3fafc" />
      <Box sx={vitalsSectionGridSx}>
        {VITALS_FIELDS.map(({ label, placeholder, value, onChange }) => (
          <TextField
            key={label}
            size="small"
            fullWidth
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={isReadOnly}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: RTL_TEXT_DIRECTION }}
          />
        ))}
      </Box>
    </>
  );
};

export default VitalsSection;
