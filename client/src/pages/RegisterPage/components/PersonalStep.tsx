import React from 'react';
import type { RegisterFormState } from '../hooks/useRegisterForm';
import { FormFields } from './FormFields';
import { PERSONAL_FIELDS } from '../config/personalFields';

interface IPersonalStepProps {
  form: RegisterFormState;
  isDoctor: boolean;
}

export const PersonalStep: React.FC<IPersonalStepProps> = ({ form, isDoctor }) => (
  <FormFields fields={PERSONAL_FIELDS} form={form} isDoctor={isDoctor} />
);

export default PersonalStep;
