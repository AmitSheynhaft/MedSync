import React from 'react';
import type { RegisterFormState } from '../../hooks/useRegisterForm';
import type { RegisterRole } from '../../types';
import { FormFields } from '../FormFields/FormFields';
import { PERSONAL_FIELDS } from '../../config/personalFields';

interface IPersonalStepProps {
  form: RegisterFormState;
  role: RegisterRole;
}

export const PersonalStep: React.FC<IPersonalStepProps> = ({ form, role }) => (
  <FormFields fields={PERSONAL_FIELDS} form={form} role={role} />
);

export default PersonalStep;
