import React from 'react';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

export interface RegisterRoleConfig {
  label: string;
  icon: React.ReactElement;
  color: string;
  heading: string;
  subtitle: string;
}

export const roleConfig: Record<'patient' | 'doctor', RegisterRoleConfig> = {
  patient: {
    label: 'מטופל',
    icon: <PersonIcon sx={{ fontSize: 16 }} />,
    color: '#0ca678',
    heading: 'יצירת חשבון מטופל',
    subtitle: 'נהל את הרשומות הרפואיות שלך במקום אחד.',
  },
  doctor: {
    label: 'רופא',
    icon: <LocalHospitalIcon sx={{ fontSize: 16 }} />,
    color: '#7048e8',
    heading: 'יצירת חשבון רופא',
    subtitle: 'הגדר את הפרקטיקה שלך ונהל מטופלים.',
  },
};

export const STEPS = ['פרטי חשבון', 'פרטים אישיים'];

export const resolveRegisterRole = (role?: string): RegisterRoleConfig =>
  roleConfig[role as keyof typeof roleConfig] || roleConfig.patient;
