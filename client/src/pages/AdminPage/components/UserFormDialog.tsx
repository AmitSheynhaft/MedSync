import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Stack, Typography, InputAdornment, IconButton, Alert,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { User, UpdateUserInput, CreateUserInput } from '../../../api/users';

interface EditProps {
  mode: 'edit';
  user: User;
  roles: { id: string; name: string }[];
  clinics: { id: string; name: string }[];
  onClose: () => void;
  onSave: (input: UpdateUserInput) => Promise<void>;
}

interface CreateProps {
  mode: 'create';
  roles: { id: string; name: string }[];
  clinics: { id: string; name: string }[];
  onClose: () => void;
  onSave: (input: CreateUserInput) => Promise<void>;
}

type Props = (EditProps | CreateProps) & { open: boolean };

const GENDER_OPTIONS = [
  { value: 'male',   label: 'זכר' },
  { value: 'female', label: 'נקבה' },
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'אדמין', doctor: 'רופא', patient: 'מטופל', secretary: 'מזכירה',
};

/* ── Validators ──────────────────────────────────────────── */
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPhone = (v: string) => /^0[0-9]{1,2}[-\s]?[0-9]{3}[-\s]?[0-9]{4}$/.test(v.trim());
const isValidPassword = (v: string) =>
  v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v);
const isValidDate = (v: string) => {
  if (!v) return true;
  const d = new Date(v);
  return !isNaN(d.getTime()) && d.getFullYear() >= 1900 && d < new Date();
};

type Errors = Partial<Record<'fullName' | 'email' | 'password' | 'phone' | 'birthDate', string>>;

