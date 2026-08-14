export const GENDER_OPTIONS = [
  { value: 'male', label: 'זכר' },
  { value: 'female', label: 'נקבה' },
];

export type UserFormErrors = Partial<
  Record<'fullName' | 'email' | 'password' | 'phone' | 'birthDate' | 'clinicId' | 'licenseNumber' | 'specialization', string>
>;

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  return /^0[0-9]{1,2}[-\s]?[0-9]{3}[-\s]?[0-9]{4}$/.test(value.trim());
}

export function isValidPassword(value: string): boolean {
  return value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);
}

export function isValidDate(value: string): boolean {
  if (!value) return true;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getFullYear() >= 1900 && date < new Date();
}
