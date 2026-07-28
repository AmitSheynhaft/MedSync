import React from 'react';
import { Button } from '@mui/material';
import type { RegisterFormState } from '../hooks/useRegisterForm';
import type { RegisterRole } from '../types';
import { FormFields } from './FormFields';
import { ACCOUNT_FIELDS } from '../config/accountFields';
import { accountStepContinueButtonSx } from './AccountStep.styles';

interface IAccountStepProps {
  form: RegisterFormState;
  role: RegisterRole;
  color: string;
}

export const AccountStep: React.FC<IAccountStepProps> = ({ form, role, color }) => (
  <>
    <FormFields fields={ACCOUNT_FIELDS} form={form} role={role} />
    <Button
      type="button"
      variant="contained"
      size="large"
      fullWidth
      onClick={form.handleNext}
      sx={accountStepContinueButtonSx(color)}
    >
      המשך
    </Button>
  </>
);

export default AccountStep;
