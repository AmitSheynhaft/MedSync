import type { RegisterFormState } from './hooks/useRegisterForm';

export type TFieldOption = {
  value: string;
  label: string;
};

export type TFieldConfig = {
  key: string;
  placeholder?: string | ((isTherapist: boolean) => string);
  label?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  icon?: React.ReactElement;
  select?: boolean;
  options?: TFieldOption[];
  inputLabelShrink?: boolean;
  showFor?: 'therapist' | 'patient';
  getValue: (form: RegisterFormState) => string;
  onChange: (form: RegisterFormState, value: string) => void;
};
