import type { RegisterFormState } from "./hooks/useRegisterForm";
import { Role } from "../../constants/roles";

export type RegisterRole = Role.Doctor | Role.Patient | Role.Secretary;

export function parseRegisterRole(role?: string): RegisterRole {
  if (role === Role.Doctor) return Role.Doctor;
  if (role === Role.Secretary) return Role.Secretary;
  return Role.Patient;
}

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
