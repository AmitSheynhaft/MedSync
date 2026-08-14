import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Stack, Typography, InputAdornment, IconButton, Alert,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { UpdateUserInput, CreateUserInput } from '../../../api/users';
import { IAdminUserListItem } from '../../../api/admin/users';
import { ROLE_LABELS } from './adminUser.constants';
import {
  GENDER_OPTIONS,
  isValidDate,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  UserFormErrors,
} from './userForm.validation';
import {
  userFormCalendarButtonSx,
  userFormCalendarIconSx,
  userFormDateInputSx,
  userFormDialogActionsSx,
  userFormDialogStackSx,
  userFormDialogTitleSx,
  userFormValidationTextSx,
} from './UserFormDialog.styles';

interface EditProps {
  mode: 'edit';
  user: IAdminUserListItem;
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
type DateInputElement = HTMLInputElement & { showPicker?: () => void };

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
  const [roleName,   setRoleName]   = useState('');
  const [clinicId,   setClinicId]   = useState('');
  const [errors,     setErrors]     = useState<UserFormErrors>({});
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState<string | null>(null);
  const birthDateRef = useRef<DateInputElement | null>(null);
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
    setRoleName(user?.role?.name ?? '');
    setClinicId('');
  }, [open, user, roles]);

  const validate = (): UserFormErrors => {
    const e: UserFormErrors = {};
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
    if (!isEdit && roleName === 'patient' && !clinicId)
      e.clinicId = 'יש לבחור מרפאה למטופל';
    return e;
  };

  const hasEditChanges = !isEdit || (() => {
    if (!user) return false;
    return (
      fullName.trim() !== user.fullName ||
      email.trim() !== user.email ||
      (phone || '') !== (user.phone || '') ||
      (gender || '') !== (user.gender || '') ||
      (birthDate || '') !== (user.birthDate?.slice(0, 10) || '') ||
      (roleName || '') !== (user.role?.name || '')
    );
  })();

  const handleSave = async () => {
    if (!hasEditChanges) return;
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
          roleName:   roleName  || undefined,
        });
      } else {
        await (props as CreateProps).onSave({
          fullName: fullName.trim(),
          email:    email.trim(),
          password,
          phone:     phone     || undefined,
          gender:    gender    || undefined,
          birthDate: birthDate || undefined,
          roleName:  roleName  || undefined,
          clinicId:  roleName === 'patient' ? (clinicId || undefined) : undefined,
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
      <DialogTitle sx={userFormDialogTitleSx}>
        {isEdit ? 'עריכת משתמש' : 'משתמש חדש'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={userFormDialogStackSx}>

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
                      onClick={() => birthDateRef.current?.showPicker?.()}
                      sx={userFormCalendarButtonSx(!!birthDate)}
                    >
                      <CalendarTodayIcon sx={userFormCalendarIconSx} />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: userFormDateInputSx,
              },
            }}
          />

          <TextField
            {...fieldSx}
            select
            label="תפקיד"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          >
            <MenuItem value="">— בחר תפקיד —</MenuItem>
            {roles.map((r) => (
              <MenuItem key={r.id} value={r.name}>{ROLE_LABELS[r.name] ?? r.name}</MenuItem>
            ))}
          </TextField>

          {!isEdit && (() => {
            const selectedRole = roleName;
            const needsClinic = selectedRole === 'patient';
            return needsClinic ? (
              <TextField
                {...fieldSx}
                select
                label="מרפאה"
                value={clinicId}
                onChange={(e) => {
                  setClinicId(e.target.value);
                  setErrors((p) => ({ ...p, clinicId: undefined }));
                }}
                required
                error={!!errors.clinicId}
                helperText={errors.clinicId}
              >
                <MenuItem value="">— בחר מרפאה —</MenuItem>
                {clinics.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>
            ) : null;
          })()}

          {Object.keys(errors).length > 0 && (
            <Typography sx={userFormValidationTextSx}>
              יש לתקן את השגיאות המסומנות לפני השמירה
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={userFormDialogActionsSx}>
        <Button onClick={onClose} disabled={saving}>ביטול</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || !hasEditChanges}>
          {saving ? 'שומר...' : 'שמור'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormDialog;
