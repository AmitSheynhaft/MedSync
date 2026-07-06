import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import type { TFieldConfig } from '../types';

const ICON_SX = { color: '#adb5bd', fontSize: 18 };

export const ACCOUNT_FIELDS: TFieldConfig[] = [
  {
    key: 'fullName',
    placeholder: 'שם מלא',
    icon: <PersonIcon sx={ICON_SX} />,
    autoComplete: 'name',
    required: true,
    getValue: f => f.fullName,
    onChange: (f, v) => f.setFullName(v),
  },
  {
    key: 'idOrLicense',
    placeholder: (role) => (role === 'doctor' ? 'מספר רישיון' : 'תעודת זהות'),
    icon: <BadgeIcon sx={ICON_SX} />,
    autoComplete: 'off',
    getValue: f => f.idOrLicense,
    onChange: (f, v) => f.setIdOrLicense(v),
  },
  {
    key: 'email',
    placeholder: 'כתובת אימייל',
    icon: <EmailIcon sx={ICON_SX} />,
    type: 'email',
    autoComplete: 'email',
    required: true,
    getValue: f => f.email,
    onChange: (f, v) => f.setEmail(v),
  },
  {
    key: 'password',
    placeholder: 'סיסמה',
    icon: <LockIcon sx={ICON_SX} />,
    type: 'password',
    autoComplete: 'new-password',
    required: true,
    getValue: f => f.password,
    onChange: (f, v) => f.setPassword(v),
  },
];
