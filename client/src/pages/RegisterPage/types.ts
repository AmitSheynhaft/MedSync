import type { RegisterFormState } from './hooks/useRegisterForm';

export type RegisterRole = 'doctor' | 'patient' | 'secretary' | 'admin';

export type TFieldOption = {
  value: string;
  label: string;
};

export type TFieldConfig = {
  key: string;
  placeholder?: string | ((role: RegisterRole) => string);
  label?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  icon?: React.ReactElement;
  select?: boolean;
  options?: TFieldOption[] | ((form: RegisterFormState) => TFieldOption[]);
  inputLabelShrink?: boolean;
  showFor?: RegisterRole;
  hideFor?: RegisterRole[];
  getValue: (form: RegisterFormState) => string;
  onChange: (form: RegisterFormState, value: string) => void;
};
