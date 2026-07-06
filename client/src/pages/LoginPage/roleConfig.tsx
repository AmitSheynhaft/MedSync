import React from 'react';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

export interface LoginRoleConfig {
  label: string;
  icon: React.ReactElement;
  color: string;
  heading: string;
  subtitle: string;
  redirect: string;
}

export const roleConfig: Record<'patient' | 'doctor' | 'admin' | 'secretary', LoginRoleConfig> = {
  patient: {
    label: 'מטופל',
    icon: <PersonIcon sx={{ fontSize: 16 }} />,
    color: '#0ca678',
    heading: 'ברוך הבא',
    subtitle: 'התחבר לחשבונך כדי לצפות ברשומות הבריאות שלך.',
    redirect: '/dashboard',
  },
  doctor: {
    label: 'מטפל',
    icon: <MedicalServicesIcon sx={{ fontSize: 16 }} />,
    color: '#7048e8',
    heading: 'ברוך הבא',
    subtitle: 'התחבר לחשבונך לניהול מטופלים.',
    redirect: '/patients',
  },
  admin: {
    label: 'מנהל מערכת',
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 16 }} />,
    color: '#e03131',
    heading: 'כניסת מנהל',
    subtitle: 'התחבר לממשק ניהול המערכת.',
    redirect: '/admin',
  },
  secretary: {
    label: 'מזכירות',
    icon: <SupportAgentIcon sx={{ fontSize: 16 }} />,
    color: '#1971c2',
    heading: 'ברוך הבא',
    subtitle: 'התחבר לחשבונך לתיאום תורים וניהול מסמכים.',
    redirect: '/schedule',
  },
};

export const resolveLoginRole = (role?: string): LoginRoleConfig =>
  roleConfig[role as keyof typeof roleConfig] || roleConfig.patient;