const UserFormDialog: React.FC<Props> = (props) => {
  const { open, mode, roles, clinics, onClose } = props;
  const isEdit = mode === 'edit';
  const user = isEdit ? (props as EditProps).user : null;

  const [fullName,   setFullName]   = useState(user?.fullName ?? '');
  const [email,      setEmail]      = useState(user?.email ?? '');
  const [phone,      setPhone]      = useState(user?.phone ?? '');
  const [password,   setPassword]   = useState('');
  const [gender,     setGender]     = useState(user?.gender ?? '');
  const [birthDate,  setBirthDate]  = useState(user?.birthDate?.slice(0, 10) ?? '');
  const [roleId,        setRoleId]        = useState('');
  const [clinicId,      setClinicId]      = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization,setSpecialization]= useState('');
  const [errors,        setErrors]        = useState<Errors>({});
  const [saving,        setSaving]        = useState(false);
  const [saveError,     setSaveError]     = useState<string | null>(null);
  const birthDateRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    setFullName(user?.fullName ?? '');
    setEmail(user?.email ?? '');
    setPhone(user?.phone ?? '');
    setPassword('');
    setGender(user?.gender ?? '');
    setBirthDate(user?.birthDate?.slice(0, 10) ?? '');
    setErrors({});
    setSaveError(null);
    const matched = roles.find((r) => r.name === user?.role?.name);
    setRoleId(matched?.id ?? '');
    setClinicId('');
    setLicenseNumber((isEdit ? (props as EditProps).user.caregiver?.licenseNumber : '') ?? '');
    setSpecialization((isEdit ? (props as EditProps).user.caregiver?.specialization : '') ?? '');
  }, [open, user, roles]);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!fullName.trim() || fullName.trim().length < 2)
      e.fullName = 'שם חייב להכיל לפחות 2 תווים';
    if (!email.trim())
      e.email = 'אימייל הוא שדה חובה';
    else if (!isValidEmail(email))
      e.email = 'כתובת אימייל אינה תקינה';
    if (!isEdit && !password)
      e.password = 'סיסמה היא שדה חובה';
    else if (password && !isValidPassword(password))
      e.password = 'סיסמה חייבת: לפחות 8 תווים, אות גדולה ומספר';
    if (phone && !isValidPhone(phone))
      e.phone = 'מספר טלפון לא תקין (לדוגמה: 050-1234567)';
    if (birthDate && !isValidDate(birthDate))
      e.birthDate = 'תאריך לידה אינו תקין';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    setSaveError(null);
    try {
      if (isEdit) {
        await (props as EditProps).onSave({
          fullName: fullName.trim(),
          email: email.trim(),
          phone:      phone     || undefined,
          gender:     gender    || undefined,
          birthDate:  birthDate || undefined,
          roleId:     roleId    || undefined,
          licenseNumber:  roles.find(r => r.id === roleId)?.name === 'doctor' ? (licenseNumber.trim() || undefined) : undefined,
          specialization: roles.find(r => r.id === roleId)?.name === 'doctor' ? (specialization.trim() || undefined) : undefined,
        });
      } else {
        const selectedRole = roles.find(r => r.id === roleId)?.name;
        await (props as CreateProps).onSave({
          fullName: fullName.trim(),
          email:    email.trim(),
          password,
          phone:     phone     || undefined,
          gender:    gender    || undefined,
          birthDate: birthDate || undefined,
          roleId:    roleId    || undefined,
          clinicId:  clinicId  || undefined,
          licenseNumber:  selectedRole === 'doctor' && licenseNumber  ? licenseNumber.trim()  : undefined,
          specialization: selectedRole === 'doctor' && specialization ? specialization.trim() : undefined,
        });
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'שמירה נכשלה');
    } finally {
      setSaving(false);
    }
  };

  const fieldSx = { size: 'small' as const, fullWidth: true };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEdit ? 'עריכת משתמש' : 'משתמש חדש'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 1 }}>

          {saveError && <Alert severity="error" onClose={() => setSaveError(null)}>{saveError}</Alert>}

          <TextField
            {...fieldSx}
            label="שם מלא"
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: undefined })); }}
            required
            error={!!errors.fullName}
            helperText={errors.fullName}
          />

          <TextField
            {...fieldSx}
            label="אימייל"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
            required
            error={!!errors.email}
            helperText={errors.email}
          />

          {!isEdit && (
            <TextField
              {...fieldSx}
              label="סיסמה"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
              required
              error={!!errors.password}
              helperText={errors.password ?? 'לפחות 8 תווים, אות גדולה ומספר'}
            />
          )}

          <TextField
            {...fieldSx}
            select
            label="תפקיד"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          >
            <MenuItem value="">— בחר תפקיד —</MenuItem>
            {roles.map((r) => (
              <MenuItem key={r.id} value={r.id}>{ROLE_LABELS[r.name] ?? r.name}</MenuItem>
            ))}
          </TextField>

          {!isEdit && (() => {
            const selectedRole = roles.find(r => r.id === roleId)?.name;
            const needsClinic = selectedRole === 'secretary' || selectedRole === 'doctor';
            return needsClinic ? (
              <TextField {...fieldSx} select label="מרפאה" value={clinicId} onChange={(e) => setClinicId(e.target.value)} required>
                <MenuItem value="">— בחר מרפאה —</MenuItem>
                {clinics.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>
            ) : null;
          })()}

          {roles.find(r => r.id === roleId)?.name === 'doctor' && (
            <>
              <TextField
                {...fieldSx}
                label="מספר רישיון"
                placeholder="123456"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
              <TextField
                {...fieldSx}
                label="התמחות"
                placeholder="קרדיולוגיה"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              />
            </>
          )}

          <TextField
            {...fieldSx}
            label="טלפון"
            placeholder="050-1234567"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })); }}
            error={!!errors.phone}
            helperText={errors.phone}
          />

          <TextField
            {...fieldSx}
            select
            label="מגדר"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <MenuItem value="">— לא צוין —</MenuItem>
            {GENDER_OPTIONS.map((g) => (
              <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
            ))}
          </TextField>

          <TextField
            {...fieldSx}
            label="תאריך לידה"
            type="date"
            value={birthDate}
            inputRef={birthDateRef}
            onChange={(e) => { setBirthDate(e.target.value); setErrors((p) => ({ ...p, birthDate: undefined })); }}
            error={!!errors.birthDate}
            helperText={errors.birthDate}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={() => (birthDateRef.current as any)?.showPicker?.()}
                      sx={{ color: birthDate ? '#3b5bdb' : '#adb5bd', p: 0.5 }}
                    >
                      <CalendarTodayIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  '& input': { cursor: 'pointer' },
                  '& input::-webkit-calendar-picker-indicator': { display: 'none' },
                },
              },
            }}
          />

          {Object.values(errors).some(Boolean) && (
            <Typography sx={{ fontSize: 12, color: 'error.main' }}>
              יש לתקן את השגיאות המסומנות לפני השמירה
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>ביטול</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'שומר...' : 'שמור'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormDialog;
