import React from 'react';
import { Button } from '@mui/material';
import type { RegisterFormState } from '../hooks/useRegisterForm';
import { FormFields } from './FormFields';
import { ACCOUNT_FIELDS } from '../config/accountFields';

interface IAccountStepProps {
  form: RegisterFormState;
  isDoctor: boolean;
  color: string;
}

export const AccountStep: React.FC<IAccountStepProps> = ({ form, isDoctor, color }) => (
  <>
    <FormFields fields={ACCOUNT_FIELDS} form={form} isDoctor={isDoctor} />
    <Button
      type="button"
      variant="contained"
      size="large"
      fullWidth
      onClick={form.handleNext}
      sx={{ mt: 0.5, py: 1, fontSize: 15, bgcolor: color, '&:hover': { bgcolor: color, filter: 'brightness(0.9)' } }}
    >
      המשך
    </Button>
  </>
);

export default AccountStep;
