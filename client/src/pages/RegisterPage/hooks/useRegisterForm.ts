import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerDoctor, registerPatient, registerSecretary, registerAdmin } from '../../../api/authApi';
import { getClinics, type Clinic } from '../../../api/clinics';
import { saveUserDataSession } from '../../../auth/userDataSessionStore';
import { markWelcomePending } from '../../../components/SystemInfoModal/welcomeFlag';
import { homeForRole } from '../../../auth/viewAs';
import { Role } from '../../../constants/roles';
import type { RegisterRole } from '../types';

export function useRegisterForm(role: RegisterRole) {
  const navigate = useNavigate();

  const isDoctor = role === Role.Doctor;
  const isSecretary = role === Role.Secretary;
  const isPatient = role === Role.Patient;
  const isAdmin = role === Role.Admin;

  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState('');
  const [idOrLicense, setIdOrLicense] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [hmo, setHmo] = useState('');
  const [address, setAddress] = useState('');
  const [clinicId, setClinicId] = useState('');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getClinics().then(setClinics).catch(() => setClinics([]));
  }, []);

  const handleNext = () => {
    setError(null);
    if (!fullName || !email || !password) {
      setError('שם מלא, אימייל וסיסמה הם שדות חובה');
      return;
    }
    setStep(1);
  };

  const handleBack = () => {
    setError(null);
    setStep(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError('יש לאשר את תנאי השימוש ומדיניות הפרטיות');
      return;
    }
    if (isDoctor && !specialization.trim()) {
      setError('התמחות היא שדה חובה');
      return;
    }
    if (isDoctor && !idOrLicense.trim()) {
      setError('מספר רישיון הוא שדה חובה');
      return;
    }
    if (isSecretary && !idOrLicense.trim()) {
      setError('תעודת זהות היא שדה חובה');
      return;
    }
    if (!isAdmin && !phone.trim()) {
      setError('טלפון הוא שדה חובה');
      return;
    }
    if (isPatient && !hmo.trim()) {
      setError('קופת חולים היא שדה חובה');
      return;
    }
    if (isPatient && !address.trim()) {
      setError('כתובת היא שדה חובה');
      return;
    }
    if (!isAdmin && !clinicId) {
      setError('יש לבחור מרפאה');
      return;
    }
    setSubmitting(true);
    try {
      const result = isAdmin
        ? await registerAdmin({ role: Role.Admin, fullName, email, password, phone: phone || undefined })
        : isSecretary
        ? await registerSecretary({ role: Role.Secretary, fullName, email, password, idNumber: idOrLicense.trim(), clinicId, phone: phone || undefined, birthDate: birthDate || undefined, gender: gender || undefined })
        : isDoctor
        ? await registerDoctor({ role: Role.Doctor, fullName, email, password, licenseNumber: idOrLicense || 'TBD', specialization: specialization || 'General', phone: phone || undefined, birthDate: birthDate || undefined, gender: gender || undefined, clinicId: clinicId || undefined })
        : await registerPatient({ role: Role.Patient, fullName, email, password, idNumber: idOrLicense || undefined, address: address || '', hmo: hmo || undefined, phone: phone || undefined, birthDate: birthDate || undefined, gender: gender || undefined, clinicId: clinicId || undefined });
      saveUserDataSession(result);
      markWelcomePending();
      navigate(homeForRole(result.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'הרשמה נכשלה');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    step, agreed, setAgreed,
    fullName, setFullName,
    idOrLicense, setIdOrLicense,
    email, setEmail,
    password, setPassword,
    specialization, setSpecialization,
    phone, setPhone,
    birthDate, setBirthDate,
    gender, setGender,
    hmo, setHmo,
    address, setAddress,
    clinicId, setClinicId,
    clinics,
    submitting, error,
    handleNext, handleBack, handleSubmit,
  };
}

export type RegisterFormState = ReturnType<typeof useRegisterForm>;
