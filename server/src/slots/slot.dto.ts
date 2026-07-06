export type SlotStatusDto = 'scheduled' | 'cancelled';

export interface BookSlotInput {
  caregiverId: string;
  patientUserId: string;
  date: string;
  time: string;
  hasReferral?: boolean;
}

export interface SlotPatientDto {
  patientId: string;
  userId: string;
  fullName: string;
  idNumber?: string;
  gender?: string;
  age?: number;
}

export interface SlotTherapistDto {
  caregiverId: string;
  fullName: string;
  specialization: string;
}

/** Audit info: who performed actions on the slot. Never denotes ownership. */
export interface SlotAuditDto {
  createdByUserId?: string;
  cancelledByUserId?: string;
}

export interface SlotDto {
  id: string;
  date: string;
  time: string;
  slotTime: string;
  status: SlotStatusDto;
  /** The appointment owner. */
  patient: SlotPatientDto;
  /** The assigned therapist. */
  therapist: SlotTherapistDto;
  /** Actor/audit metadata — distinct from owner (`patient`). */
  audit: SlotAuditDto;
}

export interface SlotTimeDto {
  time: string;
  available: boolean;
}

export interface SlotAvailabilityDto {
  date: string;
  caregiverId: string;
  slots: SlotTimeDto[];
}

export interface TherapistOptionDto {
  caregiverId: string;
  fullName: string;
  specialization: string;
}

export interface BookablePatientDto {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  patientId?: string;
}

export interface PaginatedDto<T> {
  items: T[];
  total: number;
  page: number;
  hasMore: boolean;
}
