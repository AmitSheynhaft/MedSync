export const ROLE_LABELS: Record<string, string> = {
  admin: 'אדמין',
  doctor: 'רופא',
  patient: 'מטופל',
  secretary: 'מזכירה',
};

export const ROLE_CHIP: Record<string, { bg: string; fg: string }> = {
  admin: { bg: '#fff0f0', fg: '#fa5252' },
  doctor: { bg: '#f3f0ff', fg: '#7048e8' },
  secretary: { bg: '#e7f5ff', fg: '#3b5bdb' },
  patient: { bg: '#ebfbee', fg: '#40c057' },
};

export const GENDER_LABELS: Record<string, string> = {
  male: 'זכר',
  female: 'נקבה',
  MALE: 'זכר',
  FEMALE: 'נקבה',
};
