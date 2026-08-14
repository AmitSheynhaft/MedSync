import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  registerDoctor,
  registerPatient,
  registerSecretary,
} from "../../../api/authApi";
import { getClinics, type Clinic } from "../../../api/clinics";
import { saveUserDataSession } from "../../../auth/userDataSessionStore";
import { markWelcomePending } from "../../../components/SystemInfoModal/welcomeFlag";
import { homeForRole } from "../../../auth/viewAs";
import { Role } from "../../../constants/roles";
import type { RegisterRole } from "../types";

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPassword = (v: string) =>
  v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v);
const isValidPhone = (v: string) =>
  /^0[0-9]{1,2}[-\s]?[0-9]{3}[-\s]?[0-9]{4}$/.test(v.trim());
const isValidIsraeliId = (v: string) => /^\d{9}$/.test(v.trim());

export function useRegisterForm(role: RegisterRole) {
  const navigate = useNavigate();

  const isDoctor = role === Role.Doctor;
  const isSecretary = role === Role.Secretary;
  const isPatient = role === Role.Patient;

  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [idOrLicense, setIdOrLicense] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [hmo, setHmo] = useState("");
  const [address, setAddress] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getClinics()
      .then(setClinics)
      .catch(() => setClinics([]));
  }, []);

  const handleNext = () => {
    setError(null);
    if (!fullName.trim()) {
      setError("׳©׳ ׳׳׳ ׳”׳•׳ ׳©׳“׳” ׳—׳•׳‘׳”");
      return;
    }
    if (fullName.trim().length < 2) {
      setError("׳©׳ ׳׳׳ ׳—׳™׳™׳‘ ׳׳”׳›׳™׳ ׳׳₪׳—׳•׳× 2 ׳×׳•׳•׳™׳");
      return;
    }
    if (!email.trim()) {
      setError("׳׳™׳׳™׳™׳ ׳”׳•׳ ׳©׳“׳” ׳—׳•׳‘׳”");
      return;
    }
    if (!isValidEmail(email)) {
      setError("׳›׳×׳•׳‘׳× ׳”׳׳™׳׳™׳™׳ ׳׳™׳ ׳” ׳×׳§׳™׳ ׳”");
      return;
    }
    if (!password) {
      setError("׳¡׳™׳¡׳׳” ׳”׳™׳ ׳©׳“׳” ׳—׳•׳‘׳”");
      return;
    }
    if (!isValidPassword(password)) {
      setError("׳”׳¡׳™׳¡׳׳” ׳—׳™׳™׳‘׳× ׳׳”׳›׳™׳ ׳׳₪׳—׳•׳× 8 ׳×׳•׳•׳™׳, ׳׳•׳× ׳’׳“׳•׳׳” ׳׳—׳× ׳•׳׳¡׳₪׳¨ ׳׳—׳“");
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
      setError("׳™׳© ׳׳׳©׳¨ ׳׳× ׳×׳ ׳׳™ ׳”׳©׳™׳׳•׳© ׳•׳׳“׳™׳ ׳™׳•׳× ׳”׳₪׳¨׳˜׳™׳•׳×");
      return;
    }
    if (isDoctor && !specialization.trim()) {
      setError("׳”׳×׳׳—׳•׳× ׳”׳™׳ ׳©׳“׳” ׳—׳•׳‘׳”");
      return;
    }
    if (isDoctor && !idOrLicense.trim()) {
      setError("׳׳¡׳₪׳¨ ׳¨׳™׳©׳™׳•׳ ׳”׳•׳ ׳©׳“׳” ׳—׳•׳‘׳”");
      return;
    }
    if (isSecretary) {
      if (!idOrLicense.trim()) {
        setError("׳×׳¢׳•׳“׳× ׳–׳”׳•׳× ׳”׳™׳ ׳©׳“׳” ׳—׳•׳‘׳”");
        return;
      }
      if (!isValidIsraeliId(idOrLicense)) {
        setError("׳×׳¢׳•׳“׳× ׳”׳–׳”׳•׳× ׳—׳™׳™׳‘׳× ׳׳”׳›׳™׳ 9 ׳¡׳₪׳¨׳•׳×");
        return;
      }
    }
    if (isPatient && idOrLicense.trim() && !isValidIsraeliId(idOrLicense)) {
      setError("׳×׳¢׳•׳“׳× ׳”׳–׳”׳•׳× ׳—׳™׳™׳‘׳× ׳׳”׳›׳™׳ 9 ׳¡׳₪׳¨׳•׳×");
      return;
    }
    if (!phone.trim()) {
      setError("׳˜׳׳₪׳•׳ ׳”׳•׳ ׳©׳“׳” ׳—׳•׳‘׳”");
      return;
    }
    if (!isValidPhone(phone)) {
      setError("׳׳¡׳₪׳¨ ׳”׳˜׳׳₪׳•׳ ׳׳™׳ ׳• ׳×׳§׳™׳ (׳׳“׳•׳’׳׳”: 050-1234567)");
      return;
    }
    if (isPatient && !hmo.trim()) {
      setError("׳§׳•׳₪׳× ׳—׳•׳׳™׳ ׳”׳™׳ ׳©׳“׳” ׳—׳•׳‘׳”");
      return;
    }
    if (isPatient && !address.trim()) {
      setError("׳›׳×׳•׳‘׳× ׳”׳™׳ ׳©׳“׳” ׳—׳•׳‘׳”");
      return;
    }
    if (!clinicId) {
      setError("׳™׳© ׳׳‘׳—׳•׳¨ ׳׳¨׳₪׳׳”");
      return;
    }
    setSubmitting(true);
    try {
      const result = isSecretary
        ? await registerSecretary({
            role: Role.Secretary,
            fullName,
            email,
            password,
            idNumber: idOrLicense.trim(),
            clinicId,
            phone: phone || undefined,
            birthDate: birthDate || undefined,
            gender: gender || undefined,
          })
        : isDoctor
          ? await registerDoctor({
              role: Role.Doctor,
              fullName,
              email,
              password,
              licenseNumber: idOrLicense.trim(),
              specialization: specialization.trim(),
              phone: phone || undefined,
              birthDate: birthDate || undefined,
              gender: gender || undefined,
              clinicId: clinicId || undefined,
            })
          : await registerPatient({
              role: Role.Patient,
              fullName,
              email,
              password,
              idNumber: idOrLicense.trim() || undefined,
              address: address || "",
              hmo: hmo || undefined,
              phone: phone || undefined,
              birthDate: birthDate || undefined,
              gender: gender || undefined,
              clinicId: clinicId || undefined,
            });
      saveUserDataSession(result);
      markWelcomePending();
      navigate(homeForRole(result.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "׳”׳¨׳©׳׳” ׳ ׳›׳©׳׳”");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    step,
    agreed,
    setAgreed,
    fullName,
    setFullName,
    idOrLicense,
    setIdOrLicense,
    email,
    setEmail,
    password,
    setPassword,
    specialization,
    setSpecialization,
    phone,
    setPhone,
    birthDate,
    setBirthDate,
    gender,
    setGender,
    hmo,
    setHmo,
    address,
    setAddress,
    clinicId,
    setClinicId,
    clinics,
    submitting,
    error,
    handleNext,
    handleBack,
    handleSubmit,
  };
}

export type RegisterFormState = ReturnType<typeof useRegisterForm>;
