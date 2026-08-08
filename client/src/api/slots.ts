import { apiDelete, apiGet, apiPost } from './client';
import { Paginated } from './pagination';

export type { Paginated } from './pagination';

export type SlotStatus = 'scheduled' | 'cancelled';

export interface SlotPatient {
  patientId: string;
  userId: string;
  fullName: string;
  idNumber?: string;
  gender?: string;
  age?: number;
}

export interface SlotTherapist {
  caregiverId: string;
  fullName: string;
  specialization: string;
}

/** Actor/audit metadata for a slot. Never denotes ownership. */
export interface SlotAudit {
  createdByUserId?: string;
  cancelledByUserId?: string;
}

export interface Slot {
  id: string;
  date: string;
  time: string;
  slotTime: string;
  status: SlotStatus;
  /** The appointment owner. */
  patient: SlotPatient;
  /** The assigned therapist. */
  therapist: SlotTherapist;
  /** Actor/audit metadata — distinct from owner (`patient`). */
  audit: SlotAudit;
}

export interface SlotTimeOption {
  time: string;
  available: boolean;
}

export interface SlotAvailability {
  date: string;
  caregiverId: string;
  slots: SlotTimeOption[];
}

export interface TherapistOption {
  caregiverId: string;
  fullName: string;
  specialization: string;
}

export interface BookablePatient {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  patientId?: string;
}

export interface BookSlotInput {
  caregiverId: string;
  patientUserId: string;
  date: string;
  time: string;
  hasReferral?: boolean;
}

export function bookSlot(input: BookSlotInput): Promise<Slot> {
  return apiPost<Slot>('/api/slots/book', input);
}

export function getTherapistOptions(
  search = '',
  page = 1,
): Promise<Paginated<TherapistOption>> {
  const params = new URLSearchParams({ page: String(page), limit: '20' });
  if (search) params.set('search', search);
  return apiGet<Paginated<TherapistOption>>(`/api/slots/therapists?${params}`);
}

export function getBookablePatients(
  search = '',
  page = 1,
): Promise<Paginated<BookablePatient>> {
  const params = new URLSearchParams({ page: String(page), limit: '20' });
  if (search) params.set('search', search);
  return apiGet<Paginated<BookablePatient>>(`/api/slots/patients?${params}`);
}

export function getAvailability(
  caregiverId: string,
  date: string,
): Promise<SlotAvailability> {
  const params = new URLSearchParams({ caregiverId, date });
  return apiGet<SlotAvailability>(`/api/slots/availability?${params}`);
}

export function getCaregiverSlots(date: string): Promise<Slot[]> {
  const params = new URLSearchParams({ date });
  return apiGet<Slot[]>(`/api/slots/caregiver?${params}`);
}

export function getUpcomingPatientSlots(): Promise<Slot[]> {
  return apiGet<Slot[]>('/api/slots/patient/upcoming');
}

export function getUpcomingPatientSlotsPage(
  page = 1,
  limit = 20,
): Promise<Paginated<Slot>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiGet<Paginated<Slot>>(`/api/slots/patient/upcoming?${params.toString()}`);
}

export function getPastPatientSlots(): Promise<Slot[]> {
  return apiGet<Slot[]>('/api/slots/patient/past');
}

export function getPastPatientSlotsPage(
  page = 1,
  limit = 20,
): Promise<Paginated<Slot>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiGet<Paginated<Slot>>(`/api/slots/patient/past?${params.toString()}`);
}

export function getCancelledPatientSlots(): Promise<Slot[]> {
  return apiGet<Slot[]>('/api/slots/patient/cancelled');
}

export function getCancelledPatientSlotsPage(
  page = 1,
  limit = 20,
): Promise<Paginated<Slot>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiGet<Paginated<Slot>>(`/api/slots/patient/cancelled?${params.toString()}`);
}

export function getSecretaryUpcomingSlots(): Promise<Slot[]> {
  return apiGet<Slot[]>('/api/slots/secretary/upcoming');
}

export function getSecretaryUpcomingSlotsPage(
  page = 1,
  limit = 20,
): Promise<Paginated<Slot>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiGet<Paginated<Slot>>(`/api/slots/secretary/upcoming?${params.toString()}`);
}

export function getSecretaryPastSlots(): Promise<Slot[]> {
  return apiGet<Slot[]>('/api/slots/secretary/past');
}

export function getSecretaryPastSlotsPage(
  page = 1,
  limit = 20,
): Promise<Paginated<Slot>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiGet<Paginated<Slot>>(`/api/slots/secretary/past?${params.toString()}`);
}

export function deleteSlotAsSecretary(id: string): Promise<void> {
  return apiDelete<void>(`/api/slots/secretary/${id}`);
}

export function cancelSlotAsPatient(id: string): Promise<void> {
  return apiDelete<void>(`/api/slots/patient/${id}`);
}
