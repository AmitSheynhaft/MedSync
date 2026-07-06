import React from 'react';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

export interface RegisterRoleConfig {
  label: string;
  icon: React.ReactElement;
  color: string;
  heading: string;
  subtitle: string;
}

export const roleConfig: Record<'patient' | 'doctor' | 'secretary', RegisterRoleConfig> = {
  patient: {
    label: 'מטופל',
    icon: <PersonIcon sx={{ fontSize: 16 }} />,
    color: '#0ca678',
    heading: 'יצירת חשבון מטופל',
    subtitle: 'נהל את הרשומות הרפואיות שלך במקום אחד.',
  },
  doctor: {
    label: 'מטפל',
    icon: <LocalHospitalIcon sx={{ fontSize: 16 }} />,
    color: '#7048e8',
    heading: 'יצירת חשבון מטפל',
    subtitle: 'נהל מטופלים, ביקורים ותיעוד רפואי במקום אחד.',
  },
  secretary: {
    label: 'מזכירות',
    icon: <SupportAgentIcon sx={{ fontSize: 16 }} />,
    color: '#1971c2',
    heading: 'יצירת חשבון מזכירות',
    subtitle: 'תאם תורים בין מטפלים למטופלים ונהל מסמכים.',
  },
};

export const STEPS = ['פרטי חשבון', 'פרטים אישיים'];

export const resolveRegisterRole = (role?: string): RegisterRoleConfig =>
  roleConfig[role as keyof typeof roleConfig] || roleConfig.patient;
