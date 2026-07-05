import React from 'react';
import { TextField, InputAdornment, MenuItem } from '@mui/material';
import type { RegisterFormState } from '../hooks/useRegisterForm';
import type { TFieldConfig } from '../types';

export interface IFormFieldsProps {
  fields: TFieldConfig[];
  form: RegisterFormState;
  isDoctor: boolean;
}

export const FormFields: React.FC<IFormFieldsProps> = ({ fields, form, isDoctor }) => {
  const roleKey = isDoctor ? 'doctor' : 'patient';
  const visibleFields = fields.filter(f => !f.showFor || f.showFor === roleKey);

  return (
    <>
      {visibleFields.map(({ key, placeholder, label, type, autoComplete, required, icon, select, options, inputLabelShrink, getValue, onChange }) => {
        const resolvedOptions = typeof options === 'function' ? options(form) : options;
        return (
          <TextField
            key={key}
            required={required}
            type={type}
            placeholder={typeof placeholder === 'function' ? placeholder(isDoctor) : placeholder}
            label={label}
            autoComplete={autoComplete}
            select={select}
            value={getValue(form)}
            onChange={e => onChange(form, e.target.value)}
            slotProps={{
              ...(icon ? { input: { startAdornment: <InputAdornment position="start">{icon}</InputAdornment> } } : {}),
              ...(inputLabelShrink ? { inputLabel: { shrink: true } } : {}),
            }}
          >
            {resolvedOptions?.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
        );
      })}
    </>
  );
};

export default FormFields;
