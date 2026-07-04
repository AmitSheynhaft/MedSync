import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../api/authApi';
import { saveUserDataSession } from '../../../auth/userDataSessionStore';
import { setViewAs, homeForRole } from '../../../auth/viewAs';

export function useLoginForm(role?: string) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('נדרשים אימייל וסיסמה');
      return;
    }
    setSubmitting(true);
    try {
      const userData = await login(email, password, role);
      saveUserDataSession(userData);
      setViewAs(userData.role);
      navigate(homeForRole(userData.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'התחברות נכשלה');
    } finally {
      setSubmitting(false);
    }
  };

  return { email, setEmail, password, setPassword, submitting, error, handleSubmit };
}
