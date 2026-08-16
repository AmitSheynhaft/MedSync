import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  apiRequest,
  apiBlob,
} from './client';
import { Paginated } from './pagination';

export type RecordingStatus =
  | 'PENDING'
  | 'RECORDING'
  | 'PROCESSING'
  | 'TRANSCRIBED'
  | 'AI_PROCESSING'
  | 'AI_SUCCESS'
  | 'AI_PARTIAL_SUCCESS'
  | 'FAILED';

export type VisitSummaryType = 'RECORDING' | 'MANUAL_INPUT';

export interface VisitCaregiver {
  id: string;
  userId: string;
  specialization?: string;
  user?: {
    fullName: string;
    email: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
  };
}

export interface VisitDiagnosisEntry {
  diagnosis?: {
    id: string;
    code: string;
    description: string;
  };
  note?: string;
}

export interface VisitMedicineEntry {
  medicine?: {
    id: string;
    name: string;
  };
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  caregiverId: string;
  slotId?: string;
  visitDate: string;
  bloodPressure?: string;
  pulse?: string;
  bodyTemp?: string;
  weight?: string;
  height?: string;
  oxygenSat?: string;
  chiefComplaint?: string;
  visitType?: string;
  followUpDate?: string;
  referralNotes?: string;
  createdAt: string;
  updatedAt: string;
  recording?: {
    id: string;
    visitId: string;
    status: RecordingStatus;
    audioUrl: string;
    transcriptText?: string;
  };
  summary?: {
    id: string;
    visitId: string;
    summaryText: string;
    visitType: VisitSummaryType;
  };
  patient?: {
    id: string;
    idNumber?: string;
    hmo?: string;
    bloodType?: string;
    user?: {
      fullName: string;
      email: string;
      phone?: string;
      birthDate?: string;
      gender?: string;
    };
  };
  caregiver?: VisitCaregiver;
  diagnoses?: VisitDiagnosisEntry[];
  medicines?: VisitMedicineEntry[];
}

export interface CreateVisitInput {
  patientId: string;
  slotId?: string;
  visitDate: string;
  bloodPressure?: string;
  pulse?: string;
  bodyTemp?: string;
  weight?: string;
  height?: string;
  oxygenSat?: string;
  chiefComplaint?: string;
  visitType?: string;
  followUpDate?: string;
  referralNotes?: string;
}

export interface VisitRecordingInput {
  status?: RecordingStatus;
  audioUrl: string;
  transcriptText?: string;
}

export interface VisitSummaryInput {
  summaryText: string;
  visitType: VisitSummaryType;
}

export interface VisitDiagnosisInput {
  diagnosisId?: string;
  diagnosisCode?: string;
  diagnosisDescription?: string;
  note?: string;
}

export interface VisitMedicineInput {
  medicineId?: string;
  medicineName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface VisitListParams {
  patientId?: string;
  caregiverId?: string;
  page?: number;
  limit?: number;
}

// ── AI endpoints ──────────────────────────────────
export interface VisitSummaryObject {
  patientComplaints: string;
  diagnosis: string;
  doctorsRecommendations: string;
  vitals?: {
    bloodPressure?: string;
    pulse?: string;
    bodyTemp?: string;
    weight?: string;
    height?: string;
    oxygenSat?: string;
  };
  medicines?: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  diagnoses?: {
    description: string;
    note?: string;
  }[];
}

export function transcribeAudio(audioBlob: Blob): Promise<{ transcript: string; summary: VisitSummaryObject }> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  return apiRequest('/api/visits/transcribe', {
    method: 'POST',
    body: formData,
  });
}

// ── CRUD endpoints ────────────────────────────────
export const getVisits = (params: { patientId?: string; caregiverId?: string } = {}) => {
  return getVisitsPage({
    patientId: params.patientId,
    caregiverId: params.caregiverId,
    page: 1,
    limit: 20,
  }).then((response) => response.items);
};

export const getVisitsPage = ({
  patientId,
  caregiverId,
  page = 1,
  limit = 20,
}: VisitListParams = {}) => {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (patientId) qs.set('patientId', patientId);
  if (caregiverId) qs.set('caregiverId', caregiverId);
  return apiGet<Paginated<Visit>>(`/api/visits-records?${qs.toString()}`);
};
export const getVisit = (id: string) =>
  apiGet<Visit>(`/api/visits-records/${id}`);
export const createVisit = (input: CreateVisitInput) =>
  apiPost<Visit>('/api/visits-records', input);
export const updateVisit = (id: string, input: Partial<CreateVisitInput>) =>
  apiPatch<Visit>(`/api/visits-records/${id}`, input);
export const deleteVisit = (id: string) =>
  apiDelete<void>(`/api/visits-records/${id}`);

export const upsertVisitRecording = (id: string, input: VisitRecordingInput) =>
  apiPut(`/api/visits-records/${id}/recording`, input);
export const upsertVisitSummary = (id: string, input: VisitSummaryInput) =>
  apiPut(`/api/visits-records/${id}/summary`, input);
export const addVisitDiagnosis = (id: string, input: VisitDiagnosisInput) =>
  apiPost(`/api/visits-records/${id}/diagnoses`, input);
export const removeVisitDiagnosis = (id: string, diagnosisId: string) =>
  apiDelete<void>(`/api/visits-records/${id}/diagnoses/${diagnosisId}`);
export const addVisitMedicine = (id: string, input: VisitMedicineInput) =>
  apiPost(`/api/visits-records/${id}/medicines`, input);
export const removeVisitMedicine = (id: string, medicineId: string) =>
  apiDelete<void>(`/api/visits-records/${id}/medicines/${medicineId}`);

export const downloadVisitSummaryPdf = (id: string) =>
  apiBlob(`/api/visits-records/${id}/summary-pdf`);
