import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession, loadSession, saveSession } from '../../../api/auth';
import { getMe, updateMe, User } from '../../../api/users';
import { getCaregiver } from '../../../api/caregivers';
import { getPatientById, updatePatient } from '../../../api/patients';
import { useToast } from '../../../hooks/useToast';
import { toDateInput } from '../utils';

export function useProfile() {
  const navigate = useNavigate();
  const session = loadSession();
  const role = (session?.role as 'patient' | 'doctor' | undefined) ?? 'patient';
  const isPatient = !!session?.patientId;

  const [user, setUser] = useState<User | null>(null);
  const [idNumber, setIdNumber] = useState('');
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [hmo, setHmo] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast, setToast, showToast } = useToast();

  useEffect(() => {
    if (!session) return;
    getMe()
      .then(u => {
        setUser(u);
        setPhone(u.phone ?? '');
        setBirthDate(toDateInput(u.birthDate));
      })
      .catch(() => setUser(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.role]);

  useEffect(() => {
    if (session?.role === 'doctor' && session?.caregiverId) {
      getCaregiver(session.caregiverId)
        .then(c => setIdNumber(c.licenseNumber ?? ''))
        .catch(() => setIdNumber(''));
    } else {
      setIdNumber('');
    }
  }, [session?.role, session?.caregiverId]);

  useEffect(() => {
    if (session?.patientId) {
      getPatientById(session.patientId)
        .then(p => {
          setHmo(p.hmo ?? '');
          setAddress(p.address ?? '');
        })
        .catch(() => {
          setHmo('');
          setAddress('');
        });
    }
  }, [session?.patientId]);

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
    if (!session) return;
    setSaving(true);
    try {
      const updated = await updateMe({
        phone: phone.trim() || undefined,
        birthDate: birthDate || undefined,
      });
      setUser(updated);
      if (isPatient && session?.patientId) {
        await updatePatient(session.patientId, {
          phone: phone.trim() || undefined,
          hmo: hmo.trim() || undefined,
          address: address.trim() || undefined,
        });
      }
      if (session) {
        saveSession({ ...session, fullName: updated.fullName, email: updated.email });
      }
      setEditing(false);
      showToast('success', 'פרופיל עודכן.');
    } catch {
      showToast('error', 'שמירת שינויים נכשלה.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  return {
    session, role, isPatient, user, idNumber,
    editing, phone, setPhone, birthDate, setBirthDate,
    hmo, setHmo, address, setAddress,
    saving, toast, setToast,
    handleEdit, handleCancel, handleSave, handleLogout,
  };
}
