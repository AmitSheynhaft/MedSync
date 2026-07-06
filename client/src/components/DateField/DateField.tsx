import React from 'react';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

type DateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
} & Omit<TextFieldProps, 'value' | 'onChange' | 'type'>;

export const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  size = 'small',
  slotProps,
  ...rest
}) => (
  <TextField
    {...rest}
    type="date"
    label={label}
    size={size}
    value={value}
    onChange={e => onChange(e.target.value)}
    onKeyDown={e => e.preventDefault()}
    slotProps={{
      ...slotProps,
      inputLabel: { shrink: true, ...slotProps?.inputLabel },
      htmlInput: { min, max, ...slotProps?.htmlInput },
    }}
  />
);

export default DateField;
