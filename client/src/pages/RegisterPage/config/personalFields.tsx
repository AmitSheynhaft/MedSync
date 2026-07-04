import PhoneIcon from '@mui/icons-material/Phone';
import type { TFieldConfig } from '../types';

const ICON_SX = { color: '#adb5bd', fontSize: 18 };

export const PERSONAL_FIELDS: TFieldConfig[] = [
  {
    key: 'specialization',
    placeholder: 'התמחות',
    autoComplete: 'off',
    required: true,
    showFor: 'doctor',
    getValue: f => f.specialization,
    onChange: (f, v) => f.setSpecialization(v),
  },
  {
    key: 'phone',
    placeholder: 'טלפון',
    autoComplete: 'tel',
    required: true,
    icon: <PhoneIcon sx={ICON_SX} />,
    getValue: f => f.phone,
    onChange: (f, v) => f.setPhone(v),
  },
  {
    key: 'birthDate',
    label: 'תאריך לידה',
    type: 'date',
    inputLabelShrink: true,
    getValue: f => f.birthDate,
    onChange: (f, v) => f.setBirthDate(v),
  },
  {
    key: 'gender',
    label: 'מין',
    select: true,
    options: [
      { value: '', label: 'לא צוין' },
      { value: 'male', label: 'זכר' },
      { value: 'female', label: 'נקבה' },
      { value: 'other', label: 'אחר' },
    ],
    getValue: f => f.gender,
    onChange: (f, v) => f.setGender(v),
  },
  {
    key: 'hmo',
    placeholder: 'קופת חולים',
    autoComplete: 'off',
    required: true,
    showFor: 'patient',
    getValue: f => f.hmo,
    onChange: (f, v) => f.setHmo(v),
  },
  {
    key: 'address',
    placeholder: 'כתובת',
    autoComplete: 'street-address',
    required: true,
    showFor: 'patient',
    getValue: f => f.address,
    onChange: (f, v) => f.setAddress(v),
  },
];
