import React from 'react';
import { FormControlLabel, Checkbox, Typography } from '@mui/material';
import { termsCheckboxSx, termsLinkSx, termsTextSx } from './TermsCheckbox.styles';

interface ITermsCheckboxProps {
  agreed: boolean;
  onChange: (checked: boolean) => void;
  color: string;
}

const termsLink = (label: string, color: string) => (
  <Typography component="a" href="#" sx={termsLinkSx(color)}>
    {label}
  </Typography>
);

export const TermsCheckbox: React.FC<ITermsCheckboxProps> = ({ agreed, onChange, color }) => (
  <FormControlLabel
    control={<Checkbox checked={agreed} onChange={e => onChange(e.target.checked)} size="small" sx={termsCheckboxSx(color)} />}
    label={
      <Typography sx={termsTextSx}>
        אני מסכים ל{termsLink('תנאי שימוש', color)}{' '}ו{termsLink('מדיניות פרטיות', color)}
      </Typography>
    }
  />
);

export default TermsCheckbox;
