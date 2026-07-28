import { getCaregiver } from '../../../api/caregivers';
import { getClinics } from '../../../api/clinics';
import { getPatientById } from '../../../api/patients';
import { getMe, User } from '../../../api/users';
import { Role } from '../../../constants/roles';
import type { AuthResult } from '../../../auth/types';

export interface ProfileBootstrapData {
  user: User | null;
  idNumber: string;
  clinicName: string;
  hmo: string;
  address: string;
}

async function loadCurrentUser(): Promise<User | null> {
  try {
    return await getMe();
  } catch {
    return null;
  }
}

async function loadDoctorIdNumber(session: AuthResult): Promise<string> {
  if (session.role !== Role.Doctor || !session.caregiverId) return '';
  try {
    const caregiver = await getCaregiver(session.caregiverId);
    return caregiver.licenseNumber ?? '';
  } catch {
    return '';
  }
}

async function loadDoctorClinicName(session: AuthResult): Promise<string> {
  if (session.role !== Role.Doctor || !session.clinicId) return '';
  try {
    const clinics = await getClinics();
    const match = clinics.find(clinic => clinic.id === session.clinicId);
    return match?.name ?? '';
  } catch {
    return '';
  }
}

async function loadPatientDetails(session: AuthResult): Promise<Pick<ProfileBootstrapData, 'hmo' | 'address'>> {
  if (!session.patientId) return { hmo: '', address: '' };
  try {
    const patient = await getPatientById(session.patientId);
    return {
      hmo: patient.hmo ?? '',
      address: patient.address ?? '',
    };
  } catch {
    return { hmo: '', address: '' };
  }
}

export async function loadProfileBootstrapData(session: AuthResult): Promise<ProfileBootstrapData> {
  const [user, idNumber, clinicName, patientDetails] = await Promise.all([
    loadCurrentUser(),
    loadDoctorIdNumber(session),
    loadDoctorClinicName(session),
    loadPatientDetails(session),
  ]);

  return {
    user,
    idNumber,
    clinicName,
    hmo: patientDetails.hmo,
    address: patientDetails.address,
  };
}
