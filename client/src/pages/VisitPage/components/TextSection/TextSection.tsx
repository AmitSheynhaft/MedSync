import React from 'react';
import { TextField } from '@mui/material';
import { RTL_TEXT_DIRECTION } from '../../constants';
import { SectionHeader } from '../SectionHeader/SectionHeader';

interface ITextSectionProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  bg: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  rows?: number;
}

export const TextSection: React.FC<ITextSectionProps> = ({
  icon, label, color, bg, placeholder, value, onChange, disabled = false, rows = 4,
}) => (
  <>
    <SectionHeader icon={icon} label={label} color={color} bg={bg} />
    <TextField
      multiline
      rows={rows}
      size="small"
      fullWidth
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      slotProps={{ htmlInput: RTL_TEXT_DIRECTION }}
    />
  </>
);

export default TextSection;
