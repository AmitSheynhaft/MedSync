import React from 'react';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

export interface LoginRoleConfig {
  label: string;
  icon: React.ReactElement;
  color: string;
  heading: string;
  subtitle: string;
  redirect: string;
}

export const roleConfig: Record<'patient' | 'doctor', LoginRoleConfig> = {
  patient: {
    label: 'מטופל',
    icon: <PersonIcon sx={{ fontSize: 16 }} />,
    color: '#0ca678',
    heading: 'ברוך הבא',
    subtitle: 'התחבר לחשבונך כדי לצפות ברשומות הבריאות שלך.',
    redirect: '/dashboard',
  },
  doctor: {
    label: 'רופא',
    icon: <MedicalServicesIcon sx={{ fontSize: 16 }} />,
    color: '#7048e8',
    heading: 'ברוך הבא',
    subtitle: 'התחבר לחשבונך לניהול מטופלים.',
    redirect: '/patients',
  },
};

export const resolveLoginRole = (role?: string): LoginRoleConfig =>
  roleConfig[role as keyof typeof roleConfig] || roleConfig.patient;
