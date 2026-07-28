import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../api/authApi';
import { loadUserDataSession, saveUserDataSession } from '../../../auth/userDataSessionStore';
import { resetSessionVerification } from '../../../auth/verifySession';
import { updateMe, User } from '../../../api/users';
import { updatePatient } from '../../../api/patients';
import { getEffectiveRole } from '../../../auth/viewAs';
import { Role } from '../../../constants/roles';
import { useToast } from '../../../hooks/useToast';
import { toDateInput } from '../utils';
import { loadProfileBootstrapData } from './useProfileBootstrap';

export function useProfile() {
  const navigate = useNavigate();
  const userDataSession = loadUserDataSession();
  const effectiveRole = getEffectiveRole();
  const role = effectiveRole ?? userDataSession?.role ?? Role.Patient;
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
    if (!userDataSession) return;

    let active = true;
    loadProfileBootstrapData(userDataSession).then(data => {
      if (!active) return;

      setUser(data.user);
      setPhone(data.user?.phone ?? '');
      setBirthDate(toDateInput(data.user?.birthDate));
      setIdNumber(data.idNumber);
      setClinicName(data.clinicName);
      setHmo(data.hmo);
      setAddress(data.address);
    });

    return () => {
      active = false;
    };
  }, [userDataSession]);

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
    resetSessionVerification();
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
