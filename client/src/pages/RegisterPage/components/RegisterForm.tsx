import React from 'react';
import { Box } from '@mui/material';
import type { RegisterFormState } from '../hooks/useRegisterForm';
import type { RegisterRole } from '../types';
import { AccountStep } from './AccountStep';
import { PersonalStep } from './PersonalStep';
import { TermsCheckbox } from './TermsCheckbox';
import { StepActions } from './StepActions';
import { registerFormSx } from './RegisterForm.styles';

interface IRegisterFormProps {
  form: RegisterFormState;
  role: RegisterRole;
  color: string;
}

export const RegisterForm: React.FC<IRegisterFormProps> = ({ form, role, color }) => (
  <Box component="form" onSubmit={form.handleSubmit} sx={registerFormSx}>
    {form.step === 0 ? (
      <AccountStep form={form} role={role} color={color} />
    ) : (
      <>
        <PersonalStep form={form} role={role} />
        <TermsCheckbox agreed={form.agreed} onChange={form.setAgreed} color={color} />
        <StepActions color={color} submitting={form.submitting} onBack={form.handleBack} />
      </>
    )}
  </Box>
);

export default RegisterForm;
