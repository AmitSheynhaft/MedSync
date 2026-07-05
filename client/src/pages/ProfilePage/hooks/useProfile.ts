import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../api/authApi';
import { loadUserDataSession, saveUserDataSession } from '../../../auth/userDataSessionStore';
import { getMe, updateMe, User } from '../../../api/users';
import { getCaregiver } from '../../../api/caregivers';
import { getPatientById, updatePatient } from '../../../api/patients';
import { getClinics } from '../../../api/clinics';
import { useToast } from '../../../hooks/useToast';
import { toDateInput } from '../utils';

export function useProfile() {
  const navigate = useNavigate();
  const userDataSession = loadUserDataSession();
  const role = (userDataSession?.role as 'patient' | 'doctor' | undefined) ?? 'patient';
  const isPatient = !!userDataSession?.patientId;

  const [user, setUser] = useState<User | null>(null);
  const [idNumber, setIdNumber] = useState('');
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [hmo, setHmo] = useState('');
  const [address, setAddress] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast, setToast, showToast } = useToast();

  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    if (userDataSession) {
      getMe()
        .then(u => {
          setUser(u);
          setPhone(u.phone ?? '');
          setBirthDate(toDateInput(u.birthDate));
        })
        .catch(() => setUser(null));
    }

    if (userDataSession?.role === 'doctor' && userDataSession?.caregiverId) {
      getCaregiver(userDataSession.caregiverId)
        .then(c => setIdNumber(c.licenseNumber ?? ''))
        .catch(() => setIdNumber(''));
    } else {
      setIdNumber('');
    }

    if (userDataSession?.role === 'doctor' && userDataSession?.clinicId) {
      getClinics()
        .then(clinics => {
          const match = clinics.find(c => c.id === userDataSession.clinicId);
          setClinicName(match?.name ?? '');
        })
        .catch(() => setClinicName(''));
    }

    if (userDataSession?.patientId) {
      getPatientById(userDataSession.patientId)
        .then(p => {
          setHmo(p.hmo ?? '');
          setAddress(p.address ?? '');
        })
        .catch(() => {
          setHmo('');
          setAddress('');
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = () => {
    setPhone(user?.phone ?? '');
    setBirthDate(toDateInput(user?.birthDate));
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setPhone(user?.phone ?? '');
    setBirthDate(toDateInput(user?.birthDate));
  };

  const handleSave = async () => {
    if (!userDataSession) return;
    setSaving(true);
    try {
      const updated = await updateMe({
        phone: phone.trim() || undefined,
        birthDate: birthDate || undefined,
      });
      setUser(updated);
      if (isPatient && userDataSession?.patientId) {
        await updatePatient(userDataSession.patientId, {
          phone: phone.trim() || undefined,
          hmo: hmo.trim() || undefined,
          address: address.trim() || undefined,
        });
      }
      if (userDataSession) {
        saveUserDataSession({ ...userDataSession, fullName: updated.fullName, email: updated.email });
      }
      setEditing(false);
      showToast('success', 'פרופיל עודכן.');
    } catch {
      showToast('error', 'שמירת שינויים נכשלה.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return {
    session: userDataSession, role, isPatient, user, idNumber,
    editing, phone, setPhone, birthDate, setBirthDate,
    hmo, setHmo, address, setAddress, clinicName,
    saving, toast, setToast,
    handleEdit, handleCancel, handleSave, handleLogout,
  };
}
